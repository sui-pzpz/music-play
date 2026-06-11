package com.xx.music.model.vo;

import lombok.Data;

@Data
public class RecommendPlaylistVO {

    private String playlistId;
    private String name;
    private String cover;
    private Integer songCount;
}
