package com.xx.music.model.vo;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class AdminDashboardVO {

    private UserStats userStats;
    private SongStats songStats;
    private List<RecentAction> recentActions;

    @Data
    public static class UserStats {

        private long totalUsers;
        private long todayRegistrations;
        private long activeToday;
        private long vipUsers;
    }

    @Data
    public static class SongStats {

        private long totalSongs;
        private long onlineSongs;
        private long vipSongs;
        private long totalPlayCount;
    }

    @Data
    public static class RecentAction {

        private String admin;
        private String action;
        private String target;
        private LocalDateTime time;
    }
}
