package com.xx.music.service.impl;

import com.xx.music.common.BusinessException;
import com.xx.music.model.dto.AddSongsDTO;
import com.xx.music.model.dto.CreatePlaylistDTO;
import com.xx.music.model.dto.UpdatePlaylistDTO;
import com.xx.music.model.entity.Playlist;
import com.xx.music.model.entity.PlaylistSong;
import com.xx.music.model.entity.Song;
import com.xx.music.model.entity.SongArtist;
import com.xx.music.model.vo.PlaylistDetailVO;
import com.xx.music.model.vo.PlaylistSongResultVO;
import com.xx.music.model.vo.PlaylistVO;
import com.xx.music.model.vo.SongVO;
import com.xx.music.repository.*;
import com.xx.music.service.PlaylistService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlaylistServiceImpl implements PlaylistService {

    private final PlaylistRepository playlistRepository;
    private final PlaylistSongRepository playlistSongRepository;
    private final SongRepository songRepository;
    private final UserRepository userRepository;
    private final SongArtistRepository songArtistRepository;
    private final ArtistRepository artistRepository;

    @Override
    @Transactional
    public PlaylistVO create(String uid, CreatePlaylistDTO dto) {
        String playlistId = "P" + System.currentTimeMillis() + String.format("%04d", ThreadLocalRandom.current().nextInt(10000));

        Playlist playlist = new Playlist();
        playlist.setPlaylistId(playlistId);
        playlist.setName(dto.getName());
        playlist.setCover(dto.getCover() != null ? dto.getCover() : "");
        playlist.setDescription(dto.getDescription() != null ? dto.getDescription() : "");
        playlist.setCreatorUid(uid);
        playlist.setSongCount(0);
        playlist.setPlayCount(0L);
        playlist.setCollectCount(0);
        playlist.setTags(dto.getTags() != null ? String.join(",", dto.getTags()) : "");
        playlist.setIsOfficial(0);
        playlist.setStatus(1);
        playlist.setCreatedAt(LocalDateTime.now());
        playlist.setUpdatedAt(LocalDateTime.now());
        playlistRepository.save(playlist);

        return buildPlaylistVO(playlist);
    }

    @Override
    public PlaylistDetailVO getDetail(String playlistId, int page, int size) {
        Playlist playlist = playlistRepository.findByPlaylistIdAndDeletedAtIsNull(playlistId)
                .orElseThrow(() -> new BusinessException("歌单不存在"));

        // 获取创建者昵称
        String creatorNickname = userRepository.findByUidAndDeletedAtIsNull(playlist.getCreatorUid())
                .map(u -> u.getNickname())
                .orElse("未知用户");

        // 分页获取歌曲
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<PlaylistSong> playlistSongs = playlistSongRepository
                .findByPlaylistIdOrderBySortOrderAsc(playlist.getId(), pageable);

        List<SongVO> songVOList = playlistSongs.getContent().stream()
                .map(ps -> {
                    Song song = songRepository.findById(ps.getSongId()).orElse(null);
                    if (song == null || song.getStatus() != 1) {
                        return null;
                    }
                    return buildSongVO(song);
                })
                .filter(vo -> vo != null)
                .collect(Collectors.toList());

        PlaylistDetailVO vo = new PlaylistDetailVO();
        vo.setPlaylistId(playlist.getPlaylistId());
        vo.setName(playlist.getName());
        vo.setCover(playlist.getCover());
        vo.setDescription(playlist.getDescription());
        vo.setCreatorUid(playlist.getCreatorUid());
        vo.setCreatorNickname(creatorNickname);
        vo.setSongCount(playlist.getSongCount());
        vo.setPlayCount(playlist.getPlayCount());
        vo.setCollectCount(playlist.getCollectCount());
        vo.setTags(playlist.getTags());
        vo.setIsOfficial(playlist.getIsOfficial());
        vo.setSongs(songVOList);
        vo.setTotal(playlistSongs.getTotalElements());
        vo.setPage(page);
        vo.setSize(size);
        return vo;
    }

    @Override
    @Transactional
    public PlaylistVO update(String uid, String playlistId, UpdatePlaylistDTO dto) {
        Playlist playlist = playlistRepository.findByPlaylistIdAndDeletedAtIsNull(playlistId)
                .orElseThrow(() -> new BusinessException("歌单不存在"));

        if (!playlist.getCreatorUid().equals(uid)) {
            throw new BusinessException("无权修改该歌单");
        }

        if (dto.getName() != null) {
            playlist.setName(dto.getName());
        }
        if (dto.getCover() != null) {
            playlist.setCover(dto.getCover());
        }
        if (dto.getDescription() != null) {
            playlist.setDescription(dto.getDescription());
        }
        if (dto.getTags() != null) {
            playlist.setTags(String.join(",", dto.getTags()));
        }
        playlist.setUpdatedAt(LocalDateTime.now());
        playlistRepository.save(playlist);

        return buildPlaylistVO(playlist);
    }

    @Override
    @Transactional
    public void delete(String uid, String playlistId) {
        Playlist playlist = playlistRepository.findByPlaylistIdAndDeletedAtIsNull(playlistId)
                .orElseThrow(() -> new BusinessException("歌单不存在"));

        if (!playlist.getCreatorUid().equals(uid)) {
            throw new BusinessException("无权删除该歌单");
        }

        playlist.setDeletedAt(LocalDateTime.now());
        playlist.setUpdatedAt(LocalDateTime.now());
        playlistRepository.save(playlist);
    }

    @Override
    @Transactional
    public PlaylistSongResultVO addSongs(String uid, String playlistId, AddSongsDTO dto) {
        Playlist playlist = playlistRepository.findByPlaylistIdAndDeletedAtIsNull(playlistId)
                .orElseThrow(() -> new BusinessException("歌单不存在"));

        if (!playlist.getCreatorUid().equals(uid)) {
            throw new BusinessException("无权修改该歌单");
        }

        int added = 0;
        List<String> duplicated = new ArrayList<>();

        int currentSortOrder = playlist.getSongCount() != null ? playlist.getSongCount() : 0;

        for (String songId : dto.getSongIds()) {
            // 检查歌曲是否存在
            Song song = songRepository.findBySongId(songId).orElse(null);
            if (song == null) {
                continue;
            }

            // 检查是否已在歌单中
            boolean exists = playlistSongRepository.findByPlaylistIdAndSongId(playlist.getId(), song.getId()).isPresent();
            if (exists) {
                duplicated.add(songId);
                continue;
            }

            PlaylistSong playlistSong = new PlaylistSong();
            playlistSong.setPlaylistId(playlist.getId());
            playlistSong.setSongId(song.getId());
            playlistSong.setSortOrder(++currentSortOrder);
            playlistSong.setAddedAt(LocalDateTime.now());
            playlistSongRepository.save(playlistSong);
            added++;
        }

        // 更新歌单歌曲数量
        playlist.setSongCount(currentSortOrder);
        playlist.setUpdatedAt(LocalDateTime.now());
        playlistRepository.save(playlist);

        PlaylistSongResultVO vo = new PlaylistSongResultVO();
        vo.setAdded(added);
        vo.setDuplicated(duplicated);
        vo.setTotal(currentSortOrder);
        return vo;
    }

    @Override
    @Transactional
    public void removeSong(String uid, String playlistId, String songId) {
        Playlist playlist = playlistRepository.findByPlaylistIdAndDeletedAtIsNull(playlistId)
                .orElseThrow(() -> new BusinessException("歌单不存在"));

        if (!playlist.getCreatorUid().equals(uid)) {
            throw new BusinessException("无权修改该歌单");
        }

        Song song = songRepository.findBySongId(songId)
                .orElseThrow(() -> new BusinessException("歌曲不存在"));

        PlaylistSong playlistSong = playlistSongRepository.findByPlaylistIdAndSongId(playlist.getId(), song.getId())
                .orElseThrow(() -> new BusinessException("歌曲不在该歌单中"));

        playlistSongRepository.delete(playlistSong);

        // 更新歌曲数量
        int songCount = playlist.getSongCount() != null ? playlist.getSongCount() : 0;
        playlist.setSongCount(Math.max(0, songCount - 1));
        playlist.setUpdatedAt(LocalDateTime.now());
        playlistRepository.save(playlist);
    }

    private PlaylistVO buildPlaylistVO(Playlist playlist) {
        PlaylistVO vo = new PlaylistVO();
        vo.setPlaylistId(playlist.getPlaylistId());
        vo.setName(playlist.getName());
        vo.setCover(playlist.getCover());
        vo.setDescription(playlist.getDescription());
        vo.setCreatorUid(playlist.getCreatorUid());
        vo.setSongCount(playlist.getSongCount());
        vo.setPlayCount(playlist.getPlayCount());
        vo.setCollectCount(playlist.getCollectCount());
        vo.setTags(playlist.getTags());
        vo.setIsOfficial(playlist.getIsOfficial());
        vo.setCreatedAt(playlist.getCreatedAt());
        return vo;
    }

    private SongVO buildSongVO(Song song) {
        SongVO vo = new SongVO();
        vo.setSongId(song.getSongId());
        vo.setName(song.getName());
        vo.setDuration(song.getDuration());
        vo.setIsVip(song.getIsVip());
        vo.setPlayCount(song.getPlayCount());

        // 获取歌手信息
        List<SongArtist> songArtists = songArtistRepository.findBySongId(song.getId());
        List<String> artistNames = new ArrayList<>();
        List<String> artistIds = new ArrayList<>();
        for (SongArtist sa : songArtists) {
            artistRepository.findById(sa.getArtistId()).ifPresent(artist -> {
                artistNames.add(artist.getName());
                artistIds.add(artist.getArtistId());
            });
        }
        vo.setArtistNames(artistNames);
        vo.setArtistIds(artistIds);

        return vo;
    }
}
