package com.xx.music.service;

import com.xx.music.dto.LoginRequest;
import com.xx.music.dto.LoginResponse;
import com.xx.music.dto.RefreshRequest;
import com.xx.music.dto.RegisterRequest;
import com.xx.music.dto.ResetPasswordRequest;
import com.xx.music.entity.User;
import com.xx.music.repository.UserRepository;
import com.xx.music.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.concurrent.ThreadLocalRandom;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final SmsService smsService;

    /**
     * 密码登录
     */
    @Transactional
    public LoginResponse loginByPassword(LoginRequest request) {
        // 查找用户（account 可以是手机号）
        User user = userRepository.findByPhoneAndDeletedAtIsNull(request.getAccount())
                .orElseThrow(() -> new IllegalArgumentException("账号或密码错误"));

        // 检查账号状态
        if (user.getStatus() != null && user.getStatus() == 0) {
            throw new IllegalArgumentException("账号已被禁用");
        }

        // 检查锁定
        if (user.getLockUntil() != null && user.getLockUntil().isAfter(LocalDateTime.now())) {
            long remainingSeconds = java.time.Duration.between(LocalDateTime.now(), user.getLockUntil()).getSeconds();
            throw new IllegalStateException("账号已锁定，请" + remainingSeconds + "秒后重试");
        }

        // 校验密码
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            // 密码错误，更新失败计数
            int newFailCount = (user.getLoginFailCount() == null ? 0 : user.getLoginFailCount()) + 1;
            user.setLoginFailCount(newFailCount);

            if (newFailCount >= 10) {
                user.setLockUntil(LocalDateTime.now().plusMinutes(10));
                user.setLoginFailCount(newFailCount);
                userRepository.save(user);
                throw new IllegalStateException("密码错误次数过多，账号已锁定10分钟");
            } else if (newFailCount >= 5) {
                user.setLockUntil(LocalDateTime.now().plusMinutes(1));
                userRepository.save(user);
                throw new IllegalStateException("密码错误次数过多，请1分钟后重试");
            } else {
                userRepository.save(user);
                throw new IllegalArgumentException("密码错误，还剩" + (5 - newFailCount) + "次机会");
            }
        }

        // 登录成功，重置失败计数
        user.setLoginFailCount(0);
        user.setLockUntil(null);
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        return buildLoginResponse(user);
    }

    /**
     * 验证码登录
     */
    @Transactional
    public LoginResponse loginBySms(LoginRequest request) {
        // 校验验证码
        smsService.verifyCode(request.getPhone(), request.getCode());

        // 查找用户
        User user = userRepository.findByPhoneAndDeletedAtIsNull(request.getPhone())
                .orElseThrow(() -> new IllegalArgumentException("该手机号未注册"));

        // 检查账号状态
        if (user.getStatus() != null && user.getStatus() == 0) {
            throw new IllegalArgumentException("账号已被禁用");
        }

        // 更新登录时间
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        return buildLoginResponse(user);
    }

    /**
     * 注册
     */
    @Transactional
    public void register(RegisterRequest request) {
        // 校验验证码
        smsService.verifyCode(request.getPhone(), request.getCode());

        // 检查手机号是否已注册
        if (userRepository.existsByPhoneAndDeletedAtIsNull(request.getPhone())) {
            throw new IllegalArgumentException("该手机号已注册");
        }

        // 创建用户
        LocalDateTime now = LocalDateTime.now();
        User user = User.builder()
                .uid(generateUid())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname("用户" + ThreadLocalRandom.current().nextInt(1000, 9999))
                .gender((short) 0)
                .status((short) 1)
                .loginFailCount(0)
                .createdAt(now)
                .updatedAt(now)
                .build();

        userRepository.save(user);
        log.info("用户注册成功: uid={}, phone={}", user.getUid(), user.getPhone());
    }

    /**
     * 重置密码
     */
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        // 校验验证码
        smsService.verifyCode(request.getPhone(), request.getCode());

        // 查找用户
        User user = userRepository.findByPhoneAndDeletedAtIsNull(request.getPhone())
                .orElseThrow(() -> new IllegalArgumentException("该手机号未注册"));

        // 更新密码
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setLoginFailCount(0);
        user.setLockUntil(null);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        log.info("用户重置密码成功: uid={}", user.getUid());
    }

    /**
     * 刷新 Token
     */
    public LoginResponse refreshToken(RefreshRequest request) {
        String refreshToken = request.getRefreshToken();

        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new IllegalArgumentException("refreshToken无效或已过期");
        }

        String uid = jwtTokenProvider.getUidFromToken(refreshToken);
        User user = userRepository.findByUidAndDeletedAtIsNull(uid)
                .orElseThrow(() -> new IllegalArgumentException("用户不存在"));

        if (user.getStatus() != null && user.getStatus() == 0) {
            throw new IllegalArgumentException("账号已被禁用");
        }

        String newAccessToken = jwtTokenProvider.generateAccessToken(uid);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(uid);

        return LoginResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .expiresIn(jwtTokenProvider.getExpiration())
                .uid(user.getUid())
                .nickname(user.getNickname())
                .avatar(user.getAvatar())
                .build();
    }

    private LoginResponse buildLoginResponse(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(user.getUid());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getUid());

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(jwtTokenProvider.getExpiration())
                .uid(user.getUid())
                .nickname(user.getNickname())
                .avatar(user.getAvatar())
                .build();
    }

    private String generateUid() {
        return "U" + (100000 + ThreadLocalRandom.current().nextInt(900000));
    }
}
