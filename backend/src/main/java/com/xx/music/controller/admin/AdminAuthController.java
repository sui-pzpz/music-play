package com.xx.music.controller.admin;

import com.xx.music.common.R;
import com.xx.music.model.dto.AdminLoginDTO;
import com.xx.music.model.vo.AdminAuthVO;
import com.xx.music.model.vo.AdminDashboardVO;
import com.xx.music.service.AdminAuthService;
import com.xx.music.service.DashboardService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminAuthController {

    private final AdminAuthService adminAuthService;
    private final DashboardService dashboardService;

    @PostMapping("/login")
    public R<AdminAuthVO> login(@Valid @RequestBody AdminLoginDTO dto,
                                HttpServletRequest request) {
        String ip = request.getRemoteAddr();
        AdminAuthVO auth = adminAuthService.login(dto, ip);
        return R.ok(auth);
    }

    @PostMapping("/logout")
    public R<Void> logout() {
        return R.ok();
    }

    @GetMapping("/profile")
    public R<AdminAuthVO> profile(Authentication authentication) {
        Long adminId = getAdminId(authentication);
        AdminAuthVO profile = adminAuthService.getProfile(adminId);
        return R.ok(profile);
    }

    @GetMapping("/dashboard")
    public R<AdminDashboardVO> dashboard() {
        AdminDashboardVO dashboard = dashboardService.getDashboard();
        return R.ok(dashboard);
    }

    private Long getAdminId(Authentication authentication) {
        String principal = authentication.getPrincipal().toString();
        return Long.parseLong(principal.replace("admin:", ""));
    }
}
