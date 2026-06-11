package com.xx.music.model.vo;

import com.xx.music.common.PageResult;
import lombok.Data;

import java.util.List;

@Data
public class AdminUserListVO {

    private List<AdminUserVO> list;
    private PageResult.Pagination pagination;
    private AdminUserStatsVO statistics;
}
