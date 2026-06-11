package com.xx.music.service;

import com.xx.music.common.PageResult;
import com.xx.music.model.vo.HotKeywordsVO;
import com.xx.music.model.vo.SearchResultVO;
import com.xx.music.model.vo.SongVO;

public interface SearchService {

    SearchResultVO search(String keyword, String type, int page, int size, String uid, String ip);

    PageResult<SongVO> searchSong(String keyword, int page, int size);

    HotKeywordsVO getHotKeywords();
}
