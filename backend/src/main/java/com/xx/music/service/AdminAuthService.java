package com.xx.music.service;

import com.xx.music.model.dto.AdminLoginDTO;
import com.xx.music.model.vo.AdminAuthVO;

public interface AdminAuthService {

    AdminAuthVO login(AdminLoginDTO dto, String ip);

    AdminAuthVO getProfile(Long adminId);
}
