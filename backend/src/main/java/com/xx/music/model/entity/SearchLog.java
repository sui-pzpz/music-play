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
@Table(name = "t_search_log")
public class SearchLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "uid")
    private String uid;

    @Column(name = "keyword")
    private String keyword;

    @Column(name = "result_count")
    private Integer resultCount;

    @Column(name = "search_type")
    private String searchType;

    @Column(name = "ip")
    private String ip;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
