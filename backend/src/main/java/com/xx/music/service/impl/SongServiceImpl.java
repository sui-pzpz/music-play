package com.xx.music.service.impl;

import com.xx.music.common.BusinessException;
import com.xx.music.model.entity.*;
import com.xx.music.model.vo.AlbumVO;
import com.xx.music.model.vo.ArtistVO;
import com.xx.music.model.vo.LyricVO;
import com.xx.music.model.vo.SongDetailVO;
import com.xx.music.model.vo.StreamVO;
import com.xx.music.repository.*;
import com.xx.music.service.SongService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SongServiceImpl implements SongService {

    private final SongRepository songRepository;
    private final SongArtistRepository songArtistRepository;
    private final ArtistRepository artistRepository;
    private final AlbumRepository albumRepository;
    private final MemberRepository memberRepository;

    @Override
    public SongDetailVO getSongDetail(String songId) {
        Song song = songRepository.findBySongId(songId)
                .orElseThrow(() -> new BusinessException("歌曲不存在"));

        if (song.getStatus() != 1) {
            throw new BusinessException("歌曲已下架");
        }

        // 获取歌手列表
        List<SongArtist> songArtists = songArtistRepository.findBySongId(song.getId());
        List<ArtistVO> artistVOList = songArtists.stream()
                .map(sa -> artistRepository.findById(sa.getArtistId()).orElse(null))
                .filter(a -> a != null)
                .map(this::buildArtistVO)
                .collect(Collectors.toList());

        // 获取专辑信息
        AlbumVO albumVO = null;
        if (song.getAlbumId() != null) {
            Album album = albumRepository.findById(song.getAlbumId()).orElse(null);
            if (album != null) {
                albumVO = buildAlbumVO(album);
            }
        }

        SongDetailVO vo = new SongDetailVO();
        vo.setSongId(song.getSongId());
        vo.setName(song.getName());
        vo.setDuration(song.getDuration());
        vo.setIsVip(song.getIsVip());
        vo.setHasStandard(song.getHasStandard());
        vo.setHasHigh(song.getHasHigh());
        vo.setHasLossless(song.getHasLossless());
        vo.setPlayCount(song.getPlayCount());
        vo.setLyricUrl(song.getLyricUrl());
        vo.setTlyricUrl(song.getTlyricUrl());
        vo.setArtists(artistVOList);
        vo.setAlbum(albumVO);
        return vo;
    }

    @Override
    public LyricVO getLyric(String songId) {
        Song song = songRepository.findBySongId(songId)
                .orElseThrow(() -> new BusinessException("歌曲不存在"));

        LyricVO vo = new LyricVO();
        vo.setSongId(song.getSongId());
        vo.setLyric(song.getLyricUrl() != null ? song.getLyricUrl() : "");
        vo.setTlyric(song.getTlyricUrl() != null ? song.getTlyricUrl() : "");
        return vo;
    }

    @Override
    public StreamVO getStream(String songId, String quality, String uid) {
        Song song = songRepository.findBySongId(songId)
                .orElseThrow(() -> new BusinessException("歌曲不存在"));

        if (song.getStatus() != 1) {
            throw new BusinessException("歌曲已下架");
        }

        // 检查VIP权限
        if (song.getIsVip() != null && song.getIsVip() == 1) {
            if (uid == null || uid.isEmpty()) {
                throw new BusinessException("该歌曲需要VIP权限");
            }
            Member member = memberRepository.findByUid(uid).orElse(null);
            if (member == null || member.getLevel() == null || member.getLevel() < 1
                    || member.getExpireAt() == null || member.getExpireAt().isBefore(java.time.LocalDateTime.now())) {
                throw new BusinessException("该歌曲需要VIP权限");
            }
        }

        // 根据音质检查可用性
        String actualQuality = "standard";
        if ("lossless".equals(quality) && song.getHasLossless() != null && song.getHasLossless() == 1) {
            actualQuality = "lossless";
        } else if ("high".equals(quality) && song.getHasHigh() != null && song.getHasHigh() == 1) {
            actualQuality = "high";
        }

        StreamVO vo = new StreamVO();
        vo.setSongId(song.getSongId());
        vo.setQuality(actualQuality);
        vo.setUrl("/api/v1/stream/" + songId + "?quality=" + actualQuality);
        vo.setSize(estimateSize(song.getDuration(), actualQuality));
        vo.setType("audio/mpeg");
        return vo;
    }

    private ArtistVO buildArtistVO(Artist artist) {
        ArtistVO vo = new ArtistVO();
        vo.setArtistId(artist.getArtistId());
        vo.setName(artist.getName());
        vo.setAvatar(artist.getAvatar());
        return vo;
    }

    private AlbumVO buildAlbumVO(Album album) {
        AlbumVO vo = new AlbumVO();
        vo.setAlbumId(album.getAlbumId());
        vo.setName(album.getName());
        vo.setCover(album.getCover());
        vo.setPublishDate(album.getPublishDate() != null ? album.getPublishDate().toString() : null);
        return vo;
    }

    private long estimateSize(Integer duration, String quality) {
        if (duration == null) return 0;
        int bitrate;
        switch (quality) {
            case "lossless":
                bitrate = 900;
                break;
            case "high":
                bitrate = 320;
                break;
            default:
                bitrate = 128;
                break;
        }
        return (long) duration * bitrate * 1000 / 8;
    }
}
