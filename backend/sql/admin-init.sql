USE music_platform;

-- 初始化超级管理员账号（密码: admin123，BCrypt加密）
INSERT INTO t_admin (username, password, nickname, role, status, created_at, updated_at) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '超级管理员', 'super_admin', 1, NOW(), NOW()),
('operator', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '运营管理员', 'admin', 1, NOW(), NOW());