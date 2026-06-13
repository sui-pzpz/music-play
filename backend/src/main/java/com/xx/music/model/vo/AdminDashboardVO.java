package com.xx.music.model.vo;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class AdminDashboardVO {

    private long totalUsers;
    private long todayNewUsers;
    private long totalSongs;
    private long activeSongs;
    private long totalPlaylists;
    private long todayPlayCount;
    private List<RecentAction> recentActions;

    @Data
    public static class RecentAction {
        private String adminUsername;
        private String action;
        private String target;
        private LocalDateTime time;
    }
}
