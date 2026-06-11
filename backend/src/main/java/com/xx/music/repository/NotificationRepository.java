package com.xx.music.repository;

import com.xx.music.model.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByUidOrderByCreatedAtDesc(String uid, Pageable pageable);

    long countByUidAndIsRead(String uid, Integer isRead);
}
