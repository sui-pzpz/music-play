package com.xx.music.service.impl;

import com.xx.music.common.BusinessException;
import com.xx.music.model.dto.LoginDTO;
import com.xx.music.model.dto.RegisterDTO;
import com.xx.music.model.entity.User;
import com.xx.music.model.vo.AuthVO;
import com.xx.music.model.vo.TokenVO;
import com.xx.music.repository.UserRepository;
import com.xx.music.security.JwtTokenProvider;
import com.xx.music.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final AtomicLong SEQUENCE = new AtomicLong(0);
    private static final int MAX_LOGIN_FAIL = 5;
    private static final int LOCK_MINUTES = 30;

    @Override
    @Transactional
    public AuthVO register(RegisterDTO dto) {
        // 检查手机号是否已注册
        userRepository.findByPhoneAndDeletedAtIsNull(dto.getPhone())
                .ifPresent(u -> {
                    throw new BusinessException("手机号已注册");
                });

        // 生成UID: U + yyyyMMdd + 4位序列号
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long seq = SEQUENCE.incrementAndGet() % 10000;
        String uid = "U" + datePart + String.format("%04d", seq);

        // 创建用户
        User user = new User();
        user.setUid(uid);
        user.setPhone(dto.getPhone());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setNickname(dto.getNickname() != null ? dto.getNickname() : "用户" + uid);
        user.setAvatar("");
        user.setGender(0);
        user.setStatus(1);
        user.setLoginFailCount(0);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        // 生成令牌
        String accessToken = jwtTokenProvider.generateAccessToken(uid);
        String refreshToken = jwtTokenProvider.generateRefreshToken(uid);

        // 存储refreshToken到Redis
        redisTemplate.opsForValue().set(
                "refresh_token:" + uid,
                refreshToken,
                jwtTokenProvider.getExpiration() * 2,
                TimeUnit.SECONDS
        );

        return buildAuthVO(user, accessToken, refreshToken);
    }

    @Override
    @Transactional
    public AuthVO login(LoginDTO dto, String ip) {
        // 查找用户
        User user = userRepository.findByPhoneAndDeletedAtIsNull(dto.getPhone())
                .orElseThrow(() -> new BusinessException("手机号或密码错误"));

        // 检查用户状态
        if (user.getStatus() != 1) {
            throw new BusinessException("账号已被禁用");
        }

        // 检查是否被锁定
        if (user.getLockUntil() != null && LocalDateTime.now().isBefore(user.getLockUntil())) {
            throw new BusinessException("账号已锁定，请30分钟后重试");
        }

        // 验证密码
        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            // 登录失败，增加失败次数
            int failCount = (user.getLoginFailCount() == null ? 0 : user.getLoginFailCount()) + 1;
            user.setLoginFailCount(failCount);
            if (failCount >= MAX_LOGIN_FAIL) {
                user.setLockUntil(LocalDateTime.now().plusMinutes(LOCK_MINUTES));
            }
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);
            throw new BusinessException("手机号或密码错误");
        }

        // 登录成功，重置失败次数和锁定
        user.setLoginFailCount(0);
        user.setLockUntil(null);
        user.setLastLoginAt(LocalDateTime.now());
        user.setLastLoginIp(ip);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        // 生成令牌
        String accessToken = jwtTokenProvider.generateAccessToken(user.getUid());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getUid());

        // 存储refreshToken到Redis
        redisTemplate.opsForValue().set(
                "refresh_token:" + user.getUid(),
                refreshToken,
                jwtTokenProvider.getExpiration() * 2,
                TimeUnit.SECONDS
        );

        return buildAuthVO(user, accessToken, refreshToken);
    }

    @Override
    public void logout(String uid) {
        // 将token加入黑名单（Redis）
        redisTemplate.delete("refresh_token:" + uid);
    }

    @Override
    public TokenVO refreshToken(String refreshToken) {
        // 验证refreshToken
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new BusinessException("refreshToken无效或已过期");
        }

        String uid = jwtTokenProvider.getUidFromToken(refreshToken);

        // 验证Redis中的refreshToken
        Object cachedToken = redisTemplate.opsForValue().get("refresh_token:" + uid);
        if (cachedToken == null || !cachedToken.equals(refreshToken)) {
            throw new BusinessException("refreshToken无效或已过期");
        }

        // 检查用户存在且未删除
        User user = userRepository.findByUidAndDeletedAtIsNull(uid)
                .orElseThrow(() -> new BusinessException("用户不存在"));

        // 生成新的accessToken
        String newAccessToken = jwtTokenProvider.generateAccessToken(uid);

        TokenVO tokenVO = new TokenVO();
        tokenVO.setAccessToken(newAccessToken);
        tokenVO.setRefreshToken(refreshToken);
        tokenVO.setExpiresIn(jwtTokenProvider.getExpiration());
        return tokenVO;
    }

    private AuthVO buildAuthVO(User user, String accessToken, String refreshToken) {
        AuthVO vo = new AuthVO();
        vo.setUid(user.getUid());
        vo.setNickname(user.getNickname());
        vo.setAvatar(user.getAvatar());
        vo.setPhone(maskPhone(user.getPhone()));
        vo.setAccessToken(accessToken);
        vo.setRefreshToken(refreshToken);
        vo.setExpiresIn(jwtTokenProvider.getExpiration());
        return vo;
    }

    private String maskPhone(String phone) {
        if (phone == null || phone.length() < 7) {
            return phone;
        }
        return phone.substring(0, 3) + "****" + phone.substring(phone.length() - 4);
    }
}
