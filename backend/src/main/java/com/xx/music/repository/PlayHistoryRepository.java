package com.xx.music.repository;

import com.xx.music.model.entity.PlayHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlayHistoryRepository extends JpaRepository<PlayHistory, Long> {

    Page<PlayHistory> findByUidOrderByPlayedAtDesc(String uid, Pageable pageable);

    long countByUid(String uid);
}
