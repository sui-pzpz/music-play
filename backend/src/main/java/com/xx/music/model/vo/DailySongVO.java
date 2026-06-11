package com.xx.music.model.vo;

import lombok.Data;

import java.util.List;

@Data
public class DailySongVO {

    private String songId;
    private String name;
    private List<ArtistVO> artists;
    private String coverUrl;
    private Integer duration;
    private String reason;
}
