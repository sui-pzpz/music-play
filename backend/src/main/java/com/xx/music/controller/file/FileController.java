package com.xx.music.controller.file;

import com.xx.music.common.R;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/file")
public class FileController {

    @PostMapping("/upload")
    public R<Void> upload() {
        return R.ok();
    }
}