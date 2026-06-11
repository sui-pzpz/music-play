package com.xx.music.model.vo;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class AdminSongVO {

    private String songId;
    private String name;
    private List<ArtistDetailVO> artists;
    private AlbumVO album;
    private Integer duration;
    private Long playCount;
    private Boolean isVip;
    private Integer status;
    private String source;
    private LocalDateTime createdAt;
}
