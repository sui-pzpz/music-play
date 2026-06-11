package com.xx.music.model.vo;

import lombok.Data;

@Data
public class AuthVO {

    private String uid;
    private String phone;
    private String nickname;
    private String avatar;
    private Integer gender;
    private String accessToken;
    private Long expiresIn;
}
