package com.xx.music.repository;

import com.xx.music.model.entity.SongArtist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SongArtistRepository extends JpaRepository<SongArtist, Long> {

    List<SongArtist> findBySongId(Long songId);

    List<SongArtist> findByArtistId(Long artistId);
}
