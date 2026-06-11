package com.xx.music.repository;

import com.xx.music.model.entity.Playlist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlaylistRepository extends JpaRepository<Playlist, Long> {

    Playlist findByPlaylistIdAndDeletedAtIsNull(String playlistId);

    Page<Playlist> findByCreatorUidAndDeletedAtIsNull(String creatorUid, Pageable pageable);

    Page<Playlist> findByIsOfficialAndStatusAndDeletedAtIsNull(Integer isOfficial, Integer status, Pageable pageable);

    Page<Playlist> findByStatusAndDeletedAtIsNull(Integer status, Pageable pageable);

    Page<Playlist> findByNameContainingAndStatusAndDeletedAtIsNull(String name, Integer status, Pageable pageable);
}
