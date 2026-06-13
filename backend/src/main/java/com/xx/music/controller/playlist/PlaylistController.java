package com.xx.music.controller.playlist;

import com.xx.music.common.R;
import com.xx.music.model.dto.AddSongsDTO;
import com.xx.music.model.dto.CreatePlaylistDTO;
import com.xx.music.model.dto.UpdatePlaylistDTO;
import com.xx.music.model.vo.PlaylistDetailVO;
import com.xx.music.model.vo.PlaylistSongResultVO;
import com.xx.music.model.vo.PlaylistVO;
import com.xx.music.service.PlaylistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/playlist")
@RequiredArgsConstructor
public class PlaylistController {

    private final PlaylistService playlistService;

    @PostMapping
    public R<PlaylistVO> create(Authentication authentication,
                                @Valid @RequestBody CreatePlaylistDTO dto) {
        String uid = (String) authentication.getPrincipal();
        PlaylistVO playlist = playlistService.create(uid, dto);
        return R.ok(playlist);
    }

    @GetMapping("/{id}")
    public R<PlaylistDetailVO> getDetail(
            @PathVariable String id,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        PlaylistDetailVO playlist = playlistService.getDetail(id, page, size);
        return R.ok(playlist);
    }

    @PutMapping("/{id}")
    public R<PlaylistVO> update(Authentication authentication,
                                @PathVariable String id,
                                @Valid @RequestBody UpdatePlaylistDTO dto) {
        String uid = (String) authentication.getPrincipal();
        PlaylistVO playlist = playlistService.update(uid, id, dto);
        return R.ok(playlist);
    }

    @DeleteMapping("/{id}")
    public R<Void> delete(Authentication authentication, @PathVariable String id) {
        String uid = (String) authentication.getPrincipal();
        playlistService.delete(uid, id);
        return R.ok();
    }

    @PostMapping("/{id}/songs")
    public R<PlaylistSongResultVO> addSongs(Authentication authentication,
                                            @PathVariable String id,
                                            @Valid @RequestBody AddSongsDTO dto) {
        String uid = (String) authentication.getPrincipal();
        PlaylistSongResultVO result = playlistService.addSongs(uid, id, dto);
        return R.ok(result);
    }

    @DeleteMapping("/{id}/songs/{songId}")
    public R<Void> removeSong(Authentication authentication,
                              @PathVariable String id,
                              @PathVariable String songId) {
        String uid = (String) authentication.getPrincipal();
        playlistService.removeSong(uid, id, songId);
        return R.ok();
    }
}
