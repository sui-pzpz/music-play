package com.xx.music.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "t_album")
public class Album {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "album_id")
    private String albumId;

    @Column(name = "name")
    private String name;

    @Column(name = "cover")
    private String cover;

    @Column(name = "artist_id")
    private Long artistId;

    @Column(name = "publish_date")
    private LocalDate publishDate;

    @Column(name = "description")
    private String description;

    @Column(name = "song_count")
    private Integer songCount;

    @Column(name = "status")
    private Integer status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
