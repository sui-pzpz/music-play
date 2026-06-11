package com.xx.music.model.vo;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class SongVO {

    private String songId;
    private String name;
    private List<ArtistVO> artists;
    private AlbumVO album;
    private Integer duration;
    private String coverUrl;
    private Long playCount;
    private Boolean isVip;
    private LocalDateTime favoritedAt;
    private LocalDateTime addedAt;
}
