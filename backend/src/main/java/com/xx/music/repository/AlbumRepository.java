package com.xx.music.repository;

import com.xx.music.model.entity.Album;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AlbumRepository extends JpaRepository<Album, Long> {

    Optional<Album> findByAlbumId(String albumId);

    Page<Album> findByNameContainingAndStatus(String name, Integer status, Pageable pageable);

    Page<Album> findByArtistIdAndStatus(Long artistId, Integer status, Pageable pageable);
}
