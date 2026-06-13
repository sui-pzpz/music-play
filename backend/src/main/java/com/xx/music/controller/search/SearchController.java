package com.xx.music.controller.search;

import com.xx.music.common.PageResult;
import com.xx.music.common.R;
import com.xx.music.model.vo.HotKeywordsVO;
import com.xx.music.model.vo.SearchResultVO;
import com.xx.music.model.vo.SongVO;
import com.xx.music.service.SearchService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    public R<SearchResultVO> search(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "song") String type,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication,
            HttpServletRequest request) {
        String uid = authentication != null ? (String) authentication.getPrincipal() : null;
        String ip = request.getRemoteAddr();
        SearchResultVO result = searchService.search(keyword, type, page, size, uid, ip);
        return R.ok(result);
    }

    @GetMapping("/song")
    public R<PageResult<SongVO>> searchSong(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageResult<SongVO> result = searchService.searchSong(keyword, page, size);
        return R.ok(result);
    }

    @GetMapping("/hot")
    public R<HotKeywordsVO> hotKeywords() {
        HotKeywordsVO keywords = searchService.getHotKeywords();
        return R.ok(keywords);
    }
}
