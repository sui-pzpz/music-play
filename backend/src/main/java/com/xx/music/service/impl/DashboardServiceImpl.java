package com.xx.music.service.impl;

import com.xx.music.model.vo.AdminDashboardVO;
import com.xx.music.repository.*;
import com.xx.music.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final SongRepository songRepository;
    private final PlaylistRepository playlistRepository;
    private final OrderRepository orderRepository;
    private final PlayHistoryRepository playHistoryRepository;

    @Override
    public AdminDashboardVO getDashboard() {
        AdminDashboardVO vo = new AdminDashboardVO();

        // 总用户数（未删除）
        vo.setTotalUsers(userRepository.countByDeletedAtIsNull());

        // 今日新增用户
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        vo.setTodayNewUsers(userRepository.countByCreatedAtAfterAndDeletedAtIsNull(todayStart));

        // 总歌曲数
        vo.setTotalSongs(songRepository.count());

        // 上架歌曲数
        vo.setActiveSongs(songRepository.countByStatus(1));

        // 总歌单数
        vo.setTotalPlaylists(playlistRepository.countByDeletedAtIsNull());

        // 今日播放次数
        vo.setTodayPlayCount(playHistoryRepository.countByPlayedAtAfter(todayStart));

        return vo;
    }
}
