package com.xx.music.model.vo;

import lombok.Data;

@Data
public class StreamVO {

    private String songId;
    private String url;
    private String quality;
    private Integer duration;
}
