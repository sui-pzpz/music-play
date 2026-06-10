-- 创建数据库
CREATE DATABASE IF NOT EXISTS music_platform
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE music_platform;

-- 用户表
CREATE TABLE t_user (
    id              BIGINT       PRIMARY KEY AUTO_INCREMENT,
    uid             VARCHAR(20)  NOT NULL UNIQUE            COMMENT '用户唯一标识',
    phone           VARCHAR(11)  NOT NULL UNIQUE            COMMENT '手机号(AES加密)',
    password        VARCHAR(60)  NOT NULL                   COMMENT 'BCrypt加密密码',
    nickname        VARCHAR(20)  NOT NULL                   COMMENT '昵称',
    avatar          VARCHAR(255) DEFAULT NULL               COMMENT '头像URL',
    gender          TINYINT      DEFAULT 0                  COMMENT '0未知/1男/2女',
    birthday        DATE         DEFAULT NULL               COMMENT '生日',
    signature       VARCHAR(100) DEFAULT NULL               COMMENT '个性签名',
    status          TINYINT      DEFAULT 1                  COMMENT '0禁用/1正常',
    login_fail_count INT         DEFAULT 0                  COMMENT '连续登录失败次数',
    lock_until      DATETIME     DEFAULT NULL               COMMENT '锁定截止时间',
    last_login_at   DATETIME     DEFAULT NULL               COMMENT '最后登录时间',
    last_login_ip   VARCHAR(45)  DEFAULT NULL               COMMENT '最后登录IP',
    created_at      DATETIME     NOT NULL                   COMMENT '创建时间',
    updated_at      DATETIME     NOT NULL                   COMMENT '更新时间',
    deleted_at      DATETIME     DEFAULT NULL               COMMENT '软删除时间',
    INDEX idx_status (status),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 歌手表
CREATE TABLE t_artist (
    id           BIGINT       PRIMARY KEY AUTO_INCREMENT,
    artist_id    VARCHAR(20)  NOT NULL UNIQUE      COMMENT '歌手唯一标识',
    name         VARCHAR(50)  NOT NULL             COMMENT '歌手名称',
    avatar       VARCHAR(255) DEFAULT NULL         COMMENT '头像URL',
    description  TEXT         DEFAULT NULL         COMMENT '简介',
    song_count   INT          DEFAULT 0            COMMENT '歌曲数',
    album_count  INT          DEFAULT 0            COMMENT '专辑数',
    tags         VARCHAR(200) DEFAULT NULL         COMMENT '标签(逗号分隔)',
    status       TINYINT      DEFAULT 1            COMMENT '0禁用/1正常',
    created_at   DATETIME     NOT NULL             COMMENT '创建时间',
    updated_at   DATETIME     NOT NULL             COMMENT '更新时间',
    INDEX idx_name (name),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='歌手表';

-- 专辑表
CREATE TABLE t_album (
    id           BIGINT       PRIMARY KEY AUTO_INCREMENT,
    album_id     VARCHAR(20)  NOT NULL UNIQUE      COMMENT '专辑唯一标识',
    name         VARCHAR(100) NOT NULL             COMMENT '专辑名称',
    cover        VARCHAR(255) DEFAULT NULL         COMMENT '封面URL',
    artist_id    BIGINT       DEFAULT NULL         COMMENT '歌手ID',
    publish_date DATE         DEFAULT NULL         COMMENT '发行日期',
    description  TEXT         DEFAULT NULL         COMMENT '简介',
    song_count   INT          DEFAULT 0            COMMENT '歌曲数',
    status       TINYINT      DEFAULT 1            COMMENT '0下架/1正常',
    created_at   DATETIME     NOT NULL             COMMENT '创建时间',
    updated_at   DATETIME     NOT NULL             COMMENT '更新时间',
    INDEX idx_name (name),
    INDEX idx_artist (artist_id),
    INDEX idx_publish_date (publish_date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='专辑表';

-- 歌曲表
CREATE TABLE t_song (
    id                BIGINT       PRIMARY KEY AUTO_INCREMENT,
    song_id           VARCHAR(20)  NOT NULL UNIQUE           COMMENT '歌曲唯一标识',
    name              VARCHAR(100) NOT NULL                  COMMENT '歌曲名称',
    default_artist_id BIGINT       DEFAULT NULL              COMMENT '默认主歌手ID(冗余)',
    album_id          BIGINT       DEFAULT NULL              COMMENT '专辑ID',
    duration          INT          DEFAULT NULL              COMMENT '时长(秒)',
    is_vip            TINYINT      DEFAULT 0                 COMMENT '0免费/1付费',
    has_standard      TINYINT      DEFAULT 1                 COMMENT '有标准音质',
    has_high          TINYINT      DEFAULT 1                 COMMENT '有高清音质',
    has_lossless      TINYINT      DEFAULT 0                 COMMENT '有无损音质',
    lyric_url         VARCHAR(255) DEFAULT NULL              COMMENT '歌词文件URL',
    tlyric_url        VARCHAR(255) DEFAULT NULL              COMMENT '翻译歌词URL',
    play_count        BIGINT       DEFAULT 0                 COMMENT '播放次数',
    status            TINYINT      DEFAULT 1                 COMMENT '0下架/1正常',
    source            VARCHAR(20)  DEFAULT NULL              COMMENT '来源(netease/qq/local)',
    source_id         VARCHAR(50)  DEFAULT NULL              COMMENT '来源平台ID',
    created_at        DATETIME     NOT NULL                  COMMENT '创建时间',
    updated_at        DATETIME     NOT NULL                  COMMENT '更新时间',
    INDEX idx_name (name),
    INDEX idx_default_artist (default_artist_id),
    INDEX idx_album (album_id),
    INDEX idx_is_vip (is_vip),
    INDEX idx_play_count (play_count),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='歌曲表';

-- 歌曲-歌手关联表
CREATE TABLE t_song_artist (
    id         BIGINT      PRIMARY KEY AUTO_INCREMENT,
    song_id    BIGINT      NOT NULL          COMMENT '歌曲ID(外键→t_song.id)',
    artist_id  BIGINT      NOT NULL          COMMENT '歌手ID(外键→t_artist.id)',
    role       VARCHAR(20) NOT NULL          COMMENT 'main/feat/producer',
    sort_order INT         DEFAULT 0         COMMENT '展示顺序',
    INDEX idx_song_id (song_id),
    INDEX idx_artist_id (artist_id),
    UNIQUE KEY uk_song_artist_role (song_id, artist_id, role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='歌曲-歌手关联表';

-- 歌单表
CREATE TABLE t_playlist (
    id            BIGINT       PRIMARY KEY AUTO_INCREMENT,
    playlist_id   VARCHAR(20)  NOT NULL UNIQUE      COMMENT '歌单唯一标识',
    name          VARCHAR(30)  NOT NULL             COMMENT '歌单名称',
    cover         VARCHAR(255) DEFAULT NULL         COMMENT '封面URL',
    description   VARCHAR(200) DEFAULT NULL         COMMENT '描述',
    creator_uid   VARCHAR(20)  NOT NULL             COMMENT '创建者UID',
    song_count    INT          DEFAULT 0            COMMENT '歌曲数',
    play_count    BIGINT       DEFAULT 0            COMMENT '播放次数',
    collect_count INT          DEFAULT 0            COMMENT '收藏次数',
    tags          VARCHAR(200) DEFAULT NULL         COMMENT '标签',
    is_official   TINYINT      DEFAULT 0            COMMENT '0用户/1官方',
    status        TINYINT      DEFAULT 1            COMMENT '0下架/1正常',
    created_at    DATETIME     NOT NULL             COMMENT '创建时间',
    updated_at    DATETIME     NOT NULL             COMMENT '更新时间',
    deleted_at    DATETIME     DEFAULT NULL         COMMENT '软删除时间',
    INDEX idx_creator (creator_uid),
    INDEX idx_play_count (play_count),
    INDEX idx_collect_count (collect_count),
    INDEX idx_official (is_official),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='歌单表';

-- 歌单歌曲关联表
CREATE TABLE t_playlist_song (
    id          BIGINT   PRIMARY KEY AUTO_INCREMENT,
    playlist_id BIGINT   NOT NULL          COMMENT '歌单ID(外键→t_playlist.id)',
    song_id     BIGINT   NOT NULL          COMMENT '歌曲ID(外键→t_song.id)',
    sort_order  INT      DEFAULT 0         COMMENT '排序序号',
    added_at    DATETIME NOT NULL          COMMENT '添加时间',
    INDEX idx_playlist (playlist_id),
    INDEX idx_song (song_id),
    UNIQUE KEY uk_playlist_song (playlist_id, song_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='歌单歌曲关联表';

-- 收藏表
CREATE TABLE t_collection (
    id          BIGINT      PRIMARY KEY AUTO_INCREMENT,
    uid         VARCHAR(20) NOT NULL          COMMENT '用户UID',
    target_type VARCHAR(20) NOT NULL          COMMENT 'song(喜欢)/playlist(收藏歌单)',
    target_id   VARCHAR(20) NOT NULL          COMMENT '目标ID',
    created_at  DATETIME    NOT NULL          COMMENT '收藏时间',
    INDEX idx_uid (uid),
    UNIQUE KEY uk_uid_target (uid, target_type, target_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收藏表';

-- 播放历史表
CREATE TABLE t_play_history (
    id          BIGINT      PRIMARY KEY AUTO_INCREMENT,
    uid         VARCHAR(20) NOT NULL          COMMENT '用户UID',
    song_id     VARCHAR(20) NOT NULL          COMMENT '歌曲ID',
    progress    INT         DEFAULT 0         COMMENT '播放进度(秒)',
    duration    INT         DEFAULT NULL      COMMENT '歌曲时长(秒)',
    quality     VARCHAR(20) DEFAULT NULL      COMMENT '音质',
    play_source VARCHAR(20) DEFAULT NULL      COMMENT '播放来源',
    source_id   VARCHAR(20) DEFAULT NULL      COMMENT '来源ID',
    device      VARCHAR(20) DEFAULT NULL      COMMENT '设备类型',
    is_complete TINYINT     DEFAULT 0         COMMENT '是否播放>50%',
    played_at   DATETIME    NOT NULL          COMMENT '播放时间',
    INDEX idx_uid_time (uid, played_at DESC),
    INDEX idx_song (song_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='播放历史表';

-- 待播队列表
CREATE TABLE t_pending_queue (
    id         BIGINT      PRIMARY KEY AUTO_INCREMENT,
    uid        VARCHAR(20) NOT NULL          COMMENT '用户UID',
    song_id    VARCHAR(20) NOT NULL          COMMENT '歌曲ID',
    sort_order INT         DEFAULT 0         COMMENT '播放顺序',
    created_at DATETIME    NOT NULL          COMMENT '添加时间',
    INDEX idx_uid_order (uid, sort_order ASC),
    UNIQUE KEY uk_uid_song (uid, song_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='待播队列表';

-- 用户设置表
CREATE TABLE t_user_settings (
    id         BIGINT      PRIMARY KEY AUTO_INCREMENT,
    uid        VARCHAR(20) NOT NULL UNIQUE     COMMENT '用户UID',
    settings   JSON        NOT NULL            COMMENT '设置项JSON',
    created_at DATETIME    NOT NULL            COMMENT '创建时间',
    updated_at DATETIME    NOT NULL            COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户设置表';

-- 会员表
CREATE TABLE t_member (
    id         BIGINT      PRIMARY KEY AUTO_INCREMENT,
    uid        VARCHAR(20) NOT NULL UNIQUE     COMMENT '用户UID',
    level      TINYINT     DEFAULT 0           COMMENT '0普通/1VIP/2SVIP',
    expire_at  DATETIME    DEFAULT NULL        COMMENT '到期时间',
    auto_renew TINYINT     DEFAULT 0           COMMENT '0关闭/1开启',
    created_at DATETIME    NOT NULL            COMMENT '开通时间',
    updated_at DATETIME    NOT NULL            COMMENT '更新时间',
    INDEX idx_level (level),
    INDEX idx_expire (expire_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会员表';

-- 订单表
CREATE TABLE t_order (
    id          BIGINT         PRIMARY KEY AUTO_INCREMENT,
    order_no    VARCHAR(32)    NOT NULL UNIQUE  COMMENT '订单号',
    uid         VARCHAR(20)    NOT NULL         COMMENT '用户UID',
    package_id  VARCHAR(20)    NOT NULL         COMMENT '套餐ID',
    amount      DECIMAL(10,2)  NOT NULL         COMMENT '金额',
    pay_method  VARCHAR(20)    NOT NULL         COMMENT '支付方式',
    status      TINYINT        DEFAULT 0        COMMENT '0待支付/1已支付/2已取消/3已退款',
    trade_no    VARCHAR(64)    DEFAULT NULL     COMMENT '第三方交易号',
    paid_at     DATETIME       DEFAULT NULL     COMMENT '支付时间',
    created_at  DATETIME       NOT NULL         COMMENT '创建时间',
    updated_at  DATETIME       NOT NULL         COMMENT '更新时间',
    INDEX idx_uid (uid),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- 套餐表
CREATE TABLE t_package (
    id          BIGINT         PRIMARY KEY AUTO_INCREMENT,
    package_id  VARCHAR(20)    NOT NULL UNIQUE  COMMENT '套餐唯一标识',
    name        VARCHAR(30)    NOT NULL         COMMENT '套餐名称',
    level       TINYINT        NOT NULL         COMMENT '会员等级',
    price       DECIMAL(10,2)  NOT NULL         COMMENT '价格',
    duration    INT            NOT NULL         COMMENT '时长',
    unit        VARCHAR(10)    NOT NULL         COMMENT '单位:day/month',
    status      TINYINT        DEFAULT 1        COMMENT '0下架/1上架',
    sort_order  INT            DEFAULT 0        COMMENT '排序',
    created_at  DATETIME       NOT NULL         COMMENT '创建时间',
    updated_at  DATETIME       NOT NULL         COMMENT '更新时间',
    INDEX idx_level (level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='套餐表';

-- 第三方账号绑定表
CREATE TABLE t_oauth_account (
    id            BIGINT       PRIMARY KEY AUTO_INCREMENT,
    uid           VARCHAR(20)  NOT NULL           COMMENT '内部用户UID',
    provider      VARCHAR(20)  NOT NULL           COMMENT 'wechat/qq/weibo',
    openid        VARCHAR(64)  NOT NULL           COMMENT '第三方OpenID',
    unionid       VARCHAR(64)  DEFAULT NULL       COMMENT '微信开放平台UnionID',
    access_token  VARCHAR(255) DEFAULT NULL       COMMENT '第三方Token',
    refresh_token VARCHAR(255) DEFAULT NULL       COMMENT '第三方刷新Token',
    expire_at     DATETIME     DEFAULT NULL       COMMENT 'Token过期时间',
    created_at    DATETIME     NOT NULL           COMMENT '绑定时间',
    updated_at    DATETIME     NOT NULL           COMMENT '更新时间',
    INDEX idx_uid (uid),
    INDEX idx_provider (provider),
    UNIQUE KEY uk_provider_openid (provider, openid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='第三方账号绑定表';

-- 通知表
CREATE TABLE t_notification (
    id         BIGINT       PRIMARY KEY AUTO_INCREMENT,
    uid        VARCHAR(20)  NOT NULL            COMMENT '接收用户UID',
    type       VARCHAR(20)  NOT NULL            COMMENT 'system/member/interaction',
    title      VARCHAR(100) NOT NULL            COMMENT '通知标题',
    content    VARCHAR(500) NOT NULL            COMMENT '通知内容',
    link       VARCHAR(255) DEFAULT NULL        COMMENT '跳转链接',
    is_read    TINYINT      DEFAULT 0           COMMENT '0未读/1已读',
    read_at    DATETIME     DEFAULT NULL        COMMENT '已读时间',
    created_at DATETIME     NOT NULL            COMMENT '创建时间',
    INDEX idx_uid_read (uid, is_read, created_at DESC),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='通知表';

-- 反馈表
CREATE TABLE t_feedback (
    id         BIGINT       PRIMARY KEY AUTO_INCREMENT,
    uid        VARCHAR(20)  NOT NULL            COMMENT '用户UID',
    content    VARCHAR(500) NOT NULL            COMMENT '反馈内容',
    category   VARCHAR(20)  NOT NULL            COMMENT 'bug/suggestion/other',
    images     VARCHAR(1000) DEFAULT NULL       COMMENT '截图URL(JSON数组)',
    contact    VARCHAR(50)  DEFAULT NULL        COMMENT '联系方式',
    status     TINYINT      DEFAULT 0           COMMENT '0待处理/1处理中/2已处理',
    reply      VARCHAR(500) DEFAULT NULL        COMMENT '回复内容',
    created_at DATETIME     NOT NULL            COMMENT '创建时间',
    updated_at DATETIME     NOT NULL            COMMENT '更新时间',
    INDEX idx_uid (uid),
    INDEX idx_category (category),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='反馈表';

-- 搜索日志表
CREATE TABLE t_search_log (
    id           BIGINT       PRIMARY KEY AUTO_INCREMENT,
    uid          VARCHAR(20)  DEFAULT NULL       COMMENT '用户UID(未登录为空)',
    keyword      VARCHAR(100) NOT NULL           COMMENT '搜索关键词',
    result_count INT          DEFAULT NULL       COMMENT '结果数量',
    search_type  VARCHAR(20)  DEFAULT NULL       COMMENT '搜索类型',
    ip           VARCHAR(45)  DEFAULT NULL       COMMENT '请求IP',
    created_at   DATETIME     NOT NULL           COMMENT '搜索时间',
    INDEX idx_uid (uid),
    INDEX idx_keyword (keyword),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='搜索日志表';

-- 管理员表
CREATE TABLE t_admin (
    id            BIGINT       PRIMARY KEY AUTO_INCREMENT,
    username      VARCHAR(32)  NOT NULL UNIQUE      COMMENT '管理员用户名',
    password      VARCHAR(60)  NOT NULL             COMMENT 'BCrypt加密密码',
    nickname      VARCHAR(20)  NOT NULL             COMMENT '管理员昵称',
    role          VARCHAR(20)  NOT NULL DEFAULT 'admin' COMMENT 'admin/super_admin',
    status        TINYINT      DEFAULT 1            COMMENT '0禁用/1正常',
    last_login_at DATETIME     DEFAULT NULL         COMMENT '最后登录时间',
    last_login_ip VARCHAR(45)  DEFAULT NULL         COMMENT '最后登录IP',
    created_at    DATETIME     NOT NULL             COMMENT '创建时间',
    updated_at    DATETIME     NOT NULL             COMMENT '更新时间',
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员表';

-- 管理平台操作日志表
CREATE TABLE t_admin_log (
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