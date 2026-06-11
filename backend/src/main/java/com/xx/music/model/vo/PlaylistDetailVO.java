package com.xx.music.model.vo;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class PlaylistDetailVO {

    private String playlistId;
    private String name;
    private String cover;
    private String description;
    private String creatorUid;
    private String creatorNickname;
    private Integer songCount;
    private Long playCount;
    private Long collectCount;
    private List<String> tags;
    private Boolean isOfficial;
    private List<SongVO> songs;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
