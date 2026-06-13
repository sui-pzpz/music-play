package com.xx.music.service;

import com.xx.music.model.vo.HotVO;
import com.xx.music.model.vo.NewSongVO;
import com.xx.music.model.vo.PersonalizedVO;

import java.util.List;

public interface RecommendService {

    PersonalizedVO getPersonalized(String uid, int size);

    HotVO getHot(String type, int size);

    List<NewSongVO> getNewSongs(int size);
}
