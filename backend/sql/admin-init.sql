USE music_platform;

-- 管理员表（如已存在则跳过）
CREATE TABLE IF NOT EXISTS t_admin (
    id            BIGINT       PRIMARY KEY AUTO_INCREMENT,
    username      VARCHAR(32)  NOT NULL UNIQUE      COMMENT '管理员用户名',
    password      VARCHAR(60)  NOT NULL             COMMENT 'BCrypt加密密码',
    nickname      VARCHAR(50)  NOT NULL             COMMENT '管理员昵称',
    role          VARCHAR(20)  NOT NULL DEFAULT 'admin' COMMENT 'admin/super_admin',
    status        TINYINT      DEFAULT 1            COMMENT '0禁用/1正常',
    last_login_at DATETIME     DEFAULT NULL         COMMENT '最后登录时间',
    last_login_ip VARCHAR(45)  DEFAULT NULL         COMMENT '最后登录IP',
    created_at    DATETIME     NOT NULL             COMMENT '创建时间',
    updated_at    DATETIME     NOT NULL             COMMENT '更新时间',
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员表';

-- 管理平台操作日志表（如已存在则跳过）
CREATE TABLE IF NOT EXISTS t_admin_log (
    id          BIGINT       PRIMARY KEY AUTO_INCREMENT,
    admin_id    BIGINT       NOT NULL             COMMENT '管理员ID',
    action      VARCHAR(50)  NOT NULL             COMMENT '操作类型',
    target_type VARCHAR(30)  DEFAULT NULL         COMMENT '操作对象类型',
    target_id   VARCHAR(50)  DEFAULT NULL         COMMENT '操作对象ID',
    detail      TEXT         DEFAULT NULL         COMMENT '操作详情',
    ip          VARCHAR(45)  DEFAULT NULL         COMMENT '操作IP',
    created_at  DATETIME     NOT NULL             COMMENT '操作时间',
    INDEX idx_admin (admin_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理平台操作日志表';

-- 初始化超级管理员账号（密码: admin123，BCrypt加密）
INSERT INTO t_admin (username, password, nickname, role, status, created_at, updated_at) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '超级管理员', 'super_admin', 1, NOW(), NOW()),
('operator', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '运营管理员', 'admin', 1, NOW(), NOW());
