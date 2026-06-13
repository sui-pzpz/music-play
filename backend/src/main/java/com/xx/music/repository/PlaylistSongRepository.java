package com.xx.music.repository;

import com.xx.music.model.entity.PlaylistSong;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlaylistSongRepository extends JpaRepository<PlaylistSong, Long> {

    List<PlaylistSong> findByPlaylistIdOrderBySortOrderAsc(Long playlistId);

    Page<PlaylistSong> findByPlaylistIdOrderBySortOrderAsc(Long playlistId, Pageable pageable);

    Page<PlaylistSong> findByPlaylistId(Long playlistId, Pageable pageable);

    Optional<PlaylistSong> findByPlaylistIdAndSongId(Long playlistId, Long songId);

    boolean existsByPlaylistIdAndSongId(Long playlistId, Long songId);

    void deleteByPlaylistIdAndSongId(Long playlistId, Long songId);

    long countByPlaylistId(Long playlistId);
}
