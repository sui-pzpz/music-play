package com.xx.music.controller.admin;

import com.xx.music.common.R;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminAuthController {

    @PostMapping("/login")
    public R<Void> login() {
        return R.ok();
    }

    @PostMapping("/logout")
    public R<Void> logout() {
        return R.ok();
    }

    @GetMapping("/profile")
    public R<Void> profile() {
        return R.ok();
    }

    @GetMapping("/dashboard")
    public R<Void> dashboard() {
        return R.ok();
    }
}