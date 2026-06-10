# XX音乐播放器 后端产品需求设计文档（PRD）V2.0

**版本：V2.0 评审修订版**
**日期：2026-06-10**
**文档类型：后端产品需求设计文档**
**基线版本：V1.0（2026-06-08）**
**修订来源：PRD评审纪要_20260608(一)**

---

## 修订总览

本文档由《后端产品需求设计文档 V1.0》吸收《PRD评审纪要_20260608(一)》相关修订意见后升级到 V2.0。修订点用 ✅ 标注。

| 修订编号 | 严重度 | 修订内容摘要 |
|----------|--------|--------------|
| ✅#2 | 严重 | 新增待播队列表与对应接口 |
| ✅#3 | 严重 | 歌曲-歌手多对多：新增 t_song_artist 关联表 |
| ✅#4 | 严重 | 新增第三方登录接口 /auth/oauth/callback 与 t_oauth_account |
| ✅#5 | 严重 | 收藏/喜欢概念统一（t_collection target_type 区分） |
| ✅#9 | 中等 | 支付回调改为签名验证（非Token） |
| ✅#10 | 中等 | 播放历史清理定时任务（保留100条/用户） |
| ✅#11 | 中等 | 收藏上限校验（10000首/用户） |
| ✅#12 | 中等 | t_playlist_song 外键统一为 BIGINT 自增ID |
| ✅#13 | 中等 | PC端下载专用接口 /song/:id/download |
| ✅#17 | 轻微 | 搜索接口新增 highlight 字段 |
| ✅#18 | 轻微 | 用户行为日志按月分表+归档HDFS |
| ✅#19 | 轻微 | t_song.created_at 新增 IDX 索引 |
| ✅#20 | 轻微 | 通知服务接口（§3.9）已补全 |
| ✅#22 | 轻微 | 验收标准补充并发场景测试项 |

> 注：评审中针对前端的修订（#1 #6 #7 #8 #14 #15 #16 #21）见《前端产品需求设计文档 V2.0》。

---

## 一、技术架构

### 1.1 整体架构
```
客户端(Web/PC) → CDN → Nginx → Spring Boot 单体应用
                                  ├── config/          # 配置类
                                  ├── controller/      # 控制器层
                                  │   ├── admin/       # 管理员控制器
                                  │   ├── auth/        # 认证控制器
                                  │   ├── user/        # 用户控制器
                                  │   ├── song/        # 歌曲控制器
                                  │   ├── playlist/    # 歌单控制器
                                  │   ├── search/      # 搜索控制器
                                  │   ├── recommend/   # 推荐控制器
                                  │   ├── member/      # 会员控制器
                                  │   ├── file/        # 文件控制器
                                  │   └── notify/      # 通知控制器
                                  ├── service/         # 服务层
                                  ├── repository/      # 数据访问层
                                  ├── model/           # 实体模型
                                  ├── security/        # 安全/鉴权
                                  └── common/          # 公共工具类
                              → Redis缓存
                              → MySQL数据库
                              → OSS/CDN
```

### 1.2 技术选型
| 组件 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 框架 | Spring Boot | 3.x | 单体架构，RESTful API |
| 数据库 | MySQL | 8.0 | 核心业务数据存储 |
| 缓存 | Redis | 7.x | 热点数据缓存 |
| 构建工具 | Maven | - | 依赖管理 |
| 文件存储 | OSS + CDN | - | 音频、图片、歌词 |
| 部署 | Docker | latest | 容器化部署 |

### 1.3 模块划分
| 模块 | 职责 | 说明 |
|------|------|------|
| config | 配置类 | 全局配置管理 |
| controller/admin | 管理员控制器 | 管理平台接口 |
| controller/auth | 认证控制器 | 用户注册/登录/鉴权 |
| controller/user | 用户控制器 | 用户信息管理 |
| controller/song | 歌曲控制器 | 歌曲元数据/播放地址/歌词/下载 |
| controller/playlist | 歌单控制器 | 歌单CRUD/收藏/排序 |
| controller/search | 搜索控制器 | 搜索/联想词/热门搜索 |
| controller/recommend | 推荐控制器 | 推荐算法/推荐列表 |
| controller/member | 会员控制器 | 会员/订单/支付/权益 |
| controller/file | 文件控制器 | 文件上传/下载/CDN管理 |
| controller/notify | 通知控制器 | 消息通知/验证码/系统消息 |

---

## 二、接口规范

### 2.1 通用规范
- **协议**：HTTPS
- **格式**：JSON
- **字符集**：UTF-8
- **时间格式**：ISO 8601（`yyyy-MM-dd'T'HH:mm:ss.SSS'Z'`）
- **时区**：UTC

### 2.2 请求规范
```
GET /api/v1/resource?page=1&size=20
POST /api/v1/resource
PUT /api/v1/resource/:id
DELETE /api/v1/resource/:id
```

**通用请求头**：
| Header | 必填 | 说明 |
|--------|------|------|
| Authorization | 是 | Bearer {token}（公开接口与支付回调除外 ✅#9） |
| Content-Type | 是 | application/json |
| X-Device-Id | 是 | 设备唯一标识 |
| X-App-Version | 是 | 客户端版本号 |
| X-Platform | 是 | web/pc/ios/android |

### 2.3 响应规范
```json
{
  "code": 200,
  "message": "success",
  "data": {},
  "timestamp": "2026-06-08T10:00:00.000Z"
}
```

**分页响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [],
    "pagination": {"page": 1, "size": 20, "total": 100, "totalPages": 5}
  }
}
```

### 2.4 状态码规范
| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证/Token无效 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 409 | 资源冲突 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |
| 503 | 服务不可用 |

**业务错误码**：
| 错误码 | 说明 |
|--------|------|
| 10001 | 验证码错误/过期 |
| 10002 | 手机号已注册 |
| 10003 | 账号或密码错误 |
| 10004 | 账号已锁定 |
| 10005 | Token已过期 |
| 10006 | 刷新Token无效 |
| 10007 | 第三方账号未绑定 |
| 10008 | ✅#4 OAuth回调签名错误 |
| 20001 | 歌曲不可用 |
| 20002 | 音质无权限 |
| 20003 | 付费歌曲需开通会员 |
| 30001 | 歌单不存在 |
| 30002 | 歌单名称重复 |
| 30003 | 歌曲已在歌单中 |
| 30004 | 歌单歌曲数超限 |
| 30005 | ✅#11 收藏数已达上限（10000首） |
| 40001 | 会员已过期 |
| 40002 | 订单支付失败 |
| 40003 | 套餐不存在 |
| 40004 | ✅#9 支付签名验证失败 |

### 2.5 鉴权机制
- **登录**：返回 accessToken(2h) + refreshToken(30d)
- **请求**：Authorization: Bearer {accessToken}
- **刷新**：accessToken 过期→用 refreshToken 换新 accessToken
- **失效**：refreshToken 过期→需重新登录
- **踢下线**：同一账号仅允许一个设备活跃登录
- **✅#9 支付回调**：不通过Token鉴权，由支付平台使用商户密钥签名，服务端验证签名+幂等ID防重放

---

## 三、接口清单

### 3.1 用户服务接口（user-service）

#### POST /api/v1/auth/register
注册新用户
| 字段 | 类型 | 必填 | 校验规则 | 说明 |
|------|------|------|----------|------|
| phone | string | 是 | 11位数字 | 手机号 |
| code | string | 是 | 6位数字 | 验证码 |
| password | string | 是 | 8-16位含字母数字 | 密码 |
| nickname | string | 否 | 1-20字符 | 昵称，默认"用户+UID后6位" |

**响应**：
```json
{
  "code": 200,
  "data": {
    "uid": "U202606080001",
    "nickname": "用户080001",
    "avatar": "https://cdn.xx.com/default_avatar.png",
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG...",
    "expiresIn": 7200
  }
}
```

#### POST /api/v1/auth/login
登录
| 字段 | 类型 | 必填 | 校验规则 | 说明 |
|------|------|------|----------|------|
| account | string | 是 | 手机号或UID | 账号 |
| password | string | 否 | 8-16位 | 密码（密码登录） |
| code | string | 否 | 6位数字 | 验证码（验证码登录） |
| loginType | string | 是 | password/code | 登录方式 |

#### ✅#4 POST /api/v1/auth/oauth/callback
第三方登录回调
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| provider | string | 是 | wechat / qq / weibo |
| code | string | 是 | 第三方授权码 |
| state | string | 是 | 防CSRF随机串 |
| nickname | string | 否 | 首次登录的昵称 |

**后端逻辑**：
1. 验证 state 与请求时下发的一致
2. 用 code 换取第三方 access_token
3. 获取第三方用户信息（unionid/openid）
4. 查询 t_oauth_account 是否已绑定
5. 已绑定→返回内部Token
6. 未绑定→创建新用户并绑定，返回内部Token
7. 返回 accessToken + refreshToken

**响应**：
```json
{
  "code": 200,
  "data": {
    "uid": "U202606080001",
    "nickname": "用户080001",
    "isNewUser": true,
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG...",
    "expiresIn": 7200
  }
}
```

#### POST /api/v1/auth/sms/send
发送验证码
| 字段 | 类型 | 必填 | 校验规则 | 说明 |
|------|------|------|----------|------|
| phone | string | 是 | 11位数字 | 手机号 |
| type | string | 是 | register/login/reset | 用途 |

**后端逻辑**：
1. 校验手机号格式
2. 频率限制：60s内1次，每天最多10次
3. 生成6位验证码，存Redis，5分钟有效
4. 调用短信服务
5. 返回成功

#### POST /api/v1/auth/refresh
刷新Token
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| refreshToken | string | 是 | 刷新令牌 |

#### POST /api/v1/auth/logout
登出（需鉴权）
- 使当前accessToken和refreshToken失效
- 记录登出日志

#### PUT /api/v1/auth/password/reset
重置密码
| 字段 | 类型 | 必填 | 校验规则 | 说明 |
|------|------|------|----------|------|
| phone | string | 是 | 11位数字 | 手机号 |
| code | string | 是 | 6位数字 | 验证码 |
| newPassword | string | 是 | 8-16位含字母数字 | 新密码 |

#### GET /api/v1/user/profile
获取用户信息（需鉴权）
**响应**：
```json
{
  "code": 200,
  "data": {
    "uid": "U202606080001",
    "phone": "138****8001",
    "nickname": "音乐达人",
    "avatar": "https://cdn.xx.com/avatar/xxx.jpg",
    "gender": 1,
    "birthday": "1995-06-15",
    "signature": "爱音乐爱生活",
    "memberLevel": 1,
    "memberExpireAt": "2027-06-08T00:00:00Z",
    "createdAt": "2026-06-08T10:00:00Z"
  }
}
```

#### PUT /api/v1/user/profile
修改用户信息（需鉴权）
| 字段 | 类型 | 必填 | 校验规则 | 说明 |
|------|------|------|----------|------|
| nickname | string | 否 | 1-20字符 | 昵称 |
| avatar | string | 否 | URL | 头像URL |
| gender | number | 否 | 0未知/1男/2女 | 性别 |
| birthday | string | 否 | yyyy-MM-dd | 生日 |
| signature | string | 否 | 0-100字符 | 签名 |

#### PUT /api/v1/user/password
修改密码（需鉴权）
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| oldPassword | string | 是 | 旧密码 |
| newPassword | string | 是 | 新密码，8-16位含字母数字 |

---

### 3.2 音乐服务接口（music-service）

#### GET /api/v1/song/:id
获取歌曲详情
**响应**：
```json
{
  "code": 200,
  "data": {
    "id": "S001",
    "name": "晴天",
    "artists": [
      {"id": "A001", "name": "周杰伦", "role": "main"},
      {"id": "A002", "name": "方文山", "role": "feat"}
    ],
    "album": {"id": "AL001", "name": "叶惠美", "cover": "https://cdn.xx.com/cover/xxx.jpg"},
    "duration": 269,
    "tags": ["华语", "流行"],
    "isVip": false,
    "qualities": ["standard", "high", "lossless"]
  }
}
```
> ✅#3 artists 数组支持多对多，含 role(main/feat/producer) 标识

#### GET /api/v1/song/:id/url
获取歌曲播放地址（需鉴权）
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| quality | string | 否 | standard/high/lossless，默认high |

**后端逻辑**：
1. 校验Token
2. 校验会员等级→无损音质需VIP及以上
3. 检查歌曲可用性
4. 生成签名URL（2h有效）
5. 记录播放日志
6. 返回播放地址

**响应**：
```json
{
  "code": 200,
  "data": {
    "url": "https://cdn.xx.com/audio/xxx.mp3?sign=xxx&expire=xxx",
    "quality": "high",
    "format": "mp3",
    "bitrate": 320,
    "expiresAt": "2026-06-08T12:00:00Z"
  }
}
```

#### ✅#13 GET /api/v1/song/:id/download
PC端专用下载接口（需鉴权）
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| quality | string | 否 | 默认high |

**后端逻辑**：
1. 鉴权（普通用户即可，付费歌曲校验会员）
2. 获取音源CDN URL（直传，跳过签名2h过期）
3. 服务端302重定向到CDN地址，带一次性下载Token（24h有效，限下载1次）
4. 写下载记录（t_pending_queue 或新建 t_download_log）

**响应**：302重定向
```
HTTP/1.1 302 Found
Location: https://cdn.xx.com/audio/high/S001/S001_320.mp3?dl_token=xxx&exp=xxx
```

> Web端不使用此接口，使用播放地址 + Service Worker 缓存。

#### GET /api/v1/song/:id/lyrics
获取歌词
**响应**：
```json
{
  "code": 200,
  "data": {
    "lrc": "[00:00.00]晴天 - 周杰伦\n[00:05.00]词：周杰伦\n...",
    "tlyric": "[00:05.00]Lyrics: Jay Chou\n...",
    "lyricType": "lrc"
  }
}
```

#### POST /api/v1/song/:id/report
播放上报（需鉴权）
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| progress | number | 是 | 播放进度(秒) |
| duration | number | 是 | 歌曲总时长(秒) |
| quality | string | 是 | 当前音质 |
| playSource | string | 是 | search/playlist/recommend/fm |
| sourceId | string | 否 | 来源ID |

**后端逻辑**：
1. 写入 t_play_history
2. 更新 t_song.play_count
3. 异步写 t_user_behavior（用于推荐）
4. 进度>50%记为一次有效播放

#### GET /api/v1/artist/:id
获取歌手详情
**响应**：
```json
{
  "code": 200,
  "data": {
    "id": "A001",
    "name": "周杰伦",
    "avatar": "https://cdn.xx.com/artist/xxx.jpg",
    "description": "...",
    "songCount": 300,
    "albumCount": 15,
    "tags": ["华语", "流行", "R&B"]
  }
}
```

#### GET /api/v1/artist/:id/songs
获取歌手歌曲列表
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认1 |
| size | number | 否 | 每页数量，默认20，最大50 |
| sort | string | 否 | hot/time，默认hot |

#### GET /api/v1/artist/:id/albums
获取歌手专辑列表

#### GET /api/v1/album/:id
获取专辑详情
**响应**：
```json
{
  "code": 200,
  "data": {
    "id": "AL001",
    "name": "叶惠美",
    "cover": "https://cdn.xx.com/album/xxx.jpg",
    "artist": {"id": "A001", "name": "周杰伦"},
    "publishDate": "2003-07-31",
    "description": "...",
    "songCount": 11,
    "songs": [...]
  }
}
```

---

### 3.3 歌单服务接口（playlist-service）

#### POST /api/v1/playlist
创建歌单（需鉴权）
| 字段 | 类型 | 必填 | 校验规则 | 说明 |
|------|------|------|----------|------|
| name | string | 是 | 1-30字符 | 歌单名称 |
| cover | string | 否 | URL | 封面URL |
| description | string | 否 | 0-200字符 | 描述 |

**后端逻辑**：
1. 校验Token
2. 校验用户歌单数量上限（最多100个）
3. 生成唯一歌单ID
4. 写入 t_playlist
5. 返回歌单信息

#### GET /api/v1/playlist/:id
获取歌单详情
**响应**：
```json
{
  "code": 200,
  "data": {
    "id": "PL001",
    "name": "我的最爱",
    "cover": "https://cdn.xx.com/playlist/xxx.jpg",
    "description": "我最喜欢的歌",
    "creator": {"uid": "U001", "nickname": "用户001"},
    "songCount": 50,
    "playCount": 1200,
    "isOwner": true,
    "isCollected": false,
    "collectCount": 30,
    "tags": ["华语", "流行"],
    "createdAt": "2026-01-01T00:00:00Z",
    "updatedAt": "2026-06-08T10:00:00Z",
    "songs": {"list": [...], "pagination": {"page": 1, "size": 20, "total": 50}}
  }
}
```

#### PUT /api/v1/playlist/:id
更新歌单信息（需鉴权，仅创建者）
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 否 | 歌单名称 |
| cover | string | 否 | 封面URL |
| description | string | 否 | 描述 |
| tags | string[] | 否 | 标签 |

#### DELETE /api/v1/playlist/:id
删除歌单（需鉴权，仅创建者）
- 软删除，标记 deleted_at
- 清除相关缓存

#### POST /api/v1/playlist/:id/songs
添加歌曲到歌单（需鉴权，仅创建者）
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| songIds | string[] | 是 | 歌曲ID数组，最多50个 |

**后端逻辑**：
1. 校验权限（创建者）
2. 校验歌单歌曲数上限（1000首）
3. 去重（已存在跳过，返回 30003）
4. 批量写入 t_playlist_song
5. 更新 song_count 和 updated_at
6. 返回实际添加数量

#### DELETE /api/v1/playlist/:id/songs
从歌单移除歌曲（需鉴权，仅创建者）
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| songIds | string[] | 是 | 歌曲ID数组 |

#### PUT /api/v1/playlist/:id/songs/order
歌单歌曲排序（需鉴权，仅创建者）
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| songIds | string[] | 是 | 按新顺序排列的歌曲ID数组 |

#### POST /api/v1/playlist/:id/collect
收藏歌单（需鉴权）
- 写入 t_collection(target_type='playlist')
- 更新 collect_count

#### DELETE /api/v1/playlist/:id/collect
取消收藏歌单（需鉴权）

#### GET /api/v1/user/playlists
获取我的歌单列表（需鉴权）
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 否 | created/collected/all，默认all |

#### ✅#11 GET /api/v1/user/favorites
获取我喜欢的歌曲（需鉴权）
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码 |
| size | number | 否 | 每页数量 |

**响应**：
```json
{
  "code": 200,
  "data": {
    "list": [
      {"songId": "S001", "name": "晴天", "artists": [...], "addedAt": "..."}
    ],
    "total": 1234,
    "limit": 10000,
    "pagination": {"page": 1, "size": 20, "total": 1234, "totalPages": 62}
  }
}
```

#### ✅#11 POST /api/v1/user/favorites/:songId
添加到我喜欢（需鉴权）

**后端逻辑**：
1. 校验Token
2. ✅#11 统计用户当前收藏数（`SELECT COUNT(*) FROM t_collection WHERE uid=? AND target_type='song'`）
3. 已达 10000 → 返回 30005
4. 写入 t_collection（target_type='song'）
5. 重复收藏 → 唯一约束冲突返回 30003

**响应**：
```json
{"code": 200, "data": {"added": true}}
```

#### DELETE /api/v1/user/favorites/:songId
从我喜欢移除（需鉴权）
- 删除 t_collection 中对应记录

---

### 3.4 搜索服务接口（search-service）

#### ✅#17 GET /api/v1/search
综合搜索
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | string | 是 | 关键词，1-100字符 |
| type | string | 否 | song/artist/album/playlist/all，默认all |
| page | number | 否 | 页码，默认1 |
| size | number | 否 | 每页数量，默认20 |
| sort | string | 否 | relevance/hot/time，默认relevance |
| language | string | 否 | 语种筛选 |
| genre | string | 否 | 流派筛选 |

**后端逻辑**：
1. 参数校验+敏感词过滤
2. 查询Elasticsearch（✅#17 使用highlight高亮匹配关键词）
3. 聚合按type分组
4. 写入 t_search_log
5. 缓存热门结果
6. 返回结果（含 highlight 字段）

**响应**：
```json
{
  "code": 200,
  "data": {
    "songs": {
      "list": [
        {
          "id": "S001",
          "name": "晴天",
          "highlight": {"name": "<em>晴</em>天"},
          "artists": [{"id": "A001", "name": "周杰伦", "highlight": {"name": "周<em>杰</em>伦"}}],
          "album": {"id": "AL001", "name": "叶惠美"}
        }
      ],
      "pagination": {"page": 1, "size": 20, "total": 100, "totalPages": 5}
    },
    "artists": {"list": [...], "pagination": {...}},
    "albums": {"list": [...], "pagination": {...}},
    "playlists": {"list": [...], "pagination": {...}}
  }
}
```

#### GET /api/v1/search/suggest
搜索联想词
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | string | 是 | 输入内容，最少1字符 |

**后端逻辑**：
1. 从Redis查询
2. 缓存未命中→查ES completion suggester
3. 返回最多10条
4. 缓存5分钟

#### GET /api/v1/search/hot
热门搜索
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| limit | number | 否 | 默认10，最大20 |

**后端逻辑**：
1. 从Redis获取热搜列表
2. 每小时定时任务更新（基于 t_search_log）
3. 返回列表

---

### 3.5 推荐服务接口（recommend-service）

#### GET /api/v1/recommend/daily
每日推荐（需鉴权）
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| limit | number | 否 | 数量，默认30 |

**后端逻辑**：
1. 获取用户特征向量
2. 协同过滤+内容推荐生成列表
3. 缓存结果（每日0点更新）
4. 返回歌曲列表

#### GET /api/v1/recommend/fm
私人FM（需鉴权）
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| limit | number | 否 | 数量，默认10 |

**后端逻辑**：
1. 实时计算（区别于每日推荐的缓存）
2. 结合用户实时行为
3. 排除最近7天已播放
4. 返回歌曲列表

#### GET /api/v1/recommend/guess
猜你喜欢（需鉴权）
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| limit | number | 否 | 数量，默认6 |

**后端逻辑**：
1. 基于收藏歌手标签推荐歌单
2. 缓存2小时
3. 返回歌单/歌曲卡片列表

---

### 3.6 会员服务接口（member-service）

#### GET /api/v1/member/info
获取会员信息（需鉴权）
**响应**：
```json
{
  "code": 200,
  "data": {
    "level": 0,
    "levelName": "普通用户",
    "expireAt": null,
    "privileges": ["standard_quality", "high_quality"],
    "packages": [
      {"id": "PKG001", "name": "VIP月卡", "level": 1, "price": 15, "duration": 30, "unit": "day"},
      {"id": "PKG002", "name": "VIP季卡", "level": 1, "price": 40, "duration": 90, "unit": "day"},
      {"id": "PKG003", "name": "VIP年卡", "level": 1, "price": 128, "duration": 365, "unit": "day"},
      {"id": "PKG004", "name": "SVIP月卡", "level": 2, "price": 30, "duration": 30, "unit": "day"},
      {"id": "PKG005", "name": "SVIP季卡", "level": 2, "price": 78, "duration": 90, "unit": "day"},
      {"id": "PKG006", "name": "SVIP年卡", "level": 2, "price": 248, "duration": 365, "unit": "day"}
    ]
  }
}
```

#### POST /api/v1/member/order
创建订单（需鉴权）
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| packageId | string | 是 | 套餐ID |
| payMethod | string | 是 | alipay/wechat |

**后端逻辑**：
1. 校验套餐有效性
2. 生成唯一订单号
3. 计算金额
4. 写入 t_order
5. 调用支付平台预支付
6. 返回支付参数

#### ✅#9 POST /api/v1/member/pay/callback
**支付回调（不需Token鉴权，通过签名验证）**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| orderId | string | 是 | 订单号 |
| status | string | 是 | success/failed |
| tradeNo | string | 是 | 第三方交易号 |
| sign | string | 是 | 第三方签名 |
| timestamp | string | 是 | 回调时间戳 |

**后端逻辑**：
1. ✅#9 验证第三方签名（RSA2/HMAC-SHA256，按支付平台文档）
2. 校验时间戳偏移（≤5分钟，防重放）
3. 幂等处理（基于 orderId+tradeNo 防重复回调）
4. 更新 t_order.status
5. 成功→更新 t_member.level 和 expire_at
6. 写支付日志+审计日志
7. 返回 success 字符串确认（按支付平台协议）

**签名错误**：返回 400（错误码 40004）

#### GET /api/v1/member/check
权益校验（需鉴权）
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| privilege | string | 是 | lossless_quality/paid_songs/ad_free/speed_download/exclusive_effect |

**响应**：
```json
{
  "code": 200,
  "data": {"hasPrivilege": true, "level": 1, "levelName": "VIP"}
}
```

---

### 3.7 文件服务接口（file-service）

#### POST /api/v1/file/upload
上传文件（需鉴权）
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | binary | 是 | 文件内容 |
| type | string | 是 | avatar/playlist_cover/feedback |

**后端逻辑**：
1. 校验文件类型和大小（avatar:2MB, cover:5MB, feedback:10MB）
2. 生成唯一文件名
3. 上传OSS
4. 返回CDN URL

#### GET /api/v1/file/:id
获取文件（公开，通过CDN直接访问）

---

### 3.8 设置与反馈接口

#### GET /api/v1/user/settings
获取用户设置（需鉴权）

#### PUT /api/v1/user/settings
保存用户设置（需鉴权）
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| settings | object | 是 | 设置项键值对 |

**设置项定义**：
| key | 类型 | 默认值 | 说明 |
|-----|------|--------|------|
| cache_size | number | 2048 | 缓存大小(MB) |
| play_speed | number | 1.0 | 播放速度 |
| quality_preference | string | "high" | 音质偏好 |
| auto_play | boolean | false | 启动自动播放 |
| fade_in_out | boolean | true | 淡入淡出 |
| theme | string | "system" | 主题（✅#6 默认跟随系统） |
| lyric_font_size | string | "medium" | 歌词字体 |
| lyric_translation | boolean | true | 歌词翻译 |
| privacy_playlist | boolean | true | 公开歌单 |
| privacy_favorite | boolean | true | 公开喜欢 |

#### POST /api/v1/feedback
提交反馈（需鉴权）
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| content | string | 是 | 反馈内容，5-500字符 |
| category | string | 是 | bug/suggestion/other |
| images | string[] | 否 | 截图URL，最多3张 |
| contact | string | 否 | 联系方式 |

#### ✅#10 GET /api/v1/user/history
获取播放历史（需鉴权，配合清理任务）
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码 |
| size | number | 否 | 每页数量，默认20 |

#### ✅#10 DELETE /api/v1/user/history
清空播放历史（需鉴权）

#### ✅#2 GET /api/v1/user/pending-queue
获取待播队列（需鉴权）

**响应**：
```json
{
  "code": 200,
  "data": {
    "list": [
      {"id": 1, "songId": "S001", "name": "晴天", "artists": [...], "sortOrder": 1, "addedAt": "..."}
    ],
    "total": 5
  }
}
```

#### ✅#2 POST /api/v1/user/pending-queue
添加歌曲到待播（需鉴权）
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| songId | string | 是 | 歌曲ID |
| playNext | boolean | 否 | true=下一首播放，false=追加到末尾，默认false |

**后端逻辑**：
1. 校验Token
2. 计算 sortOrder（playNext=true 插入最前，否则追加末尾）
3. 重复歌曲→忽略（不抛错）
4. 写入 t_pending_queue
5. 失效缓存 pending:queue:{uid}

#### ✅#2 DELETE /api/v1/user/pending-queue/:id
从待播队列移除

#### ✅#2 PUT /api/v1/user/pending-queue/order
待播队列排序
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| ids | number[] | 是 | 按新顺序排列的待播ID数组 |

#### ✅#2 DELETE /api/v1/user/pending-queue
清空待播队列（需鉴权）

---

### ✅#20 3.9 通知服务接口（notify-service）

#### GET /api/v1/notifications
获取通知列表（需鉴权）
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认1 |
| size | number | 否 | 每页数量，默认20 |
| type | string | 否 | system/member/interaction，默认全部 |

**响应**：
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": "N001",
        "type": "system",
        "title": "系统通知",
        "content": "欢迎使用XX音乐",
        "link": "https://xx.com/notice/1",
        "isRead": false,
        "createdAt": "2026-06-08T10:00:00Z"
      }
    ],
    "unreadCount": 3,
    "pagination": {"page": 1, "size": 20, "total": 10}
  }
}
```

#### PUT /api/v1/notifications/read
标记通知已读（需鉴权）
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| ids | string[] | 否 | 通知ID数组，为空则标记全部已读 |

**后端逻辑**：
1. 校验Token
2. ids 为空 → UPDATE t_notification SET is_read=1, read_at=NOW() WHERE uid=?
3. ids 非空 → UPDATE ... WHERE uid=? AND id IN (...)
4. 失效缓存 notify:unread:{uid}
5. 返回更新条数

#### GET /api/v1/notifications/unread-count
获取未读数量（需鉴权）

**响应**：
```json
{"code": 200, "data": {"unreadCount": 3}}
```

**优化**：先读 Redis 缓存 notify:unread:{uid}，未命中再查 DB 并回填

---

## 四、数据库设计

### 4.1 用户表（t_user）
| 字段名 | 类型 | 主键 | 索引 | 约束 | 注释 |
|--------|------|------|------|------|------|
| id | BIGINT | PK | - | AUTO_INCREMENT | 自增主键 |
| uid | VARCHAR(20) | - | UNIQUE | NOT NULL | 用户唯一标识 |
| phone | VARCHAR(11) | - | UNIQUE | NOT NULL | 手机号(加密) |
| password | VARCHAR(60) | - | - | NOT NULL | BCrypt加密密码 |
| nickname | VARCHAR(20) | - | - | NOT NULL | 昵称 |
| avatar | VARCHAR(255) | - | - | - | 头像URL |
| gender | TINYINT | - | - | DEFAULT 0 | 0未知/1男/2女 |
| birthday | DATE | - | - | - | 生日 |
| signature | VARCHAR(100) | - | - | - | 个性签名 |
| status | TINYINT | - | IDX | DEFAULT 1 | 0禁用/1正常 |
| login_fail_count | INT | - | - | DEFAULT 0 | 连续登录失败次数 |
| lock_until | DATETIME | - | - | - | 锁定截止时间 |
| last_login_at | DATETIME | - | - | - | 最后登录时间 |
| last_login_ip | VARCHAR(45) | - | - | - | 最后登录IP |
| created_at | DATETIME | - | - | NOT NULL | 创建时间 |
| updated_at | DATETIME | - | - | NOT NULL | 更新时间 |
| deleted_at | DATETIME | - | - | - | 软删除时间 |

### ✅#3 ✅#19 4.2 歌曲表（t_song）
| 字段名 | 类型 | 主键 | 索引 | 约束 | 注释 |
|--------|------|------|------|------|------|
| id | BIGINT | PK | - | AUTO_INCREMENT | 自增主键 |
| song_id | VARCHAR(20) | - | UNIQUE | NOT NULL | 歌曲唯一标识 |
| name | VARCHAR(100) | - | IDX | NOT NULL | 歌曲名称 |
| default_artist_id | BIGINT | - | IDX | - | ✅#3 默认主歌手ID（冗余字段，便于列表查询） |
| album_id | BIGINT | - | IDX | - | 专辑ID |
| duration | INT | - | - | - | 时长(秒) |
| is_vip | TINYINT | - | IDX | DEFAULT 0 | 是否付费歌曲 |
| has_standard | TINYINT | - | - | DEFAULT 1 | 有标准音质 |
| has_high | TINYINT | - | - | DEFAULT 1 | 有高清音质 |
| has_lossless | TINYINT | - | - | DEFAULT 0 | 有无损音质 |
| lyric_url | VARCHAR(255) | - | - | - | 歌词文件URL |
| tlyric_url | VARCHAR(255) | - | - | - | 翻译歌词URL |
| play_count | BIGINT | - | IDX | DEFAULT 0 | 播放次数 |
| status | TINYINT | - | IDX | DEFAULT 1 | 0下架/1正常 |
| source | VARCHAR(20) | - | - | - | 来源(netease/qq/local) |
| source_id | VARCHAR(50) | - | - | - | 来源平台ID |
| created_at | DATETIME | - | **IDX** | NOT NULL | ✅#19 新增索引（新歌速递按时间排序） |

### ✅#3 4.3 歌曲-歌手关联表（t_song_artist）
| 字段名 | 类型 | 主键 | 索引 | 约束 | 注释 |
|--------|------|------|------|------|------|
| id | BIGINT | PK | - | AUTO_INCREMENT | 自增主键 |
| song_id | BIGINT | - | IDX | NOT NULL | 歌曲ID(外键→t_song.id) |
| artist_id | BIGINT | - | IDX | NOT NULL | 歌手ID(外键→t_artist.id) |
| role | VARCHAR(20) | - | - | NOT NULL | main/feat/producer |
| sort_order | INT | - | - | DEFAULT 0 | 展示顺序 |

**唯一约束**：UNIQUE(song_id, artist_id, role)

**关联查询示例**：
```sql
-- 获取歌曲的所有歌手
SELECT a.artist_id, a.name, sa.role
FROM t_song_artist sa
JOIN t_artist a ON a.id = sa.artist_id
WHERE sa.song_id = ? AND a.deleted_at IS NULL
ORDER BY sa.sort_order ASC;
```

### 4.4 歌手表（t_artist）
| 字段名 | 类型 | 主键 | 索引 | 约束 | 注释 |
|--------|------|------|------|------|------|
| id | BIGINT | PK | - | AUTO_INCREMENT | 自增主键 |
| artist_id | VARCHAR(20) | - | UNIQUE | NOT NULL | 歌手唯一标识 |
| name | VARCHAR(50) | - | IDX | NOT NULL | 歌手名称 |
| avatar | VARCHAR(255) | - | - | - | 头像URL |
| description | TEXT | - | - | - | 简介 |
| song_count | INT | - | - | DEFAULT 0 | 歌曲数 |
| album_count | INT | - | - | DEFAULT 0 | 专辑数 |
| tags | VARCHAR(200) | - | - | - | 标签(逗号分隔) |
| status | TINYINT | - | IDX | DEFAULT 1 | 状态 |
| created_at | DATETIME | - | - | NOT NULL | 创建时间 |
| updated_at | DATETIME | - | - | NOT NULL | 更新时间 |

### 4.5 专辑表（t_album）
| 字段名 | 类型 | 主键 | 索引 | 约束 | 注释 |
|--------|------|------|------|------|------|
| id | BIGINT | PK | - | AUTO_INCREMENT | 自增主键 |
| album_id | VARCHAR(20) | - | UNIQUE | NOT NULL | 专辑唯一标识 |
| name | VARCHAR(100) | - | IDX | NOT NULL | 专辑名称 |
| cover | VARCHAR(255) | - | - | - | 封面URL |
| artist_id | BIGINT | - | IDX | - | 歌手ID |
| publish_date | DATE | - | IDX | - | 发行日期 |
| description | TEXT | - | - | - | 简介 |
| song_count | INT | - | - | DEFAULT 0 | 歌曲数 |
| status | TINYINT | - | IDX | DEFAULT 1 | 状态 |
| created_at | DATETIME | - | - | NOT NULL | 创建时间 |
| updated_at | DATETIME | - | - | NOT NULL | 更新时间 |

### 4.6 歌单表（t_playlist）
| 字段名 | 类型 | 主键 | 索引 | 约束 | 注释 |
|--------|------|------|------|------|------|
| id | BIGINT | PK | - | AUTO_INCREMENT | 自增主键 |
| playlist_id | VARCHAR(20) | - | UNIQUE | NOT NULL | 歌单唯一标识 |
| name | VARCHAR(30) | - | - | NOT NULL | 歌单名称 |
| cover | VARCHAR(255) | - | - | - | 封面URL |
| description | VARCHAR(200) | - | - | - | 描述 |
| creator_uid | VARCHAR(20) | - | IDX | NOT NULL | 创建者UID |
| song_count | INT | - | - | DEFAULT 0 | 歌曲数 |
| play_count | BIGINT | - | IDX | DEFAULT 0 | 播放次数 |
| collect_count | INT | - | IDX | DEFAULT 0 | 收藏次数 |
| tags | VARCHAR(200) | - | - | - | 标签 |
| is_official | TINYINT | - | IDX | DEFAULT 0 | 是否官方歌单 |
| status | TINYINT | - | IDX | DEFAULT 1 | 状态 |
| created_at | DATETIME | - | - | NOT NULL | 创建时间 |
| updated_at | DATETIME | - | - | NOT NULL | 更新时间 |
| deleted_at | DATETIME | - | - | - | 软删除时间 |

### ✅#12 4.7 歌单歌曲关联表（t_playlist_song）
| 字段名 | 类型 | 主键 | 索引 | 约束 | 注释 |
|--------|------|------|------|------|------|
| id | BIGINT | PK | - | AUTO_INCREMENT | 自增主键 |
| playlist_id | BIGINT | - | IDX | NOT NULL | ✅#12 歌单ID(外键→t_playlist.id) |
| song_id | BIGINT | - | IDX | NOT NULL | ✅#12 歌曲ID(外键→t_song.id) |
| sort_order | INT | - | - | DEFAULT 0 | 排序序号 |
| added_at | DATETIME | - | - | NOT NULL | 添加时间 |

**唯一约束**：UNIQUE(playlist_id, song_id)

> ✅#12 业务层使用 playlist_id/song_id（VARCHAR）作为业务标识；数据层通过自增 id（BIGINT）做外键关联。查询时通过 JOIN 获取业务ID：
>
> ```sql
> SELECT p.playlist_id, s.song_id, ps.sort_order
> FROM t_playlist_song ps
> JOIN t_playlist p ON p.id = ps.playlist_id
> JOIN t_song s ON s.id = ps.song_id
> WHERE p.playlist_id = ?
> ORDER BY ps.sort_order ASC;
> ```

### ✅#5 4.8 收藏表（t_collection）
| 字段名 | 类型 | 主键 | 索引 | 约束 | 注释 |
|--------|------|------|------|------|------|
| id | BIGINT | PK | - | AUTO_INCREMENT | 自增主键 |
| uid | VARCHAR(20) | - | IDX | NOT NULL | 用户UID |
| target_type | VARCHAR(20) | - | - | NOT NULL | ✅#5 song(喜欢歌曲) / playlist(收藏歌单) |
| target_id | VARCHAR(20) | - | - | NOT NULL | 目标ID |
| created_at | DATETIME | - | - | NOT NULL | 收藏时间 |

**唯一约束**：UNIQUE(uid, target_type, target_id)

> ✅#5 概念统一：
> - "喜欢歌曲" = t_collection 中 target_type='song' 的记录
> - "收藏歌单" = t_collection 中 target_type='playlist' 的记录
>
> ✅#11 校验收藏数时过滤 target_type='song'

### 4.9 播放历史表（t_play_history）
| 字段名 | 类型 | 主键 | 索引 | 约束 | 注释 |
|--------|------|------|------|------|------|
| id | BIGINT | PK | - | AUTO_INCREMENT | 自增主键 |
| uid | VARCHAR(20) | - | IDX | NOT NULL | 用户UID |
| song_id | VARCHAR(20) | - | IDX | NOT NULL | 歌曲ID |
| progress | INT | - | - | DEFAULT 0 | 播放进度(秒) |
| duration | INT | - | - | - | 歌曲时长(秒) |
| quality | VARCHAR(20) | - | - | - | 音质 |
| play_source | VARCHAR(20) | - | - | - | 播放来源 |
| source_id | VARCHAR(20) | - | - | - | 来源ID |
| device | VARCHAR(20) | - | - | - | 设备类型 |
| is_complete | TINYINT | - | - | DEFAULT 0 | 是否播放>50% |
| played_at | DATETIME | - | IDX | NOT NULL | 播放时间 |

**索引**：IDX(uid, played_at DESC)
> ✅#10 由清理任务保证每用户最多 100 条

### ✅#2 4.10 待播队列表（t_pending_queue）
| 字段名 | 类型 | 主键 | 索引 | 约束 | 注释 |
|--------|------|------|------|------|------|
| id | BIGINT | PK | - | AUTO_INCREMENT | 自增主键 |
| uid | VARCHAR(20) | - | IDX | NOT NULL | 用户UID |
| song_id | VARCHAR(20) | - | IDX | NOT NULL | 歌曲ID |
| sort_order | INT | - | - | DEFAULT 0 | 播放顺序 |
| created_at | DATETIME | - | - | NOT NULL | 添加时间 |

**唯一约束**：UNIQUE(uid, song_id)

**索引**：IDX(uid, sort_order ASC)

### 4.11 用户设置表（t_user_settings）
| 字段名 | 类型 | 主键 | 索引 | 约束 | 注释 |
|--------|------|------|------|------|------|
| id | BIGINT | PK | - | AUTO_INCREMENT | 自增主键 |
| uid | VARCHAR(20) | - | UNIQUE | NOT NULL | 用户UID |
| settings | JSON | - | - | NOT NULL | 设置项JSON |
| created_at | DATETIME | - | - | NOT NULL | 创建时间 |
| updated_at | DATETIME | - | - | NOT NULL | 更新时间 |

### 4.12 会员表（t_member）
| 字段名 | 类型 | 主键 | 索引 | 约束 | 注释 |
|--------|------|------|------|------|------|
| id | BIGINT | PK | - | AUTO_INCREMENT | 自增主键 |
| uid | VARCHAR(20) | - | UNIQUE | NOT NULL | 用户UID |
| level | TINYINT | - | IDX | DEFAULT 0 | 0普通/1VIP/2SVIP |
| expire_at | DATETIME | - | IDX | - | 到期时间 |
| auto_renew | TINYINT | - | - | DEFAULT 0 | 自动续费 |
| created_at | DATETIME | - | - | NOT NULL | 开通时间 |
| updated_at | DATETIME | - | - | NOT NULL | 更新时间 |

### 4.13 订单表（t_order）
| 字段名 | 类型 | 主键 | 索引 | 约束 | 注释 |
|--------|------|------|------|------|------|
| id | BIGINT | PK | - | AUTO_INCREMENT | 自增主键 |
| order_no | VARCHAR(32) | - | UNIQUE | NOT NULL | 订单号 |
| uid | VARCHAR(20) | - | IDX | NOT NULL | 用户UID |
| package_id | VARCHAR(20) | - | - | NOT NULL | 套餐ID |
| amount | DECIMAL(10,2) | - | - | NOT NULL | 金额 |
| pay_method | VARCHAR(20) | - | - | NOT NULL | 支付方式 |
| status | TINYINT | - | IDX | DEFAULT 0 | 0待支付/1已支付/2已取消/3已退款 |
| trade_no | VARCHAR(64) | - | - | - | 第三方交易号 |
| paid_at | DATETIME | - | - | - | 支付时间 |
| created_at | DATETIME | - | - | NOT NULL | 创建时间 |
| updated_at | DATETIME | - | - | NOT NULL | 更新时间 |

### 4.14 反馈表（t_feedback）
| 字段名 | 类型 | 主键 | 索引 | 约束 | 注释 |
|--------|------|------|------|------|------|
| id | BIGINT | PK | - | AUTO_INCREMENT | 自增主键 |
| uid | VARCHAR(20) | - | IDX | NOT NULL | 用户UID |
| content | VARCHAR(500) | - | - | NOT NULL | 反馈内容 |
| category | VARCHAR(20) | - | IDX | NOT NULL | bug/suggestion/other |
| images | VARCHAR(1000) | - | - | - | 截图URL(JSON数组) |
| contact | VARCHAR(50) | - | - | - | 联系方式 |
| status | TINYINT | - | IDX | DEFAULT 0 | 0待处理/1处理中/2已处理 |
| reply | VARCHAR(500) | - | - | - | 回复内容 |
| created_at | DATETIME | - | - | NOT NULL | 创建时间 |
| updated_at | DATETIME | - | - | NOT NULL | 更新时间 |

### 4.15 搜索日志表（t_search_log）
| 字段名 | 类型 | 主键 | 索引 | 约束 | 注释 |
|--------|------|------|------|------|------|
| id | BIGINT | PK | - | AUTO_INCREMENT | 自增主键 |
| uid | VARCHAR(20) | - | IDX | - | 用户UID(未登录为空) |
| keyword | VARCHAR(100) | - | IDX | NOT NULL | 搜索关键词 |
| result_count | INT | - | - | - | 结果数量 |
| search_type | VARCHAR(20) | - | - | - | 搜索类型 |
| ip | VARCHAR(45) | - | - | - | 请求IP |
| created_at | DATETIME | - | IDX | NOT NULL | 搜索时间 |

### ✅#18 4.16 用户行为日志表（t_user_behavior）
> ✅#18 按月分表（t_user_behavior_202606），历史数据归档HDFS

| 字段名 | 类型 | 主键 | 索引 | 约束 | 注释 |
|--------|------|------|------|------|------|
| id | BIGINT | PK | - | AUTO_INCREMENT | 自增主键 |
| uid | VARCHAR(20) | - | IDX | NOT NULL | 用户UID |
| action | VARCHAR(30) | - | IDX | NOT NULL | play/like/collect/search/skip |
| target_type | VARCHAR(20) | - | - | - | 目标类型 |
| target_id | VARCHAR(20) | - | - | - | 目标ID |
| extra | JSON | - | - | - | 扩展信息 |
| created_at | DATETIME | - | IDX | NOT NULL | 行为时间 |

**分表策略**：按月分表，命名 `t_user_behavior_YYYYMM`
**归档策略**：每月1日定时任务将上月表导出至HDFS，保留在线3个月

### 4.17 套餐表（t_package）
| 字段名 | 类型 | 主键 | 索引 | 约束 | 注释 |
|--------|------|------|------|------|------|
| id | BIGINT | PK | - | AUTO_INCREMENT | 自增主键 |
| package_id | VARCHAR(20) | - | UNIQUE | NOT NULL | 套餐唯一标识 |
| name | VARCHAR(30) | - | - | NOT NULL | 套餐名称 |
| level | TINYINT | - | IDX | NOT NULL | 会员等级 |
| price | DECIMAL(10,2) | - | - | NOT NULL | 价格 |
| duration | INT | - | - | NOT NULL | 时长 |
| unit | VARCHAR(10) | - | - | NOT NULL | 单位:day/month |
| status | TINYINT | - | - | DEFAULT 1 | 状态 |
| sort_order | INT | - | - | DEFAULT 0 | 排序 |
| created_at | DATETIME | - | - | NOT NULL | 创建时间 |
| updated_at | DATETIME | - | - | NOT NULL | 更新时间 |

### ✅#4 4.18 第三方账号绑定表（t_oauth_account）
| 字段名 | 类型 | 主键 | 索引 | 约束 | 注释 |
|--------|------|------|------|------|------|
| id | BIGINT | PK | - | AUTO_INCREMENT | 自增主键 |
| uid | VARCHAR(20) | - | IDX | NOT NULL | 内部用户UID |
| provider | VARCHAR(20) | - | IDX | NOT NULL | wechat/qq/weibo |
| openid | VARCHAR(64) | - | UNIQUE | NOT NULL | 第三方OpenID |
| unionid | VARCHAR(64) | - | - | - | 微信开放平台UnionID |
| access_token | VARCHAR(255) | - | - | - | 第三方Token |
| refresh_token | VARCHAR(255) | - | - | - | 第三方刷新Token |
| expire_at | DATETIME | - | - | - | Token过期时间 |
| created_at | DATETIME | - | - | NOT NULL | 绑定时间 |
| updated_at | DATETIME | - | - | NOT NULL | 更新时间 |

**唯一约束**：UNIQUE(provider, openid)

### ✅#20 4.19 通知表（t_notification）
| 字段名 | 类型 | 主键 | 索引 | 约束 | 注释 |
|--------|------|------|------|------|------|
| id | BIGINT | PK | - | AUTO_INCREMENT | 自增主键 |
| uid | VARCHAR(20) | - | IDX | NOT NULL | 接收用户UID |
| type | VARCHAR(20) | - | IDX | NOT NULL | system/member/interaction |
| title | VARCHAR(100) | - | - | NOT NULL | 通知标题 |
| content | VARCHAR(500) | - | - | NOT NULL | 通知内容 |
| link | VARCHAR(255) | - | - | - | 跳转链接 |
| is_read | TINYINT | - | IDX | DEFAULT 0 | 0未读/1已读 |
| read_at | DATETIME | - | - | - | 已读时间 |
| created_at | DATETIME | - | IDX | NOT NULL | 创建时间 |

**索引**：IDX(uid, is_read, created_at DESC)

---

## 五、缓存设计

### 5.1 缓存策略
| 缓存项 | Key格式 | 过期时间 | 更新策略 | 说明 |
|--------|---------|----------|----------|------|
| 验证码 | sms:code:{phone} | 5min | 写入时设置 | 一次性使用 |
| 验证码频率 | sms:limit:{phone} | 60s/24h | 写入时设置 | 防刷限制 |
| accessToken | token:access:{uid} | 2h | 登录时写入 | Token校验 |
| refreshToken | token:refresh:{uid} | 30d | 登录时写入 | Token刷新 |
| 热门搜索 | search:hot | 1h | 定时任务 | 热搜列表 |
| 搜索联想 | search:suggest:{prefix} | 5min | LRU淘汰 | 联想词 |
| 搜索结果 | search:result:{keyword}:{type} | 10min | LRU淘汰 | 搜索结果 |
| 歌曲详情 | song:detail:{songId} | 1h | 数据变更时删除 | 歌曲信息 |
| 歌手详情 | artist:detail:{artistId} | 2h | 数据变更时删除 | 歌手信息 |
| 专辑详情 | album:detail:{albumId} | 2h | 数据变更时删除 | 专辑信息 |
| 歌单详情 | playlist:detail:{playlistId} | 30min | 数据变更时删除 | 歌单信息 |
| 每日推荐 | recommend:daily:{uid} | 24h | 每日0点刷新 | 推荐列表 |
| 猜你喜欢 | recommend:guess:{uid} | 2h | 定时更新 | 推荐歌单 |
| 首页数据 | home:data | 10min | 定时更新 | 首页聚合 |
| 播放地址 | song:url:{songId}:{quality} | 30min | 签名过期时刷新 | 播放链接 |
| 用户设置 | user:settings:{uid} | 无过期 | 修改时更新 | 用户设置 |
| 待播队列 | pending:queue:{uid} | 7d | 变更时更新 | ✅#2 用户待播列表 |
| 未读通知数 | notify:unread:{uid} | 1h | 读/收时更新 | ✅#20 未读数量 |
| 下载Token | dl:token:{uid}:{songId} | 24h | 一次性使用 | ✅#13 PC端下载 |

### 5.2 缓存淘汰策略
- **内存策略**：allkeys-lru
- **最大内存**：16GB（集群）
- **淘汰规则**：优先淘汰TTL最短且访问频率最低的key

### 5.3 缓存一致性
- **写操作**：先更新数据库→再删除缓存（Cache Aside Pattern）
- **读操作**：先读缓存→未命中→读数据库→写缓存
- **批量操作**：使用Pipeline减少网络开销

---

## 六、文件服务设计

### 6.1 存储方案
| 文件类型 | 存储位置 | CDN | 格式限制 | 大小限制 |
|----------|----------|-----|----------|----------|
| 音频文件 | OSS | 是 | mp3/flac/wav | 单文件<200MB |
| 歌曲封面 | OSS | 是 | jpg/png/webp | 单文件<5MB |
| 歌词文件 | OSS | 是 | lrc/json | 单文件<100KB |
| 用户头像 | OSS | 是 | jpg/png/webp | 单文件<2MB |
| 歌单封面 | OSS | 是 | jpg/png/webp | 单文件<5MB |
| 反馈截图 | OSS | 否 | jpg/png | 单文件<10MB |

### 6.2 CDN策略
| 资源 | 缓存时间 | 刷新策略 |
|------|----------|----------|
| 音频文件 | 7天 | 版本号更新 |
| 封面图片 | 30天 | URL参数刷新 |
| 歌词文件 | 1天 | 版本号更新 |
| 用户上传 | 1天 | 上传后刷新 |

### 6.3 音频文件命名规则
```
/audio/{quality}/{songId}/{songId}_{bitrate}.{format}
例：/audio/high/S001/S001_320.mp3
例：/audio/lossless/S001/S001_1411.flac
```

### 6.4 图片处理
- 上传时自动生成多尺寸缩略图（50x50, 100x100, 200x200, 400x400）
- WebP格式自动转换
- 图片裁剪（歌单封面1:1）

---

## 七、日志与监控

### 7.1 日志分类
| 日志类型 | 存储位置 | 保留时间 | 说明 |
|----------|----------|----------|------|
| 接口访问日志 | ELK | 30天 | 每次API请求记录 |
| 错误日志 | ELK | 90天 | 异常堆栈 |
| 播放上报日志 | Kafka→HDFS | 180天 | 用户播放行为 |
| 用户行为日志 | Kafka→HDFS（按月分表 ✅#18） | 180天 | 喜欢/收藏/搜索等 |
| 系统日志 | ELK | 30天 | 服务启停/配置变更 |
| 审计日志 | MySQL | 365天 | 敏感操作记录 |

### 7.2 接口访问日志格式
```json
{
  "timestamp": "2026-06-08T10:00:00.000Z",
  "traceId": "abc123",
  "method": "GET",
  "path": "/api/v1/song/S001",
  "status": 200,
  "duration": 45,
  "uid": "U001",
  "ip": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "requestId": "req-xxx"
}
```

### 7.3 监控指标
| 指标 | 告警阈值 | 说明 |
|------|----------|------|
| API响应时间P99 | > 500ms | 接口慢查询 |
| API错误率 | > 1% | 接口异常 |
| CPU使用率 | > 80% | 服务器负载 |
| 内存使用率 | > 85% | 内存压力 |
| Redis命中率 | < 90% | 缓存效率 |
| MySQL慢查询 | > 1s | 数据库性能 |
| 播放失败率 | > 5% | 播放可用性 |
| 并发连接数 | > 10000 | 连接压力 |

### 7.4 告警规则
- **P0（紧急）**：服务宕机、数据库不可用→电话+短信
- **P1（严重）**：错误率>5%、响应时间>2s→短信+IM
- **P2（警告）**：CPU>80%、内存>85%→IM通知
- **P3（提醒）**：慢查询、缓存命中率低→邮件

---

## 八、安全与权限

### 8.1 接口安全
| 措施 | 说明 |
|------|------|
| HTTPS | 全站HTTPS，HSTS |
| Token鉴权 | JWT，accessToken+refreshToken双Token |
| ✅#9 支付回调签名 | RSA2/HMAC-SHA256，5分钟时间戳防重放 |
| 接口限流 | 令牌桶，普通100次/分钟，登录10次/分钟 |
| SQL注入防护 | 参数化查询，ORM框架 |
| XSS防护 | 输入过滤+输出转义，CSP策略 |
| CSRF防护 | SameSite Cookie + CSRF Token |
| 参数校验 | 服务端全量校验 |

### 8.2 数据安全
| 措施 | 说明 |
|------|------|
| 密码加密 | BCrypt，cost factor=12 |
| 手机号脱敏 | 日志和响应中脱敏(138****8001) |
| 数据库加密 | 敏感字段(AES-256)加密存储 |
| 传输加密 | TLS 1.3 |
| 数据备份 | 每日全量+实时binlog |

### 8.3 权限控制
| 角色 | 权限 |
|------|------|
| 游客 | 搜索、浏览、标准音质播放 |
| 普通用户 | 游客权限+歌单管理+收藏+高清音质 |
| VIP | 普通用户权限+无损音质+付费曲库+无广告 |
| SVIP | VIP权限+专属音效+极速下载+抢先听 |
| 管理员 | 全部权限+后台管理 |

### 8.4 播放鉴权流程
```
1. 用户请求播放地址 → 校验Token
2. 检查歌曲是否付费 → 否→直接返回
3. 是→检查用户会员等级
4. 等级不足→返回403+升级提示
5. 等级足够→检查音质权限
6. 音质无权限→降级到允许的最高音质
7. 生成签名URL→返回
```

---

## 九、部署与运维

### 9.1 环境规划
| 环境 | 用途 | 配置 | 数据 |
|------|------|------|------|
| dev | 开发 | 2C4G×1 | 模拟数据 |
| test | 测试 | 4C8G×2 | 脱敏数据 |
| staging | 预发布 | 同生产 | 脱敏数据 |
| prod | 生产 | 8C16G×4+ | 真实数据 |

### 9.2 部署架构
```
用户 → CDN → Nginx(负载均衡) → API Gateway
                                  ├── user-service ×2
                                  ├── music-service ×3
                                  ├── playlist-service ×2
                                  ├── search-service ×2
                                  ├── recommend-service ×2
                                  ├── member-service ×2
                                  ├── file-service ×2
                                  └── notify-service ×2 ✅#20
                                → Redis Cluster(3主3从)
                                → MySQL(1主2从)
                                → Elasticsearch(3节点)
                                → RabbitMQ(2节点)
                                → OSS
```

### 9.3 CI/CD流程
1. 开发提交代码→触发CI
2. 单元测试+代码扫描
3. 构建Docker镜像
4. 推送到镜像仓库
5. 部署到test环境→自动化测试
6. 人工验证→合并到main
7. 自动部署到staging→验证
8. 审批→部署到prod

### 9.4 数据库备份
| 备份类型 | 频率 | 保留时间 | 存储 |
|----------|------|----------|------|
| 全量备份 | 每日02:00 | 30天 | OSS |
| 增量备份 | 每小时 | 7天 | OSS |
| Binlog | 实时 | 7天 | 本地+OSS |

### 9.5 扩展策略
| 场景 | 策略 |
|------|------|
| 读压力大 | MySQL增加从库+Redis缓存 |
| 写压力大 | MySQL分库分表(按UID取模) |
| 搜索压力大 | ES增加节点+读写分离 |
| 播放高峰 | music-service水平扩容+CDN预热 |
| 存储增长 | OSS自动扩容+冷热数据分离 |

---

## 十、消息队列设计

### 10.1 队列列表
| 队列名 | 生产者 | 消费者 | 说明 |
|--------|--------|--------|------|
| queue.play.report | music-service | recommend-service | 播放上报→推荐 |
| queue.user.behavior | 多服务 | recommend-service | 用户行为→推荐 |
| queue.search.log | search-service | search-service | 搜索日志→热搜统计 |
| queue.member.notify | member-service | notify-service | 会员变更通知 |
| queue.file.process | file-service | file-service | 文件处理(缩略图/转码) |

---

## 十一、定时任务（✅#10 修订）

| 任务 | 频率 | 说明 |
|------|------|------|
| 更新每日推荐 | 每日00:00 | 重新计算推荐列表 |
| 更新热门搜索 | 每小时 | 统计搜索日志→更新Redis |
| 会员到期检查 | 每日01:00 | 检查过期会员→降级 |
| 清理过期Token | 每日03:00 | 清理Redis过期Token |
| 数据库备份 | 每日02:00 | 全量备份 |
| 播放计数统计 | 每日04:00 | 统计t_song播放次数 |
| 推荐模型训练 | 每周日凌晨 | 基于行为日志训练模型 |
| **✅#10 清理播放历史** | **每日05:00** | 按uid保留最新100条，超出删除 |
| **✅#18 用户行为日志归档** | **每月1日02:00** | 上月表导出HDFS，删除在线表 |

**✅#10 播放历史清理任务细节**：
```sql
-- 伪代码：按UID分组，保留每个用户最新100条
-- 1. 找出需要删除的ID（每用户超出100的部分）
DELETE FROM t_play_history
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY uid ORDER BY played_at DESC) AS rn
    FROM t_play_history
  ) t
  WHERE rn > 100
);
-- 2. 大表分批处理：每批 10000 行，避免长事务
```

---

## 十二、异常处理

### 12.1 接口异常
| 异常 | 处理方式 | HTTP状态码 |
|------|----------|------------|
| 参数校验失败 | 返回具体字段错误信息 | 400 |
| 未认证 | 返回需登录提示 | 401 |
| 无权限 | 返回权限不足提示 | 403 |
| 资源不存在 | 返回不存在提示 | 404 |
| 资源冲突 | 返回冲突详情 | 409 |
| 限流 | 返回限流提示+Retry-After | 429 |
| 服务内部错误 | 记录日志+返回通用错误 | 500 |
| 依赖服务不可用 | 熔断降级+返回缓存数据 | 503 |
| ✅#9 支付签名错误 | 返回"验签失败" | 400（错误码40004） |

### 12.2 数据库异常
| 异常 | 处理方式 |
|------|----------|
| 连接超时 | 重试3次→从库读取→返回缓存 |
| 死锁 | 重试(指数退避)→最多3次 |
| 主从延迟 | 强制读主库(关键业务) |
| 磁盘满 | 告警→清理旧日志→扩容 |

### 12.3 缓存异常
| 异常 | 处理方式 |
|------|----------|
| Redis不可用 | 降级直连数据库→限流保护 |
| 缓存穿透 | 布隆过滤器+空值缓存(5min) |
| 缓存雪崩 | 过期时间加随机偏移+互斥锁重建 |
| 缓存击穿 | 互斥锁+永不过期+异步更新 |

### 12.4 消息队列异常
| 异常 | 处理方式 |
|------|----------|
| 消息发送失败 | 本地暂存→定时重发 |
| 消费失败 | 重试3次→死信队列→人工处理 |
| 队列积压 | 增加消费者→告警 |

---

## 十三、验收标准（✅#22 修订）

### 13.1 接口验收
| 验收项 | 通过标准 |
|--------|----------|
| 所有接口可正常调用 | 返回200+正确数据 |
| 鉴权接口未登录返回401 | 无Token/无效Token均拦截 |
| 参数校验完整 | 非法参数返回400+具体错误 |
| 分页接口正确 | 返回正确的分页数据 |
| ✅#17 搜索结果高亮 | highlight字段包含<em>标签 |
| ✅#9 支付回调签名验证 | 错误签名返回40004，正确签名更新订单 |
| ✅#11 收藏上限校验 | 10001首时返回30005 |
| ✅#4 OAuth回调 | 正确授权码返回Token，未绑定自动注册 |
| ✅#13 PC端下载 | 返回302重定向到CDN，一次性Token有效 |

#### ✅#22 并发场景测试
| 场景 | 期望 |
|------|------|
| 100并发无数据错乱 | 接口压测100并发无异常 |
| 同时收藏同一首歌 | 第二次返回30003，不重复入库 |
| 多端同时修改同一歌单 | 最后写入优先，不丢失字段 |
| 多端同时上报播放 | 历史记录不丢失不重复 |
| 同时下单同一套餐 | 订单号唯一，金额一致 |
| 同时取消收藏 | 幂等，不报错 |
| 支付回调重复 | 幂等处理，第二次不重复更新会员 |
| 同时添加同一歌曲到待播 | 唯一约束生效，第二次静默忽略 |
| ✅#10 清理任务执行期间 | 不阻塞历史查询，删除分批进行 |

### 13.2 性能验收
| 指标 | 通过标准 |
|------|----------|
| 接口平均响应时间 | < 200ms |
| 接口P99响应时间 | < 500ms |
| 搜索接口响应 | < 300ms |
| 播放地址获取 | < 100ms |
| 并发支持 | 1000 QPS无异常 |

### 13.3 安全验收
| 验收项 | 通过标准 |
|--------|----------|
| SQL注入测试 | 无法注入 |
| XSS攻击测试 | 脚本被转义 |
| 越权访问测试 | 无法访问他人数据 |
| 限流测试 | 超限返回429 |
| Token安全 | 过期Token无法使用 |
| ✅#9 支付回调安全 | 错误签名被拒绝，时间戳偏移>5min被拒绝 |
| ✅#4 OAuth state验证 | 错误state返回10008 |

### 13.4 可靠性验收
| 验收项 | 通过标准 |
|--------|----------|
| 数据库主从切换 | 切换时间<30s |
| Redis故障降级 | 服务不中断 |
| 单服务宕机 | 其他服务不受影响 |
| 数据备份恢复 | 可完整恢复 |
| ✅#10 清理任务失败 | 不影响主业务，下次任务重试 |

---

**文档结束**

> 本文档为《后端产品需求设计文档 V1.0》升级版，吸收了《PRD评审纪要_20260608(一)》中与后端相关的修订意见，发布为 V2.0，日期 2026-06-10。前端相关修订见《前端产品需求设计文档 V2.0》。
