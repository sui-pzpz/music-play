package com.xx.music.controller.admin;

import com.xx.music.common.R;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/logs")
public class AdminLogController {

    @GetMapping
    public R<Void> list() {
        return R.ok();
    }
}