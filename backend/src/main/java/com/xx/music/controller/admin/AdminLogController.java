package com.xx.music.controller.admin;

import com.xx.music.common.PageResult;
import com.xx.music.common.R;
import com.xx.music.model.vo.AdminLogVO;
import com.xx.music.service.AdminLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/logs")
@RequiredArgsConstructor
public class AdminLogController {

    private final AdminLogService adminLogService;

    @GetMapping
    public R<PageResult<AdminLogVO>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageResult<AdminLogVO> logs = adminLogService.getLogs(page, size);
        return R.ok(logs);
    }
}
