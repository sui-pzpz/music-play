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
@Table(name = "t_play_history")
public class PlayHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "uid")
    private String uid;

    @Column(name = "song_id")
    private String songId;

    @Column(name = "progress")
    private Integer progress;

    @Column(name = "duration")
    private Integer duration;

    @Column(name = "quality")
    private String quality;

    @Column(name = "play_source")
    private String playSource;

    @Column(name = "source_id")
    private String sourceId;

    @Column(name = "device")
    private String device;

    @Column(name = "is_complete")
    private Integer isComplete;

    @Column(name = "played_at")
    private LocalDateTime playedAt;
}
