import type { SearchResult, PlayUrlData, LyricData, MusicPlatform, Song } from '@/types'

// ========== 主 API ==========
const NETEASE_URL = 'https://api.bugpk.com/api/163_music'
const QQ_URL = 'https://api.bugpk.com/api/qqmusic'

// ========== 备用 API（Meting 实例） ==========
const METING_URL = 'https://music.3e0.cn'
const METING2_URL = 'https://api.injahow.cn/meting'
// 第三备用 Meting 实例（自动选择可用节点）
const METING3_URL = 'https://api.qqr.ink/meting'

// 带超时的 fetch
function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 10000): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  if (options.signal) {
    options.signal.addEventListener('abort', () => controller.abort())
  }
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer))
}

// ========== API 缓存 ==========
interface CacheEntry<T> {
  data: T
  timestamp: number
}

const apiCache = new Map<string, CacheEntry<unknown>>()
const CACHE_TTL = 5 * 60 * 1000 // 5 分钟缓存
// 成功获取的播放链接缓存更久（30 分钟），因为链接通常有时效性
const URL_CACHE_TTL = 30 * 60 * 1000

function getCached<T>(key: string): T | null {
  const entry = apiCache.get(key)
  if (!entry) return null
  const ttl = key.includes('_url_') || key.includes('_song_') ? URL_CACHE_TTL : CACHE_TTL
  if (Date.now() - entry.timestamp > ttl) {
    apiCache.delete(key)
    return null
  }
  return entry.data as T
}

function setCache<T>(key: string, data: T): void {
  apiCache.set(key, { data, timestamp: Date.now() })
  if (apiCache.size > 200) {
    const entries = [...apiCache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp)
    for (let i = 0; i < 50; i++) apiCache.delete(entries[i][0])
  }
}

// 生成 QQ 音乐唯一 id（基于 mid 的哈希）
function qqSongId(mid: string): number {
  let hash = 0
  for (let i = 0; i < mid.length; i++) {
    const char = mid.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0 // 转为 32 位整数
  }
  return Math.abs(hash)
}

// ========== 网易云音乐（主 API） ==========

async function searchNetease(keyword: string, limit = 20, offset = 0, signal?: AbortSignal): Promise<SearchResult> {
  const cacheKey = `netease_search_${keyword}_${limit}_${offset}`
  const cached = getCached<SearchResult>(cacheKey)
  if (cached) return cached

  const params = new URLSearchParams({
    type: 'search',
    s: keyword,
    limit: String(limit),
    offset: String(offset),
  })

  const res = await fetch(`${NETEASE_URL}?${params}`, { signal })
  const json = await res.json()

  if (json.code !== 200 || !json.data?.songs) {
    throw new Error(json.msg || '搜索失败')
  }

  const result: SearchResult = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    songs: json.data.songs.map((s: any) => ({
      id: s.id,
      name: s.name,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      artists: Array.isArray(s.artists) ? s.artists.map((a: any) => a.name || a).join('/') : String(s.artists || ''),
      album: s.album || '',
      picUrl: s.picUrl || '',
      duration: s.duration || 0,
      platform: 'netease' as MusicPlatform,
    })),
    total: json.data.total,
  }

  setCache(cacheKey, result)
  return result
}

async function getNeteaseSongUrl(id: number, level = 'standard'): Promise<PlayUrlData | null> {
  const cacheKey = `netease_url_${id}_${level}`
  const cached = getCached<PlayUrlData>(cacheKey)
  if (cached) return cached

  const params = new URLSearchParams({
    type: 'url',
    id: String(id),
    level,
  })

  const res = await fetch(`${NETEASE_URL}?${params}`)
  const json = await res.json()

  if (json.code !== 200 || !json.data || json.data.length === 0) {
    return null // 不缓存 null 结果，下次可以重试
  }

  const result = json.data[0]
  setCache(cacheKey, result)
  return result
}

async function getNeteaseLyric(id: number): Promise<LyricData> {
  const cacheKey = `netease_lyric_${id}`
  const cached = getCached<LyricData>(cacheKey)
  if (cached) return cached

  const params = new URLSearchParams({
    type: 'lyric',
    id: String(id),
  })

  const res = await fetch(`${NETEASE_URL}?${params}`)
  const json = await res.json()

  if (json.code !== 200) {
    return { lrc: '', tlyric: '' }
  }

  const result = json.data
  setCache(cacheKey, result)
  return result
}

// ========== QQ 音乐（主 API） ==========

async function searchQQ(keyword: string, count = 20, signal?: AbortSignal): Promise<SearchResult> {
  const cacheKey = `qq_search_${keyword}_${count}`
  const cached = getCached<SearchResult>(cacheKey)
  if (cached) return cached

  const params = new URLSearchParams({
    type: 'search',
    name: keyword,
    count: String(count),
  })

  const res = await fetch(`${QQ_URL}?${params}`, { signal })
  const json = await res.json()

  if (json.code !== 200 || !Array.isArray(json.data)) {
    throw new Error(json.text || '搜索失败')
  }

  const result: SearchResult = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    songs: json.data.map((s: any) => ({
      id: qqSongId(s.mid),
      name: s.name,
      artists: s.singername || '',
      album: '',
      picUrl: '',
      duration: 0,
      platform: 'qq' as MusicPlatform,
      mid: s.mid,
    })),
    total: json.total || json.data.length,
  }

  setCache(cacheKey, result)
  return result
}

async function getQQSongUrl(mid: string): Promise<{ url: string; cover: string; lrc: string } | null> {
  const cacheKey = `qq_song_${mid}`
  const cached = getCached<{ url: string; cover: string; lrc: string }>(cacheKey)
  if (cached) return cached

  const songUrl = `https://y.qq.com/n/ryqq/songDetail/${mid}`
  const params = new URLSearchParams({
    type: 'song',
    url: songUrl,
  })

  const res = await fetch(`${QQ_URL}?${params}`)
  const json = await res.json()

  if (json.code !== 200 || !json.data || !json.data.url || json.data.url.includes('版权限制')) {
    return null // 不缓存 null 结果
  }

  const result = {
    url: json.data.url,
    cover: json.data.cover || '',
    lrc: json.data.lrc_data || '',
  }

  setCache(cacheKey, result)
  return result
}

// ========== 备用 API（Meting） ==========

// Meting API 搜索网易云
async function searchNeteaseMeting(keyword: string, limit = 20, signal?: AbortSignal): Promise<SearchResult> {
  const cacheKey = `meting_netease_search_${keyword}_${limit}`
  const cached = getCached<SearchResult>(cacheKey)
  if (cached) return cached

  const params = new URLSearchParams({
    server: 'netease',
    type: 'search',
    id: keyword,
  })

  const res = await fetch(`${METING_URL}/?${params}`, { signal })
  const json = await res.json()

  if (!Array.isArray(json)) {
    throw new Error('Meting 搜索失败')
  }

  const result: SearchResult = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    songs: json.slice(0, limit).map((s: any) => {
      const parsed = parseInt(s.id, 10)
      return {
        id: Number.isNaN(parsed) ? 0 : parsed,
        name: s.name || s.title || '',
        artists: s.artist || s.author || '',
        album: s.album || '',
        picUrl: s.pic || '',
        duration: 0,
        platform: 'netease' as MusicPlatform,
      }
    }),
    total: json.length,
  }

  setCache(cacheKey, result)
  return result
}

// Meting API 搜索 QQ 音乐
async function searchQQMeting(keyword: string, limit = 20, signal?: AbortSignal): Promise<SearchResult> {
  const cacheKey = `meting_qq_search_${keyword}_${limit}`
  const cached = getCached<SearchResult>(cacheKey)
  if (cached) return cached

  const params = new URLSearchParams({
    server: 'tencent',
    type: 'search',
    id: keyword,
  })

  const res = await fetch(`${METING_URL}/?${params}`, { signal })
  const json = await res.json()

  if (!Array.isArray(json)) {
    throw new Error('Meting 搜索失败')
  }

  const result: SearchResult = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    songs: json.slice(0, limit).map((s: any) => ({
      id: qqSongId(s.id),
      name: s.name || s.title || '',
      artists: s.artist || s.author || '',
      album: s.album || '',
      picUrl: s.pic || '',
      duration: 0,
      platform: 'qq' as MusicPlatform,
      mid: s.id,
    })),
    total: json.length,
  }

  setCache(cacheKey, result)
  return result
}

// Meting API 获取网易云播放链接
async function getNeteaseUrlMeting(id: number): Promise<string | null> {
  const cacheKey = `meting_netease_url_${id}`
  const cached = getCached<string>(cacheKey)
  if (cached) return cached

  try {
    const params = new URLSearchParams({
      server: 'netease',
      type: 'url',
      id: String(id),
    })

    const res = await fetch(`${METING_URL}/?${params}`, { redirect: 'follow' })
    const contentType = res.headers.get('content-type') || ''

    // 如果返回的是音频，说明链接有效
    if (contentType.includes('audio') || contentType.includes('mpeg')) {
      const url = res.url
      res.body?.cancel()
      setCache(cacheKey, url)
      return url
    }

    // 如果返回的是 JSON，可能是错误
    if (contentType.includes('json')) {
      return null
    }

    // 其他情况，检查 URL 是否像音频链接
    if (res.url && res.url.includes('.mp3')) {
      setCache(cacheKey, res.url)
      return res.url
    }

    return null
  } catch {
    return null
  }
}

// Meting API 获取 QQ 音乐播放链接
async function getQQUrlMeting(mid: string): Promise<string | null> {
  const cacheKey = `meting_qq_url_${mid}`
  const cached = getCached<string>(cacheKey)
  if (cached) return cached

  try {
    const params = new URLSearchParams({
      server: 'tencent',
      type: 'url',
      id: mid,
    })

    const res = await fetch(`${METING_URL}/?${params}`, { redirect: 'follow' })
    const contentType = res.headers.get('content-type') || ''

    if (contentType.includes('audio') || contentType.includes('mpeg')) {
      const url = res.url
      res.body?.cancel()
      setCache(cacheKey, url)
      return url
    }

    if (res.url && (res.url.includes('.mp3') || res.url.includes('.m4a'))) {
      setCache(cacheKey, res.url)
      return res.url
    }

    return null
  } catch {
    return null
  }
}

// Meting API 获取歌词
async function getNeteaseLyricMeting(id: number): Promise<string> {
  try {
    const params = new URLSearchParams({
      server: 'netease',
      type: 'lrc',
      id: String(id),
    })

    const res = await fetch(`${METING_URL}/?${params}`)
    if (!res.ok) return ''
    return await res.text()
  } catch {
    return ''
  }
}

// ========== 第三备用 API（injahow.cn） ==========

async function getNeteaseUrlMeting2(id: number): Promise<string | null> {
  const cacheKey = `meting2_netease_url_${id}`
  const cached = getCached<string>(cacheKey)
  if (cached) return cached

  try {
    const params = new URLSearchParams({
      server: 'netease',
      type: 'url',
      id: String(id),
    })

    const res = await fetch(`${METING2_URL}/?${params}`, { redirect: 'follow' })
    const contentType = res.headers.get('content-type') || ''

    if (contentType.includes('audio') || contentType.includes('mpeg')) {
      const url = res.url
      res.body?.cancel()
      setCache(cacheKey, url)
      return url
    }

    if (res.url && res.url.includes('.mp3')) {
      setCache(cacheKey, res.url)
      return res.url
    }

    return null
  } catch {
    return null
  }
}

async function getQQUrlMeting2(mid: string): Promise<string | null> {
  const cacheKey = `meting2_qq_url_${mid}`
  const cached = getCached<string>(cacheKey)
  if (cached) return cached

  try {
    const params = new URLSearchParams({
      server: 'tencent',
      type: 'url',
      id: mid,
    })

    const res = await fetch(`${METING2_URL}/?${params}`, { redirect: 'follow' })
    const contentType = res.headers.get('content-type') || ''

    if (contentType.includes('audio') || contentType.includes('mpeg')) {
      const url = res.url
      res.body?.cancel()
      setCache(cacheKey, url)
      return url
    }

    if (res.url && (res.url.includes('.mp3') || res.url.includes('.m4a'))) {
      setCache(cacheKey, res.url)
      return res.url
    }

    return null
  } catch {
    return null
  }
}

// 延迟工具函数
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ========== 第三备用 API（qqr.ink） ==========
async function getNeteaseUrlMeting3(id: number): Promise<string | null> {
  const cacheKey = `meting3_netease_url_${id}`
  const cached = getCached<string>(cacheKey)
  if (cached) return cached
  try {
    const params = new URLSearchParams({ server: 'netease', type: 'url', id: String(id) })
    const res = await fetchWithTimeout(`${METING3_URL}/?${params}`, { redirect: 'follow' }, 8000)
    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('audio') || contentType.includes('mpeg')) {
      const url = res.url
      res.body?.cancel()
      setCache(cacheKey, url)
      return url
    }
    if (res.url && res.url.includes('.mp3')) {
      setCache(cacheKey, res.url)
      return res.url
    }
    return null
  } catch { return null }
}

async function getQQUrlMeting3(mid: string): Promise<string | null> {
  const cacheKey = `meting3_qq_url_${mid}`
  const cached = getCached<string>(cacheKey)
  if (cached) return cached
  try {
    const params = new URLSearchParams({ server: 'tencent', type: 'url', id: mid })
    const res = await fetchWithTimeout(`${METING3_URL}/?${params}`, { redirect: 'follow' }, 8000)
    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('audio') || contentType.includes('mpeg')) {
      const url = res.url
      res.body?.cancel()
      setCache(cacheKey, url)
      return url
    }
    if (res.url && (res.url.includes('.mp3') || res.url.includes('.m4a'))) {
      setCache(cacheKey, res.url)
      return res.url
    }
    return null
  } catch { return null }
}

// 清除某首歌的 URL 缓存，下次获取时会重新请求
export function invalidateSongUrlCache(song: Song): void {
  if (song.platform === 'qq' && song.mid) {
    apiCache.delete(`qq_song_${song.mid}`)
    apiCache.delete(`meting_qq_url_${song.mid}`)
    apiCache.delete(`meting2_qq_url_${song.mid}`)
    apiCache.delete(`meting3_qq_url_${song.mid}`)
  } else if (song.platform === 'netease') {
    for (const lv of NETEASE_LEVELS) {
      apiCache.delete(`netease_url_${song.id}_${lv}`)
    }
    apiCache.delete(`meting_netease_url_${song.id}`)
    apiCache.delete(`meting2_netease_url_${song.id}`)
    apiCache.delete(`meting3_netease_url_${song.id}`)
  }
}

// ========== 统一接口 ==========

export async function searchSongs(keyword: string, platform: MusicPlatform, limit = 20, signal?: AbortSignal): Promise<SearchResult> {
  // 先尝试主 API
  try {
    if (platform === 'qq') {
      return await searchQQ(keyword, limit, signal)
    }
    return await searchNetease(keyword, limit, 0, signal)
  } catch {
    // 主 API 失败，尝试备用 API
    if (platform === 'qq') {
      return await searchQQMeting(keyword, limit, signal)
    }
    return await searchNeteaseMeting(keyword, limit, signal)
  }
}

// 网易云多音质等级，按优先级尝试
const NETEASE_LEVELS = ['standard', 'higher', 'exhigh', 'lossless', 'hires']

// QQ 音乐获取播放链接（内部实现）
async function getSongUrlQQ(song: Song): Promise<{ url: string; lrc: string; cover: string } | null> {
  if (!song.mid) return null
  try {
    const results = await Promise.allSettled([
      getQQSongUrl(song.mid),
      getQQUrlMeting(song.mid),
      getQQUrlMeting2(song.mid),
      getQQUrlMeting3(song.mid),
    ])
    if (results[0].status === 'fulfilled' && results[0].value?.url) {
      return results[0].value
    }
    const fulfilled = results.filter((r): r is PromiseFulfilledResult<string | null> => r.status === 'fulfilled' && !!r.value)
    for (let i = 1; i < fulfilled.length; i++) {
      const url = fulfilled[i].value
      if (url) return { url, lrc: '', cover: song.picUrl || '' }
    }
  } catch { /* 全部失败 */ }
  return null
}

// 网易云获取播放链接（内部实现）
async function getSongUrlNetease(song: Song, level: string): Promise<{ url: string; lrc: string; cover: string } | null> {
  const startIndex = NETEASE_LEVELS.indexOf(level)
  const levels = startIndex >= 0 ? NETEASE_LEVELS.slice(startIndex) : NETEASE_LEVELS
  try {
    const mainResults = await Promise.allSettled(
      levels.slice(0, 3).map((lv) => getNeteaseSongUrl(song.id, lv))
    )
    for (const r of mainResults) {
      if (r.status === 'fulfilled' && r.value?.url) {
        const lyricData = await getNeteaseLyric(song.id)
        return {
          url: r.value.url,
          lrc: lyricData?.lrc || '',
          cover: song.picUrl || '',
        }
      }
    }
  } catch { /* 主 API 全部失败 */ }
  try {
    const backupResults = await Promise.allSettled([
      getNeteaseUrlMeting(song.id),
      getNeteaseUrlMeting2(song.id),
      getNeteaseUrlMeting3(song.id),
    ])
    for (const r of backupResults) {
      if (r.status === 'fulfilled' && r.value) {
        let lrc = ''
        try { lrc = await getNeteaseLyricMeting(song.id) } catch { /* 歌词不影响播放 */ }
        return { url: r.value, lrc, cover: song.picUrl || '' }
      }
    }
  } catch { /* 备用也失败 */ }
  return null
}

export async function getSongUrl(song: Song, level = 'standard', retryCount = 0): Promise<{ url: string; lrc: string; cover: string } | null> {
  const maxRetries = 1
  const fetchFn = song.platform === 'qq'
    ? () => getSongUrlQQ(song)
    : () => getSongUrlNetease(song, level)

  // 第一次尝试
  const result = await fetchFn()
  if (result && result.url) return result

  // 失败后清除缓存并重试
  if (retryCount < maxRetries) {
    invalidateSongUrlCache(song)
    await delay(800)
    return getSongUrl(song, level, retryCount + 1)
  }

  return null
}
