package com.xx.music.controller.song;

import com.xx.music.common.R;
import com.xx.music.model.vo.LyricVO;
import com.xx.music.model.vo.SongDetailVO;
import com.xx.music.model.vo.StreamVO;
import com.xx.music.service.SongService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/song")
@RequiredArgsConstructor
public class SongController {

    private final SongService songService;

    @GetMapping("/{id}")
    public R<SongDetailVO> getSongDetail(@PathVariable String id) {
        SongDetailVO song = songService.getSongDetail(id);
        return R.ok(song);
    }

    @GetMapping("/{id}/lyric")
    public R<LyricVO> getLyric(@PathVariable String id) {
        LyricVO lyric = songService.getLyric(id);
        return R.ok(lyric);
    }

    @GetMapping("/{id}/stream")
    public R<StreamVO> getStream(
            @PathVariable String id,
            @RequestParam(defaultValue = "standard") String quality,
            Authentication authentication) {
        String uid = authentication != null ? (String) authentication.getPrincipal() : null;
        StreamVO stream = songService.getStream(id, quality, uid);
        return R.ok(stream);
    }
}
