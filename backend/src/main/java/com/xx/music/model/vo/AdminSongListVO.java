package com.xx.music.model.vo;

import com.xx.music.common.PageResult;
import lombok.Data;

import java.util.List;

@Data
public class AdminSongListVO {

    private List<AdminSongVO> list;
    private PageResult.Pagination pagination;
    private AdminSongStatsVO statistics;
}
