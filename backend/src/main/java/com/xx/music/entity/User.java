package com.xx.music.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "t_user")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "uid", nullable = false, unique = true, length = 20)
    private String uid;

    @Column(name = "phone", nullable = false, unique = true, length = 11)
    private String phone;

    @Column(name = "password", nullable = false, length = 60)
    private String password;

    @Column(name = "nickname", nullable = false, length = 20)
    private String nickname;

    @Column(name = "avatar", length = 255)
    private String avatar;

    @Column(name = "gender")
    private Byte gender;

    @Column(name = "birthday")
    private java.time.LocalDate birthday;

    @Column(name = "signature", length = 100)
    private String signature;

    @Column(name = "status")
    private Byte status;

    @Column(name = "login_fail_count")
    private Integer loginFailCount;

    @Column(name = "lock_until")
    private LocalDateTime lockUntil;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(name = "last_login_ip", length = 45)
    private String lastLoginIp;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
