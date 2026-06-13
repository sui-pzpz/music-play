package com.xx.music.repository;

import com.xx.music.model.entity.SearchLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SearchLogRepository extends JpaRepository<SearchLog, Long> {

    List<SearchLog> findByKeyword(String keyword, Pageable pageable);

    @Query("SELECT s.keyword, COUNT(s) as cnt FROM SearchLog s GROUP BY s.keyword ORDER BY cnt DESC")
    List<Object[]> findTopKeywords(Pageable pageable);
}
