package com.xx.music.service.impl;

import com.xx.music.model.entity.Admin;
import com.xx.music.model.entity.AdminLog;
import com.xx.music.model.vo.AdminDashboardVO;
import com.xx.music.repository.*;
import com.xx.music.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final SongRepository songRepository;
    private final PlaylistRepository playlistRepository;
    private final OrderRepository orderRepository;
    private final PlayHistoryRepository playHistoryRepository;
    private final AdminLogRepository adminLogRepository;
    private final AdminRepository adminRepository;

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

        // 最近操作记录（最近10条）
        List<AdminLog> recentLogs = adminLogRepository.findAll(
                PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt")))
                .getContent();
        List<AdminDashboardVO.RecentAction> recentActions = recentLogs.stream()
                .map(log -> {
                    AdminDashboardVO.RecentAction action = new AdminDashboardVO.RecentAction();
                    Admin admin = adminRepository.findById(log.getAdminId()).orElse(null);
                    action.setAdminUsername(admin != null ? admin.getUsername() : "未知");
                    action.setAction(log.getAction());
                    action.setTarget(log.getTargetType() + ":" + log.getTargetId());
                    action.setTime(log.getCreatedAt());
                    return action;
                })
                .collect(Collectors.toList());
        vo.setRecentActions(recentActions);

        return vo;
    }
}
