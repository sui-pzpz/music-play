package com.xx.music.controller.admin;

import com.xx.music.common.R;
import com.xx.music.model.dto.CreateSongDTO;
import com.xx.music.model.dto.UpdateSongDTO;
import com.xx.music.model.dto.UpdateStatusDTO;
import com.xx.music.model.vo.AdminSongListVO;
import com.xx.music.model.vo.SongDetailVO;
import com.xx.music.model.vo.SongVO;
import com.xx.music.service.AdminLogService;
import com.xx.music.service.AdminSongService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/songs")
@RequiredArgsConstructor
public class AdminSongController {

    private final AdminSongService adminSongService;
    private final AdminLogService adminLogService;

    @GetMapping
    public R<AdminSongListVO> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Integer isVip,
            @RequestParam(required = false) String artistId,
            @RequestParam(required = false) String albumId,
            @RequestParam(defaultValue = "created_at") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder) {
        AdminSongListVO songs = adminSongService.getSongs(page, size, keyword, status, isVip, artistId, albumId, sortBy, sortOrder);
        return R.ok(songs);
    }

    @GetMapping("/{songId}")
    public R<SongDetailVO> detail(@PathVariable String songId) {
        SongDetailVO song = adminSongService.getSongDetail(songId);
        return R.ok(song);
    }

    @PostMapping
    public R<SongVO> create(Authentication authentication,
                            @Valid @RequestBody CreateSongDTO dto) {
        Long adminId = getAdminId(authentication);
        SongVO song = adminSongService.createSong(dto, adminId);
        adminLogService.log(adminId, "create_song", "song", song.getSongId(), "新增歌曲: " + song.getName(), null);
        return R.ok(song);
    }

    @PutMapping("/{songId}")
    public R<SongVO> update(Authentication authentication,
                            @PathVariable String songId,
                            @Valid @RequestBody UpdateSongDTO dto) {
        Long adminId = getAdminId(authentication);
        SongVO song = adminSongService.updateSong(songId, dto, adminId);
        adminLogService.log(adminId, "update_song", "song", songId, null, null);
        return R.ok(song);
    }

    @PutMapping("/{songId}/status")
    public R<Void> updateStatus(Authentication authentication,
                                @PathVariable String songId,
                                @Valid @RequestBody UpdateStatusDTO dto) {
        Long adminId = getAdminId(authentication);
        adminSongService.updateSongStatus(songId, dto, adminId);
        adminLogService.log(adminId, "update_song_status", "song", songId,
                "状态变更为: " + dto.getStatus(), null);
        return R.ok();
    }

    @DeleteMapping("/{songId}")
    public R<Void> delete(Authentication authentication, @PathVariable String songId) {
        Long adminId = getAdminId(authentication);
        adminSongService.deleteSong(songId, adminId);
        adminLogService.log(adminId, "delete_song", "song", songId, null, null);
        return R.ok();
    }

    private Long getAdminId(Authentication authentication) {
        String principal = authentication.getPrincipal().toString();
        return Long.parseLong(principal.replace("admin:", ""));
    }
}
