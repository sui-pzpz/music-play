package com.xx.music.model.vo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PlaylistVO {

    private String playlistId;
    private String name;
    private String description;
    private String cover;
    private Integer songCount;
    private Boolean isPublic;
    private LocalDateTime createdAt;
}
