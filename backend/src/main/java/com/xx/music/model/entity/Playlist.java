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
@Table(name = "t_playlist")
public class Playlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "playlist_id")
    private String playlistId;

    @Column(name = "name")
    private String name;

    @Column(name = "cover")
    private String cover;

    @Column(name = "description")
    private String description;

    @Column(name = "creator_uid")
    private String creatorUid;

    @Column(name = "song_count")
    private Integer songCount;

    @Column(name = "play_count")
    private Long playCount;

    @Column(name = "collect_count")
    private Integer collectCount;

    @Column(name = "tags")
    private String tags;

    @Column(name = "is_official")
    private Integer isOfficial;

    @Column(name = "status")
    private Integer status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
