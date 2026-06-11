package com.xx.music.model.vo;

import lombok.Data;

import java.util.List;

@Data
public class PersonalizedVO {

    private List<DailySongVO> dailySongs;
    private List<RecommendPlaylistVO> recommendPlaylists;
}
