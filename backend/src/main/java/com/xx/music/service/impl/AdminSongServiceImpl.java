package com.xx.music.service.impl;

import com.xx.music.common.BusinessException;
import com.xx.music.common.PageResult;
import com.xx.music.model.dto.CreateSongDTO;
import com.xx.music.model.dto.UpdateSongDTO;
import com.xx.music.model.dto.UpdateStatusDTO;
import com.xx.music.model.entity.Album;
import com.xx.music.model.entity.Artist;
import com.xx.music.model.entity.Song;
import com.xx.music.model.entity.SongArtist;
import com.xx.music.model.vo.AdminSongListVO;
import com.xx.music.model.vo.AlbumVO;
import com.xx.music.model.vo.ArtistVO;
import com.xx.music.model.vo.SongDetailVO;
import com.xx.music.model.vo.SongVO;
import com.xx.music.repository.AlbumRepository;
import com.xx.music.repository.ArtistRepository;
import com.xx.music.repository.SongArtistRepository;
import com.xx.music.repository.SongRepository;
import com.xx.music.service.AdminSongService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminSongServiceImpl implements AdminSongService {

    private final SongRepository songRepository;
    private final SongArtistRepository songArtistRepository;
    private final ArtistRepository artistRepository;
    private final AlbumRepository albumRepository;

    @Override
    public AdminSongListVO getSongs(int page, int size, String keyword, Integer status,
                                    Integer isVip, String artistId, String albumId,
                                    String sortBy, String sortOrder) {
        Sort sort = Sort.unsorted();
        if (sortBy != null && !sortBy.isEmpty()) {
            Sort.Direction direction = "asc".equalsIgnoreCase(sortOrder) ? Sort.Direction.ASC : Sort.Direction.DESC;
            sort = Sort.by(direction, sortBy);
        } else {
            sort = Sort.by(Sort.Direction.DESC, "createdAt");
        }

        Pageable pageable = PageRequest.of(page - 1, size, sort);

        Specification<Song> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (keyword != null && !keyword.isEmpty()) {
                Predicate nameLike = cb.like(root.get("name"), "%" + keyword + "%");
                Predicate songIdLike = cb.like(root.get("songId"), "%" + keyword + "%");
                predicates.add(cb.or(nameLike, songIdLike));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (isVip != null) {
                predicates.add(cb.equal(root.get("isVip"), isVip));
            }
            if (albumId != null && !albumId.isEmpty()) {
                predicates.add(cb.equal(root.get("albumId"), albumId));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Song> songPage = songRepository.findAll(spec, pageable);

        // 如果指定了artistId，额外过滤
        List<SongVO> songVOList = songPage.getContent().stream()
                .filter(song -> {
                    if (artistId != null && !artistId.isEmpty()) {
                        List<SongArtist> artists = songArtistRepository.findBySongId(song.getId());
                        return artists.stream().anyMatch(sa -> String.valueOf(sa.getArtistId()).equals(artistId));
                    }
                    return true;
                })
                .map(this::buildSongVO)
                .collect(Collectors.toList());

        AdminSongListVO vo = new AdminSongListVO();
        vo.setList(songVOList);
        vo.setTotal(songPage.getTotalElements());
        vo.setPage(page);
        vo.setSize(size);
        return vo;
    }

    @Override
    public SongDetailVO getSongDetail(String songId) {
        Song song = songRepository.findBySongId(songId)
                .orElseThrow(() -> new BusinessException("歌曲不存在"));

        List<SongArtist> songArtists = songArtistRepository.findBySongId(song.getId());
        List<ArtistVO> artistVOList = songArtists.stream()
                .map(sa -> artistRepository.findById(sa.getArtistId()).orElse(null))
                .filter(a -> a != null)
                .map(this::buildArtistVO)
                .collect(Collectors.toList());

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
        vo.setStatus(song.getStatus());
        vo.setSource(song.getSource());
        vo.setSourceId(song.getSourceId());
        vo.setLyricUrl(song.getLyricUrl());
        vo.setTlyricUrl(song.getTlyricUrl());
        vo.setArtists(artistVOList);
        vo.setAlbum(albumVO);
        vo.setCreatedAt(song.getCreatedAt());
        vo.setUpdatedAt(song.getUpdatedAt());
        return vo;
    }

    @Override
    @Transactional
    public SongVO createSong(CreateSongDTO dto, Long adminId) {
        String songId = "S" + System.currentTimeMillis() + String.format("%04d", ThreadLocalRandom.current().nextInt(10000));

        Song song = new Song();
        song.setSongId(songId);
        song.setName(dto.getName());
        song.setDuration(dto.getDuration());
        song.setIsVip(dto.getIsVip() != null ? dto.getIsVip() : 0);
        song.setHasStandard(dto.getHasStandard() != null ? dto.getHasStandard() : 1);
        song.setHasHigh(dto.getHasHigh() != null ? dto.getHasHigh() : 0);
        song.setHasLossless(dto.getHasLossless() != null ? dto.getHasLossless() : 0);
        song.setPlayCount(0L);
        song.setStatus(dto.getStatus() != null ? dto.getStatus() : 1);
        song.setSource(dto.getSource());
        song.setSourceId(dto.getSourceId());
        song.setLyricUrl(dto.getLyricUrl());
        song.setTlyricUrl(dto.getTlyricUrl());
        song.setCreatedAt(LocalDateTime.now());
        song.setUpdatedAt(LocalDateTime.now());

        // 关联专辑
        if (dto.getAlbumId() != null) {
            Album album = albumRepository.findByAlbumId(dto.getAlbumId()).orElse(null);
            if (album != null) {
                song.setAlbumId(album.getId());
            }
        }

        songRepository.save(song);

        // 关联歌手
        if (dto.getArtistIds() != null && !dto.getArtistIds().isEmpty()) {
            for (int i = 0; i < dto.getArtistIds().size(); i++) {
                Artist artist = artistRepository.findByArtistId(dto.getArtistIds().get(i)).orElse(null);
                if (artist != null) {
                    SongArtist songArtist = new SongArtist();
                    songArtist.setSongId(song.getId());
                    songArtist.setArtistId(artist.getId());
                    songArtist.setRole(i == 0 ? "主唱" : "合唱");
                    songArtist.setSortOrder(i);
                    songArtistRepository.save(songArtist);

                    if (i == 0) {
                        song.setDefaultArtistId(artist.getId());
                    }
                }
            }
            songRepository.save(song);
        }

        return buildSongVO(song);
    }

    @Override
    @Transactional
    public SongVO updateSong(String songId, UpdateSongDTO dto, Long adminId) {
        Song song = songRepository.findBySongId(songId)
                .orElseThrow(() -> new BusinessException("歌曲不存在"));

        if (dto.getName() != null) {
            song.setName(dto.getName());
        }
        if (dto.getDuration() != null) {
            song.setDuration(dto.getDuration());
        }
        if (dto.getIsVip() != null) {
            song.setIsVip(dto.getIsVip());
        }
        if (dto.getHasStandard() != null) {
            song.setHasStandard(dto.getHasStandard());
        }
        if (dto.getHasHigh() != null) {
            song.setHasHigh(dto.getHasHigh());
        }
        if (dto.getHasLossless() != null) {
            song.setHasLossless(dto.getHasLossless());
        }
        if (dto.getLyricUrl() != null) {
            song.setLyricUrl(dto.getLyricUrl());
        }
        if (dto.getTlyricUrl() != null) {
            song.setTlyricUrl(dto.getTlyricUrl());
        }
        if (dto.getSource() != null) {
            song.setSource(dto.getSource());
        }
        if (dto.getSourceId() != null) {
            song.setSourceId(dto.getSourceId());
        }

        // 更新专辑
        if (dto.getAlbumId() != null) {
            Album album = albumRepository.findByAlbumId(dto.getAlbumId()).orElse(null);
            if (album != null) {
                song.setAlbumId(album.getId());
            }
        }

        // 更新歌手关联
        if (dto.getArtistIds() != null && !dto.getArtistIds().isEmpty()) {
            // 删除原有歌手关联
            List<SongArtist> existingArtists = songArtistRepository.findBySongId(song.getId());
            songArtistRepository.deleteAll(existingArtists);

            for (int i = 0; i < dto.getArtistIds().size(); i++) {
                Artist artist = artistRepository.findByArtistId(dto.getArtistIds().get(i)).orElse(null);
                if (artist != null) {
                    SongArtist songArtist = new SongArtist();
                    songArtist.setSongId(song.getId());
                    songArtist.setArtistId(artist.getId());
                    songArtist.setRole(i == 0 ? "主唱" : "合唱");
                    songArtist.setSortOrder(i);
                    songArtistRepository.save(songArtist);

                    if (i == 0) {
                        song.setDefaultArtistId(artist.getId());
                    }
                }
            }
        }

        song.setUpdatedAt(LocalDateTime.now());
        songRepository.save(song);

        return buildSongVO(song);
    }

    @Override
    @Transactional
    public void updateSongStatus(String songId, UpdateStatusDTO dto, Long adminId) {
        Song song = songRepository.findBySongId(songId)
                .orElseThrow(() -> new BusinessException("歌曲不存在"));
        song.setStatus(dto.getStatus());
        song.setUpdatedAt(LocalDateTime.now());
        songRepository.save(song);
    }

    @Override
    @Transactional
    public void deleteSong(String songId, Long adminId) {
        Song song = songRepository.findBySongId(songId)
                .orElseThrow(() -> new BusinessException("歌曲不存在"));
        song.setStatus(0);
        song.setUpdatedAt(LocalDateTime.now());
        songRepository.save(song);
    }

    private SongVO buildSongVO(Song song) {
        SongVO vo = new SongVO();
        vo.setSongId(song.getSongId());
        vo.setName(song.getName());
        vo.setDuration(song.getDuration());
        vo.setIsVip(song.getIsVip());
        vo.setPlayCount(song.getPlayCount());
        vo.setStatus(song.getStatus());

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
}
