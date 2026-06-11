package com.xx.music.model.vo;

import lombok.Data;

@Data
public class AdminUserStatsVO {

    private long totalUsers;
    private long activeUsers;
    private long disabledUsers;
    private long todayRegistered;
}
