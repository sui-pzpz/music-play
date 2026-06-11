package com.xx.music.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "t_song")
public class Song {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "song_id")
    private String songId;

    @Column(name = "name")
    private String name;

    @Column(name = "default_artist_id")
    private Long defaultArtistId;

    @Column(name = "album_id")
    private Long albumId;

    @Column(name = "duration")
    private Integer duration;

    @Column(name = "is_vip")
    private Integer isVip;

    @Column(name = "has_standard")
    private Integer hasStandard;

    @Column(name = "has_high")
    private Integer hasHigh;

    @Column(name = "has_lossless")
    private Integer hasLossless;

    @Column(name = "lyric_url")
    private String lyricUrl;

    @Column(name = "tlyric_url")
    private String tlyricUrl;

    @Column(name = "play_count")
    private Long playCount;

    @Column(name = "status")
    private Integer status;

    @Column(name = "source")
    private String source;

    @Column(name = "source_id")
    private String sourceId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
