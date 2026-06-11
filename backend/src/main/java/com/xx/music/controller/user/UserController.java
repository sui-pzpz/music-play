package com.xx.music.controller.user;

import com.xx.music.common.PageResult;
import com.xx.music.common.R;
import com.xx.music.model.dto.UpdateProfileDTO;
import com.xx.music.model.vo.SongVO;
import com.xx.music.model.vo.UserVO;
import com.xx.music.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public R<UserVO> getProfile(Authentication authentication) {
        String uid = (String) authentication.getPrincipal();
        UserVO user = userService.getProfile(uid);
        return R.ok(user);
    }

    @PutMapping("/profile")
    public R<UserVO> updateProfile(Authentication authentication,
                                   @Valid @RequestBody UpdateProfileDTO dto) {
        String uid = (String) authentication.getPrincipal();
        UserVO user = userService.updateProfile(uid, dto);
        return R.ok(user);
    }

    @GetMapping("/favorites")
    public R<PageResult<SongVO>> getFavorites(
            Authentication authentication,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        String uid = (String) authentication.getPrincipal();
        PageResult<SongVO> favorites = userService.getFavorites(uid, page, size);
        return R.ok(favorites);
    }

    @PostMapping("/favorites/{songId}")
    public R<Void> addFavorite(Authentication authentication, @PathVariable String songId) {
        String uid = (String) authentication.getPrincipal();
        userService.addFavorite(uid, songId);
        return R.ok();
    }

    @DeleteMapping("/favorites/{songId}")
    public R<Void> removeFavorite(Authentication authentication, @PathVariable String songId) {
        String uid = (String) authentication.getPrincipal();
        userService.removeFavorite(uid, songId);
        return R.ok();
    }
}
