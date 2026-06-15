package com.xx.music.controller.auth;

import com.xx.music.common.R;
import com.xx.music.dto.*;
import com.xx.music.service.AuthService;
import com.xx.music.service.SmsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final SmsService smsService;

    @PostMapping("/login")
    public R<LoginResponse> login(@RequestBody @Valid LoginRequest request) {
        LoginResponse response;
        if ("sms".equals(request.getType())) {
            response = authService.loginBySms(request);
        } else {
            response = authService.loginByPassword(request);
        }
        return R.ok(response);
    }

    @PostMapping("/register")
    public R<Void> register(@RequestBody @Valid RegisterRequest request) {
        authService.register(request);
        return R.ok();
    }

    @PostMapping("/sms/send")
    public R<Map<String, String>> sendSms(@RequestBody @Valid SmsSendRequest request) {
        String code = smsService.sendCode(request.getPhone());
        // 开发模式：返回验证码到响应中，生产环境应改为 return R.ok()
        return R.ok(Map.of("code", code));
    }

    @PostMapping("/password/reset")
    public R<Void> resetPassword(@RequestBody @Valid ResetPasswordRequest request) {
        authService.resetPassword(request);
        return R.ok();
    }

    @PostMapping("/logout")
    public R<Void> logout() {
        // JWT 无状态，前端清除 token 即可
        // 如需服务端黑名单，可在此处将 refreshToken 加入 Redis 黑名单
        return R.ok();
    }

    @PostMapping("/refresh")
    public R<LoginResponse> refresh(@RequestBody @Valid RefreshRequest request) {
        LoginResponse response = authService.refreshToken(request);
        return R.ok(response);
    }

    @PostMapping("/oauth/callback")
    public R<Void> oauthCallback() {
        // TODO: OAuth 第三方登录，待后续实现
        return R.ok();
    }
}
