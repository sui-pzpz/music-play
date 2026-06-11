package com.xx.music.service;

import com.xx.music.model.dto.LoginDTO;
import com.xx.music.model.dto.RegisterDTO;
import com.xx.music.model.vo.AuthVO;
import com.xx.music.model.vo.TokenVO;

public interface AuthService {

    AuthVO register(RegisterDTO dto);

    AuthVO login(LoginDTO dto, String ip);

    void logout(String uid);

    TokenVO refreshToken(String refreshToken);
}
