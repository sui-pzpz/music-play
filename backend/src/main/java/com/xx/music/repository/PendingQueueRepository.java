package com.xx.music.repository;

import com.xx.music.model.entity.PendingQueue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PendingQueueRepository extends JpaRepository<PendingQueue, Long> {

    List<PendingQueue> findByUidOrderBySortOrderAsc(String uid);

    boolean existsByUidAndSongId(String uid, String songId);

    void deleteByUidAndSongId(String uid, String songId);
}
