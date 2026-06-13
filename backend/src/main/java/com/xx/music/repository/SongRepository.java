package com.xx.music.repository;

import com.xx.music.model.entity.Song;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SongRepository extends JpaRepository<Song, Long> {

    Song findBySongIdAndStatus(String songId, Integer status);

    Song findBySongId(String songId);

    Page<Song> findByNameContainingAndStatus(String name, Integer status, Pageable pageable);

    Page<Song> findByStatus(Integer status, Pageable pageable);

    Page<Song> findByDefaultArtistIdAndStatus(Long artistId, Integer status, Pageable pageable);

    Page<Song> findByAlbumIdAndStatus(Long albumId, Integer status, Pageable pageable);

    Page<Song> findByIsVipAndStatus(Integer isVip, Integer status, Pageable pageable);

    long countByStatus(Integer status);

    long countByIsVip(Integer isVip);

    long countByIsVipAndStatus(Integer isVip, Integer status);

    Page<Song> findByStatusOrderByPlayCountDesc(Integer status, Pageable pageable);

    Page<Song> findByStatusOrderByCreatedAtDesc(Integer status, Pageable pageable);

    Page<Song> findByStatusOrderByNameAsc(Integer status, Pageable pageable);

    List<Song> findAllBySongIdIn(List<String> songIds);
}
