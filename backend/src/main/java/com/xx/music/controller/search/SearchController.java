package com.xx.music.controller.search;

import com.xx.music.common.R;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/search")
public class SearchController {

    @GetMapping
    public R<Void> search() {
        return R.ok();
    }

    @GetMapping("/song")
    public R<Void> searchSong() {
        return R.ok();
    }

    @GetMapping("/hot")
    public R<Void> hotKeywords() {
        return R.ok();
    }
}