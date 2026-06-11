package com.xx.music.service.impl;

import com.xx.music.common.BusinessException;
import com.xx.music.model.dto.AdminLoginDTO;
import com.xx.music.model.entity.Admin;
import com.xx.music.model.vo.AdminAuthVO;
import com.xx.music.repository.AdminRepository;
import com.xx.music.security.JwtTokenProvider;
import com.xx.music.service.AdminAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdminAuthServiceImpl implements AdminAuthService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    @Transactional
    public AdminAuthVO login(AdminLoginDTO dto, String ip) {
        // 查找管理员
        Admin admin = adminRepository.findByUsername(dto.getUsername())
                .orElseThrow(() -> new BusinessException("用户名或密码错误"));

        // 验证密码
        if (!passwordEncoder.matches(dto.getPassword(), admin.getPassword())) {
            throw new BusinessException("用户名或密码错误");
        }

        // 检查状态
        if (admin.getStatus() != null && admin.getStatus() != 1) {
            throw new BusinessException("账号已被禁用");
        }

        // 更新登录信息
        admin.setLastLoginAt(LocalDateTime.now());
        admin.setLastLoginIp(ip);
        adminRepository.save(admin);

        // 生成令牌
        String token = jwtTokenProvider.generateAccessToken("admin:" + admin.getId());

        AdminAuthVO vo = new AdminAuthVO();
        vo.setAdminId(admin.getId());
        vo.setUsername(admin.getUsername());
        vo.setNickname(admin.getNickname());
        vo.setAvatar(admin.getAvatar());
        vo.setRole(admin.getRole());
        vo.setToken(token);
        vo.setExpiresIn(jwtTokenProvider.getExpiration());
        return vo;
    }

    @Override
    public AdminAuthVO getProfile(Long adminId) {
        Admin admin = adminRepository.findById(adminId)
                .orElseThrow(() -> new BusinessException("管理员不存在"));

        AdminAuthVO vo = new AdminAuthVO();
        vo.setAdminId(admin.getId());
        vo.setUsername(admin.getUsername());
        vo.setNickname(admin.getNickname());
        vo.setAvatar(admin.getAvatar());
        vo.setRole(admin.getRole());
        return vo;
    }
}
