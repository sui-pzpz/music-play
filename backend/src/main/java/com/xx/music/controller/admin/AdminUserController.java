package com.xx.music.controller.admin;

import com.xx.music.common.R;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/users")
public class AdminUserController {

    @GetMapping
    public R<Void> list() {
        return R.ok();
    }

    @GetMapping("/{uid}")
    public R<Void> detail(@PathVariable String uid) {
        return R.ok();
    }

    @PutMapping("/{uid}")
    public R<Void> update(@PathVariable String uid) {
        return R.ok();
    }

    @PutMapping("/{uid}/status")
    public R<Void> updateStatus(@PathVariable String uid) {
        return R.ok();
    }

    @DeleteMapping("/{uid}")
    public R<Void> delete(@PathVariable String uid) {
        return R.ok();
    }

    @GetMapping("/{uid}/history")
    public R<Void> history(@PathVariable String uid) {
        return R.ok();
    }

    @GetMapping("/{uid}/favorites")
    public R<Void> favorites(@PathVariable String uid) {
        return R.ok();
    }
}