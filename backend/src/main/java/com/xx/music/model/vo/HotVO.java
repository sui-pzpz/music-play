package com.xx.music.model.vo;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class HotVO {

    private String type;
    private String name;
    private LocalDateTime updateTime;
    private List<HotSongVO> songs;
}
