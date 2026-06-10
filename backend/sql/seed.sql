USE music_platform;

-- 插入套餐数据
INSERT INTO t_package (package_id, name, level, price, duration, unit, status, sort_order, created_at, updated_at) VALUES
('PKG_VIP_MONTH', 'VIP月卡', 1, 15.00, 30, 'day', 1, 1, NOW(), NOW()),
('PKG_VIP_QUARTER', 'VIP季卡', 1, 40.00, 90, 'day', 1, 2, NOW(), NOW()),
('PKG_VIP_YEAR', 'VIP年卡', 1, 150.00, 365, 'day', 1, 3, NOW(), NOW()),
('PKG_SVIP_MONTH', 'SVIP月卡', 2, 30.00, 30, 'day', 1, 4, NOW(), NOW()),
('PKG_SVIP_YEAR', 'SVIP年卡', 2, 300.00, 365, 'day', 1, 5, NOW(), NOW());