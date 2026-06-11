package com.xx.music.repository;

import com.xx.music.model.entity.AdminLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminLogRepository extends JpaRepository<AdminLog, Long> {

    Page<AdminLog> findByAdminId(Long adminId, Pageable pageable);

    Page<AdminLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
