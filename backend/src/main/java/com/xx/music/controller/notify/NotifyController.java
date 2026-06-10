package com.xx.music.controller.notify;

import com.xx.music.common.R;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notify")
public class NotifyController {

    @GetMapping("/list")
    public R<Void> list() {
        return R.ok();
    }

    @PutMapping("/{id}/read")
    public R<Void> markRead(@PathVariable Long id) {
        return R.ok();
    }
}