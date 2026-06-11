package com.xx.music.model.vo;

import lombok.Data;

import java.util.List;

@Data
public class SongDetailVO {

    private String songId;
    private String name;
    private List<ArtistDetailVO> artists;
    private AlbumVO album;
    private Integer duration;
    private Boolean isVip;
    private Boolean hasStandard;
    private Boolean hasHigh;
    private Boolean hasLossless;
    private Long playCount;
    private String lyricUrl;
    private String tlyricUrl;
    private String source;
}
