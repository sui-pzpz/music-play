package com.xx.music.service;

import com.xx.music.model.dto.AddSongsDTO;
import com.xx.music.model.dto.CreatePlaylistDTO;
import com.xx.music.model.dto.UpdatePlaylistDTO;
import com.xx.music.model.vo.PlaylistDetailVO;
import com.xx.music.model.vo.PlaylistSongResultVO;
import com.xx.music.model.vo.PlaylistVO;

public interface PlaylistService {

    PlaylistVO create(String uid, CreatePlaylistDTO dto);

    PlaylistDetailVO getDetail(String playlistId, int page, int size);

    PlaylistVO update(String uid, String playlistId, UpdatePlaylistDTO dto);

    void delete(String uid, String playlistId);

    PlaylistSongResultVO addSongs(String uid, String playlistId, AddSongsDTO dto);

    void removeSong(String uid, String playlistId, String songId);
}
