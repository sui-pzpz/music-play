package com.xx.music.service;

import com.xx.music.common.PageResult;
import com.xx.music.model.vo.AdminLogVO;

public interface AdminLogService {

    void log(Long adminId, String action, String targetType, String targetId, String detail, String ip);

    PageResult<AdminLogVO> getLogs(int page, int size);
}
