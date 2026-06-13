package com.xx.music.repository;

import com.xx.music.model.entity.Playlist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PlaylistRepository extends JpaRepository<Playlist, Long>, JpaSpecificationExecutor<Playlist> {

    Optional<Playlist> findByPlaylistIdAndDeletedAtIsNull(String playlistId);

    long countByDeletedAtIsNull();

    Page<Playlist> findByCreatorUidAndDeletedAtIsNull(String creatorUid, Pageable pageable);

    Page<Playlist> findByIsOfficialAndStatusAndDeletedAtIsNull(Integer isOfficial, Integer status, Pageable pageable);

    Page<Playlist> findByStatusAndDeletedAtIsNull(Integer status, Pageable pageable);

    Page<Playlist> findByNameContainingAndStatusAndDeletedAtIsNull(String name, Integer status, Pageable pageable);
}
