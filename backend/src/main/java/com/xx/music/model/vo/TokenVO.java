package com.xx.music.model.vo;

import lombok.Data;

@Data
public class TokenVO {

    private String accessToken;
    private Long expiresIn;
}
