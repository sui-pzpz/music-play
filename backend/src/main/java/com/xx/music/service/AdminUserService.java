package com.xx.music.service;

import com.xx.music.common.PageResult;
import com.xx.music.model.dto.UpdateProfileDTO;
import com.xx.music.model.dto.UpdateStatusDTO;
import com.xx.music.model.entity.PlayHistory;
import com.xx.music.model.vo.AdminUserListVO;
import com.xx.music.model.vo.AdminUserVO;
import com.xx.music.model.vo.SongVO;

public interface AdminUserService {

    AdminUserListVO getUsers(int page, int size, String keyword, Integer status, String startDate, String endDate);

    AdminUserVO getUserDetail(String uid);

    AdminUserVO updateUser(String uid, UpdateProfileDTO dto);

    void updateUserStatus(String uid, UpdateStatusDTO dto, Long adminId);

    void deleteUser(String uid, Long adminId);

    PageResult<PlayHistory> getUserHistory(String uid, int page, int size);

    PageResult<SongVO> getUserFavorites(String uid, int page, int size);
}
