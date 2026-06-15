package com.xx.music.repository;

import com.xx.music.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByPhoneAndDeletedAtIsNull(String phone);

    Optional<User> findByUidAndDeletedAtIsNull(String uid);

    boolean existsByPhoneAndDeletedAtIsNull(String phone);
}
