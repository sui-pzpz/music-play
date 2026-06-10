package com.xx.music.controller.song;

import com.xx.music.common.R;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/song")
public class SongController {

    @GetMapping("/{id}")
    public R<Void> getSongDetail(@PathVariable String id) {
        return R.ok();
    }

    @GetMapping("/{id}/lyric")
    public R<Void> getLyric(@PathVariable String id) {
        return R.ok();
    }

    @GetMapping("/{id}/stream")
    public R<Void> getStream(@PathVariable String id) {
        return R.ok();
    }
}