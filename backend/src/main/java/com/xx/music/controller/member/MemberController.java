package com.xx.music.controller.member;

import com.xx.music.common.R;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/member")
public class MemberController {

    @GetMapping("/info")
    public R<Void> getMemberInfo() {
        return R.ok();
    }

    @PostMapping("/renew")
    public R<Void> renew() {
        return R.ok();
    }
}