package com.xx.music.service.impl;

import com.xx.music.common.PageResult;
import com.xx.music.model.entity.AdminLog;
import com.xx.music.model.vo.AdminLogVO;
import com.xx.music.repository.AdminLogRepository;
import com.xx.music.service.AdminLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminLogServiceImpl implements AdminLogService {

    private final AdminLogRepository adminLogRepository;

    @Override
    public void log(Long adminId, String action, String targetType, String targetId, String detail, String ip) {
        AdminLog adminLog = new AdminLog();
        adminLog.setAdminId(adminId);
        adminLog.setAction(action);
        adminLog.setTargetType(targetType);
        adminLog.setTargetId(targetId);
        adminLog.setDetail(detail);
        adminLog.setIp(ip);
        adminLog.setCreatedAt(LocalDateTime.now());
        adminLogRepository.save(adminLog);
    }

    @Override
    public PageResult<AdminLogVO> getLogs(int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<AdminLog> logPage = adminLogRepository.findAll(pageable);

        List<AdminLogVO> voList = logPage.getContent().stream()
                .map(log -> {
                    AdminLogVO vo = new AdminLogVO();
                    vo.setId(log.getId());
                    vo.setAdminId(log.getAdminId());
                    vo.setAction(log.getAction());
                    vo.setTargetType(log.getTargetType());
                    vo.setTargetId(log.getTargetId());
                    vo.setDetail(log.getDetail());
                    vo.setIp(log.getIp());
                    vo.setCreatedAt(log.getCreatedAt());
                    return vo;
                })
                .collect(Collectors.toList());

        return PageResult.of(voList, logPage.getTotalElements(), page, size);
    }
}
