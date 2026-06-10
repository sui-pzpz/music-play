package com.xx.music.controller.admin;

import com.xx.music.common.R;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/songs")
public class AdminSongController {

    @GetMapping
    public R<Void> list() {
        return R.ok();
    }

    @GetMapping("/{songId}")
    public R<Void> detail(@PathVariable String songId) {
        return R.ok();
    }

    @PostMapping
    public R<Void> create() {
        return R.ok();
    }

    @PutMapping("/{songId}")
    public R<Void> update(@PathVariable String songId) {
        return R.ok();
    }

    @PutMapping("/{songId}/status")
    public R<Void> updateStatus(@PathVariable String songId) {
        return R.ok();
    }

    @DeleteMapping("/{songId}")
    public R<Void> delete(@PathVariable String songId) {
        return R.ok();
    }
}