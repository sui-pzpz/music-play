package com.xx.music.controller.admin;

import com.xx.music.common.PageResult;
import com.xx.music.common.R;
import com.xx.music.model.dto.UpdateProfileDTO;
import com.xx.music.model.dto.UpdateStatusDTO;
import com.xx.music.model.vo.AdminUserListVO;
import com.xx.music.model.vo.AdminUserVO;
import com.xx.music.model.vo.SongVO;
import com.xx.music.service.AdminLogService;
import com.xx.music.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;
    private final AdminLogService adminLogService;

    @GetMapping
    public R<AdminUserListVO> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        AdminUserListVO users = adminUserService.getUsers(page, size, keyword, status, startDate, endDate);
        return R.ok(users);
    }

    @GetMapping("/{uid}")
    public R<AdminUserVO> detail(@PathVariable String uid) {
        AdminUserVO user = adminUserService.getUserDetail(uid);
        return R.ok(user);
    }

    @PutMapping("/{uid}")
    public R<AdminUserVO> update(Authentication authentication,
                                 @PathVariable String uid,
                                 @RequestBody UpdateProfileDTO dto) {
        Long adminId = getAdminId(authentication);
        AdminUserVO user = adminUserService.updateUser(uid, dto);
        adminLogService.log(adminId, "update_user", "user", uid, "编辑用户信息", null);
        return R.ok(user);
    }

    @PutMapping("/{uid}/status")
    public R<Void> updateStatus(
            Authentication authentication,
            @PathVariable String uid,
            @Valid @RequestBody UpdateStatusDTO dto) {
        Long adminId = getAdminId(authentication);
        adminUserService.updateUserStatus(uid, dto, adminId);
        adminLogService.log(adminId, "update_user_status", "user", uid,
                "状态变更为: " + dto.getStatus() + (dto.getReason() != null ? ", 原因: " + dto.getReason() : ""),
                null);
        return R.ok();
    }

    @DeleteMapping("/{uid}")
    public R<Void> delete(Authentication authentication, @PathVariable String uid) {
        Long adminId = getAdminId(authentication);
        adminUserService.deleteUser(uid, adminId);
        adminLogService.log(adminId, "delete_user", "user", uid, null, null);
        return R.ok();
    }

    @GetMapping("/{uid}/history")
    public R<?> history(
            @PathVariable String uid,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return R.ok(adminUserService.getUserHistory(uid, page, size));
    }

    @GetMapping("/{uid}/favorites")
    public R<PageResult<SongVO>> favorites(
            @PathVariable String uid,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return R.ok(adminUserService.getUserFavorites(uid, page, size));
    }

    private Long getAdminId(Authentication authentication) {
        String principal = authentication.getPrincipal().toString();
        return Long.parseLong(principal.replace("admin:", ""));
    }
}
