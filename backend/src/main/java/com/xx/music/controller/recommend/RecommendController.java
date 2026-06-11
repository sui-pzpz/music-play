package com.xx.music.controller.recommend;

import com.xx.music.common.R;
import com.xx.music.model.vo.HotVO;
import com.xx.music.model.vo.NewSongVO;
import com.xx.music.model.vo.PersonalizedVO;
import com.xx.music.service.RecommendService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/recommend")
@RequiredArgsConstructor
public class RecommendController {

    private final RecommendService recommendService;

    @GetMapping("/personalized")
    public R<PersonalizedVO> personalized(
            Authentication authentication,
            @RequestParam(defaultValue = "30") int size) {
        String uid = (String) authentication.getPrincipal();
        PersonalizedVO recommend = recommendService.getPersonalized(uid, size);
        return R.ok(recommend);
    }

    @GetMapping("/hot")
    public R<HotVO> hot(
            @RequestParam(defaultValue = "daily") String type,
            @RequestParam(defaultValue = "50") int size) {
        HotVO hot = recommendService.getHot(type, size);
        return R.ok(hot);
    }

    @GetMapping("/new")
    public R<List<NewSongVO>> newSongs(@RequestParam(defaultValue = "30") int size) {
        List<NewSongVO> songs = recommendService.getNewSongs(size);
        return R.ok(songs);
    }
}
