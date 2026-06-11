package com.xx.music.repository;

import com.xx.music.model.entity.Collection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CollectionRepository extends JpaRepository<Collection, Long> {

    Collection findByUidAndTargetTypeAndTargetId(String uid, String targetType, String targetId);

    boolean existsByUidAndTargetTypeAndTargetId(String uid, String targetType, String targetId);

    Page<Collection> findByUidAndTargetTypeOrderByCreatedAtDesc(String uid, String targetType, Pageable pageable);

    long countByUidAndTargetType(String uid, String targetType);
}
