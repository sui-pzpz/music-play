package com.xx.music.repository;

import com.xx.music.model.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    User findByUidAndDeletedAtIsNull(String uid);

    User findByPhoneAndDeletedAtIsNull(String phone);

    boolean existsByPhoneAndDeletedAtIsNull(String phone);

    Page<User> findByDeletedAtIsNull(Pageable pageable);

    long countByDeletedAtIsNull();

    long countByStatusAndDeletedAtIsNull(Integer status);

    Page<User> findByStatusAndDeletedAtIsNull(Integer status, Pageable pageable);
}
