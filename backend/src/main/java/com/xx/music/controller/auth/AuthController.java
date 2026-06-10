package com.xx.music.controller.auth;

import com.xx.music.common.R;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @PostMapping("/register")
    public R<Void> register() {
        return R.ok();
    }

    @PostMapping("/login")
    public R<Void> login() {
        return R.ok();
    }

    @PostMapping("/logout")
    public R<Void> logout() {
        return R.ok();
    }

    @PostMapping("/refresh")
    public R<Void> refresh() {
        return R.ok();
    }

    @PostMapping("/oauth/callback")
    public R<Void> oauthCallback() {
        return R.ok();
    }
}