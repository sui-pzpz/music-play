package com.xx.music.model.vo;

import lombok.Data;

@Data
public class PlaylistSongResultVO {

    private String playlistId;
    private Integer songCount;
    private Integer addedCount;
}
