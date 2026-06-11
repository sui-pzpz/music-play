package com.xx.music.model.vo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AdminLogVO {

    private String id;
    private String adminUsername;
    private String action;
    private String targetType;
    private String targetId;
    private String detail;
    private String ip;
    private LocalDateTime createdAt;
}
