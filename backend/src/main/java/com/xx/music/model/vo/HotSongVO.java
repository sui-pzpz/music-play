package com.xx.music.model.vo;

import lombok.Data;

import java.util.List;

@Data
public class HotSongVO {

    private Integer rank;
    private String songId;
    private String name;
    private List<ArtistVO> artists;
    private Long playCount;
}
