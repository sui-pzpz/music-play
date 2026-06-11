package com.xx.music.controller.auth;

import com.xx.music.common.R;
import com.xx.music.model.dto.LoginDTO;
import com.xx.music.model.dto.RefreshTokenDTO;
import com.xx.music.model.dto.RegisterDTO;
import com.xx.music.model.vo.AuthVO;
import com.xx.music.model.vo.TokenVO;
import com.xx.music.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public R<AuthVO> register(@Valid @RequestBody RegisterDTO dto) {
        AuthVO auth = authService.register(dto);
        return R.ok(auth);
    }

    @PostMapping("/login")
    public R<AuthVO> login(@Valid @RequestBody LoginDTO dto, HttpServletRequest request) {
        String ip = getClientIp(request);
        AuthVO auth = authService.login(dto, ip);
        return R.ok(auth);
    }

    @PostMapping("/logout")
    public R<Void> logout(@RequestAttribute(required = false) String uid) {
        if (uid != null) {
            authService.logout(uid);
        }
        return R.ok();
    }

    @PostMapping("/refresh")
    public R<TokenVO> refresh(@Valid @RequestBody RefreshTokenDTO dto) {
        TokenVO token = authService.refreshToken(dto.getRefreshToken());
        return R.ok(token);
    }

    @PostMapping("/oauth/callback")
    public R<Void> oauthCallback() {
        return R.ok(); // TODO: implement OAuth
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}
