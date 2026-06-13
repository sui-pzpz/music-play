package com.xx.music.service;

import com.xx.music.model.dto.CreateSongDTO;
import com.xx.music.model.dto.UpdateSongDTO;
import com.xx.music.model.dto.UpdateStatusDTO;
import com.xx.music.model.vo.AdminSongListVO;
import com.xx.music.model.vo.SongDetailVO;
import com.xx.music.model.vo.SongVO;

public interface AdminSongService {

    AdminSongListVO getSongs(int page, int size, String keyword, Integer status, Integer isVip,
                             String artistId, String albumId, String sortBy, String sortOrder);

    SongDetailVO getSongDetail(String songId);

    SongVO createSong(CreateSongDTO dto, Long adminId);

    SongVO updateSong(String songId, UpdateSongDTO dto, Long adminId);

    void updateSongStatus(String songId, UpdateStatusDTO dto, Long adminId);

    void deleteSong(String songId, Long adminId);
}
