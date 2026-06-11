package com.xx.music.repository;

import com.xx.music.model.entity.Feedback;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    Page<Feedback> findByUidOrderByCreatedAtDesc(String uid, Pageable pageable);

    Page<Feedback> findByStatus(Integer status, Pageable pageable);
}
