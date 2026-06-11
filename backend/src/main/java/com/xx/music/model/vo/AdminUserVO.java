package com.xx.music.model.vo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AdminUserVO {

    private String uid;
    private String phone;
    private String nickname;
    private String avatar;
    private Integer gender;
    private Integer status;
    private Integer memberLevel;
    private Integer loginFailCount;
    private LocalDateTime lastLoginAt;
    private LocalDateTime createdAt;
}
