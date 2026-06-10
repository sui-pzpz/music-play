package com.xx.music.controller.recommend;

import com.xx.music.common.R;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/recommend")
public class RecommendController {

    @GetMapping("/personalized")
    public R<Void> personalized() {
        return R.ok();
    }

    @GetMapping("/hot")
    public R<Void> hot() {
        return R.ok();
    }

    @GetMapping("/new")
    public R<Void> newSongs() {
        return R.ok();
    }
}