package com.xx.music.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "t_song_artist")
public class SongArtist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "song_id")
    private Long songId;

    @Column(name = "artist_id")
    private Long artistId;

    @Column(name = "role")
    private String role;

    @Column(name = "sort_order")
    private Integer sortOrder;
}
