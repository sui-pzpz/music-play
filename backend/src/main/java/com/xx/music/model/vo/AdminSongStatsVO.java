package com.xx.music.model.vo;

import lombok.Data;

@Data
public class AdminSongStatsVO {

    private long totalSongs;
    private long onlineSongs;
    private long offlineSongs;
    private long vipSongs;
}
