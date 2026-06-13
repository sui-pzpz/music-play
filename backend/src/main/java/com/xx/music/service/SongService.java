package com.xx.music.service;

import com.xx.music.model.vo.LyricVO;
import com.xx.music.model.vo.SongDetailVO;
import com.xx.music.model.vo.StreamVO;

public interface SongService {

    SongDetailVO getSongDetail(String songId);

    LyricVO getLyric(String songId);

    StreamVO getStream(String songId, String quality, String uid);
}
