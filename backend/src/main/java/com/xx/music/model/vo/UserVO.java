package com.xx.music.model.vo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserVO {

    private String uid;
    private String phone;
    private String nickname;
    private String avatar;
    private Integer gender;
    private String birthday;
    private String signature;
    private Integer status;
    private Integer memberLevel;
    private LocalDateTime createdAt;
}
