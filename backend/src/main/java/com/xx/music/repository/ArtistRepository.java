package com.xx.music.repository;

import com.xx.music.model.entity.Artist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ArtistRepository extends JpaRepository<Artist, Long> {

    Optional<Artist> findByArtistId(String artistId);

    Page<Artist> findByNameContaining(String name, Pageable pageable);

    Page<Artist> findByNameContainingAndStatus(String name, Integer status, Pageable pageable);
}
