package com.xx.music.controller.playlist;

import com.xx.music.common.R;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/playlist")
public class PlaylistController {

    @PostMapping
    public R<Void> create() {
        return R.ok();
    }

    @GetMapping("/{id}")
    public R<Void> getDetail(@PathVariable String id) {
        return R.ok();
    }

    @PutMapping("/{id}")
    public R<Void> update(@PathVariable String id) {
        return R.ok();
    }

    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable String id) {
        return R.ok();
    }

    @PostMapping("/{id}/songs")
    public R<Void> addSongs(@PathVariable String id) {
        return R.ok();
    }

    @DeleteMapping("/{id}/songs/{songId}")
    public R<Void> removeSong(@PathVariable String id, @PathVariable String songId) {
        return R.ok();
    }
}