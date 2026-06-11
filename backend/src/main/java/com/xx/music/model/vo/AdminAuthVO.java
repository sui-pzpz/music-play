package com.xx.music.model.vo;

import lombok.Data;

@Data
public class AdminAuthVO {

    private Long adminId;
    private String username;
    private String nickname;
    private String role;
    private String accessToken;
    private Long expiresIn;
}
