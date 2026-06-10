package com.xx.music.controller.user;

import com.xx.music.common.R;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/user")
public class UserController {

    @GetMapping("/profile")
    public R<Void> getProfile() {
        return R.ok();
    }

    @PutMapping("/profile")
    public R<Void> updateProfile() {
        return R.ok();
    }

    @GetMapping("/favorites")
    public R<Void> getFavorites() {
        return R.ok();
    }

    @PostMapping("/favorites/{songId}")
    public R<Void> addFavorite(@PathVariable String songId) {
        return R.ok();
    }

    @DeleteMapping("/favorites/{songId}")
    public R<Void> removeFavorite(@PathVariable String songId) {
        return R.ok();
    }
}