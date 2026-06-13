package com.xx.music.service;

import com.xx.music.common.PageResult;
import com.xx.music.model.dto.UpdateProfileDTO;
import com.xx.music.model.vo.SongVO;
import com.xx.music.model.vo.UserVO;

public interface UserService {

    UserVO getProfile(String uid);

    UserVO updateProfile(String uid, UpdateProfileDTO dto);

    PageResult<SongVO> getFavorites(String uid, int page, int size);

    void addFavorite(String uid, String songId);

    void removeFavorite(String uid, String songId);
}
