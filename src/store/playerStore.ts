import { create } from 'zustand'
import type { Song, LyricLine, Playlist } from '@/types'
import { searchSongs, getSongUrl } from '@/services/musicApi'
import type { MusicPlatform } from '@/types'
import { parseLrc, findCurrentLine } from '@/utils/lrcParser'
import { showToast } from '@/store/toastStore'

export type PlayMode = 'sequential' | 'loop' | 'single' | 'shuffle'
export type DisplayMode = 'lyrics' | 'vinyl'

// 从 localStorage 读取收藏列表
function loadFavorites(): Song[] {
  try {
    const data = localStorage.getItem('music_favorites')
    return data ? JSON.parse(data) : []
  } catch { /* ignore */ }
  return []
}

function saveFavorites(favorites: Song[]) {
  try {
    // 过滤掉本地歌曲（ObjectURL 在页面重载后失效）
    const serializable = favorites.filter((s) => s.platform !== 'local')
    localStorage.setItem('music_favorites', JSON.stringify(serializable))
  } catch { /* ignore */ }
}

// 从 localStorage 读取播放历史
function loadHistory(): Song[] {
  try {
    const data = localStorage.getItem('music_history')
    return data ? JSON.parse(data) : []
  } catch { /* ignore */ }
  return []
}

function saveHistory(history: Song[]) {
  try {
    // 过滤掉本地歌曲（ObjectURL 在页面重载后失效）
    const serializable = history.filter((s) => s.platform !== 'local')
    localStorage.setItem('music_history', JSON.stringify(serializable.slice(0, 50)))
  } catch { /* ignore */ }
}

// 从 localStorage 读取保存的歌单
function loadSavedPlaylists(): Playlist[] {
  try {
    const data = localStorage.getItem('music_saved_playlists')
    return data ? JSON.parse(data) : []
  } catch { /* ignore */ }
  return []
}

function saveSavedPlaylists(playlists: Playlist[]) {
  try {
    // 过滤掉本地歌曲（ObjectURL 在页面重载后失效）
    const serializable = playlists.map((p) => ({
      ...p,
      songs: p.songs.filter((s) => s.platform !== 'local'),
    }))
    localStorage.setItem('music_saved_playlists', JSON.stringify(serializable))
  } catch { /* ignore */ }
}

// 搜索历史
function loadSearchHistory(): string[] {
  try {
    const data = localStorage.getItem('music_search_history')
    return data ? JSON.parse(data) : []
  } catch { /* ignore */ }
  return []
}

function saveSearchHistory(history: string[]) {
  try {
    localStorage.setItem('music_search_history', JSON.stringify(history.slice(0, 20)))
  } catch { /* ignore */ }
}

// 播放进度记忆
function loadProgress(): { songId: number; currentTime: number } | null {
  try {
    const data = localStorage.getItem('music_progress')
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

function saveProgress(songId: number, currentTime: number) {
  try {
    localStorage.setItem('music_progress', JSON.stringify({ songId, currentTime }))
  } catch { /* ignore */ }
}

// ObjectURL 管理器，防止内存泄漏
const objectURLs = new Set<string>()

// 播放进度保存节流：记录上次保存的时间戳
let _lastSaveTimestamp = 0

function createObjectURL(file: File): string {
  const url = URL.createObjectURL(file)
  objectURLs.add(url)
  return url
}

function revokeAllObjectURLs() {
  objectURLs.forEach((url) => URL.revokeObjectURL(url))
  objectURLs.clear()
}

// 可取消的定时器管理
let pendingTimers: ReturnType<typeof setTimeout>[] = []

export function setCancelableTimeout(fn: () => void, delay: number): ReturnType<typeof setTimeout> {
  const id = setTimeout(() => {
    pendingTimers = pendingTimers.filter((t) => t !== id)
    fn()
  }, delay)
  pendingTimers.push(id)
  return id
}

function clearPendingTimers() {
  pendingTimers.forEach(clearTimeout)
  pendingTimers = []
}

// 播放列表最大长度限制
const MAX_PLAYLIST_SIZE = 200
// 连续跳过上限
const MAX_CONSECUTIVE_SKIPS = 5
// 智能推荐加载取消标识
let _recommendLoadId = 0

interface PlayerStore {
  playlist: Song[]
  currentSong: Song | null
  currentSongIndex: number
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  lyrics: LyricLine[]
  currentLyricIndex: number
  audioUrl: string
  isLoading: boolean
  searchKeyword: string
  isSearching: boolean
  playMode: PlayMode
  playNextQueue: Song[]
  shuffleOrder: number[]
  shuffleIndex: number
  favorites: Song[]
  platform: MusicPlatform
  history: Song[]
  smartRecommend: Song[]
  smartRecommendLoading: boolean
  _loadId: number
  _skipCount: number
  _abortController: AbortController | null
  _restoreSeekTarget: number | null
  _roamPlayIndex: number

  // 定时播放
  sleepTimer: number
  sleepTimerTotal: number

  // 图片识别歌单
  ocrLoading: boolean
  ocrProgress: string
  ocrSongs: Song[]

  // 显示模式
  displayMode: DisplayMode

  // 漫游模式
  isRoaming: boolean
  roamSongs: Song[]
  roamLoading: boolean

  // 深色模式
  darkMode: boolean

  // 上次非零音量（用于静音切换）
  prevVolume: number

  // 保存的歌单
  savedPlaylists: Playlist[]

  // 搜索历史
  searchHistory: string[]

  setSearchKeyword: (keyword: string) => void
  setPlatform: (platform: MusicPlatform) => void
  search: (keyword?: string) => Promise<void>
  playSong: (index: number) => void
  togglePlay: () => void
  nextSong: () => void
  prevSong: () => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  loadSongData: (songId: number, loadId: number) => Promise<void>
  cyclePlayMode: () => void
  addToPlayNext: (song: Song) => void
  removeFromPlayNext: (index: number) => void
  moveInPlayNext: (fromIndex: number, toIndex: number) => void
  playFromQueue: (index: number) => void
  clearPlayNext: () => void
  toggleFavorite: (song: Song) => void
  isFavorite: (songId: number, platform?: MusicPlatform) => boolean
  addFavoritesToPlayNext: () => void
  playFavorite: (index: number) => void
  initRecommend: () => Promise<void>
  addLocalSongs: (files: File[]) => void
  playHistory: (index: number) => void
  clearHistory: () => void
  loadSmartRecommend: () => Promise<void>
  playSmartRecommend: (index: number) => void
  setSleepTimer: (minutes: number) => void
  tickSleepTimer: () => void
  recognizeAndSearch: (imageBase64: string, mimeType?: string) => Promise<void>
  addOcrSongsToPlaylist: () => void
  clearOcrSongs: () => void
  setDisplayMode: (mode: DisplayMode) => void
  toggleRoaming: () => void
  loadRoamSongs: () => Promise<void>
  playRoamSong: (index: number) => void
  removeRoamSong: (index: number) => void
  toggleDarkMode: () => void
  restoreProgress: () => void
  createPlaylist: (name: string) => string
  deletePlaylist: (id: string) => void
  renamePlaylist: (id: string, name: string) => void
  addSongToPlaylist: (playlistId: string, song: Song) => void
  removeSongFromPlaylist: (playlistId: string, songId: number, songPlatform: string) => void
  playPlaylist: (id: string) => void
  addPlaylistToPlayNext: (id: string) => void
  clearSearchHistory: () => void
  removeSearchHistoryItem: (keyword: string) => void
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  playlist: [],
  currentSong: null,
  currentSongIndex: -1,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.7,
  prevVolume: 0.7,
  lyrics: [],
  currentLyricIndex: -1,
  audioUrl: '',
  isLoading: false,
  searchKeyword: '',
  isSearching: false,
  playMode: 'loop',
  playNextQueue: [],
  shuffleOrder: [],
  shuffleIndex: -1,
  favorites: loadFavorites(),
  platform: 'netease',
  history: loadHistory(),
  smartRecommend: [],
  smartRecommendLoading: false,
  _loadId: 0,
  _skipCount: 0,
  _abortController: null,
  _restoreSeekTarget: null,
  _roamPlayIndex: -1,
  sleepTimer: 0,
  sleepTimerTotal: 0,
  ocrLoading: false,
  ocrProgress: '',
  ocrSongs: [],
  displayMode: 'lyrics',
  isRoaming: false,
  roamSongs: [],
  roamLoading: false,
  darkMode: (() => {
    try {
      return localStorage.getItem('music_darkMode') === 'true'
    } catch {
      return false
    }
  })(),
  savedPlaylists: loadSavedPlaylists(),
  searchHistory: loadSearchHistory(),

  // 初始化时加载推荐热歌
  initRecommend: async () => {
    const { playlist } = get()
    if (playlist.length > 0) return

    const recommendSongs: { keyword: string; platform: MusicPlatform }[] = [
      { keyword: '用背脊唱情歌 汤令山', platform: 'netease' },
      { keyword: '去北极忘记你 汤令山', platform: 'netease' },
      { keyword: '颜色 汤令山', platform: 'netease' },
      { keyword: '紧急联络人 汤令山', platform: 'netease' },
      { keyword: '等你的季节', platform: 'netease' },
      { keyword: '仰望 杨丞琳', platform: 'netease' },
      { keyword: '全世界陪我失眠 汪苏泷', platform: 'netease' },
      { keyword: '半点心', platform: 'netease' },
      { keyword: '如果呢 郑润泽', platform: 'netease' },
      { keyword: '晴天 周杰伦', platform: 'qq' },
      { keyword: '忘记', platform: 'netease' },
      { keyword: '忽而今夏 汪苏泷', platform: 'netease' },
      { keyword: '安河桥', platform: 'netease' },
      { keyword: '海阔天空', platform: 'netease' },
      { keyword: '玻璃', platform: 'netease' },
    ]

    try {
      // 全部并行搜索，取每首搜索结果的第一首
      const results = await Promise.allSettled(
        recommendSongs.map((item) => searchSongs(item.keyword, item.platform, 1))
      )
      const allSongs: Song[] = []
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value.songs.length > 0) {
          const song = result.value.songs[0]
          if (!song.duration || song.duration >= 60000) {
            allSongs.push(song)
          }
        }
      }
      if (allSongs.length > 0 && get().playlist.length === 0) {
        set({ playlist: allSongs })
      }
    } catch { /* ignore */ }
  },

  setSearchKeyword: (keyword: string) => {
    set({ searchKeyword: keyword })
  },

  setPlatform: (platform: MusicPlatform) => {
    set({ platform })
  },

  search: async (keyword?: string) => {
    const kw = keyword || get().searchKeyword
    if (!kw.trim()) return
    const { platform, _abortController } = get()

    // 保存搜索历史（去重，移到最前，最多20条）
    const newHistory = [kw.trim(), ...get().searchHistory.filter((k) => k !== kw.trim())].slice(0, 20)
    set({ searchHistory: newHistory })
    saveSearchHistory(newHistory)

    // 取消之前的搜索请求
    _abortController?.abort()
    const controller = new AbortController()
    set({ isSearching: true, _abortController: controller })

    try {
      const result = await searchSongs(kw, platform, 20, controller.signal)
      if (controller.signal.aborted) return
      // 过滤掉过短的歌曲（试听版/片段，通常不到60秒）
      const filteredSongs = result.songs.filter((s) => !s.duration || s.duration >= 60000)
      set({
        playlist: filteredSongs,
        currentSong: null,
        currentSongIndex: -1,
        shuffleOrder: [],
        shuffleIndex: -1,
        isSearching: false,
        _abortController: null,
      })
    } catch (err) {
      if (controller.signal.aborted) return
      set({ isSearching: false, _abortController: null })
      // AbortError 不显示错误提示
      if (err instanceof DOMException && err.name === 'AbortError') return
      showToast('搜索失败，请重试', 'error')
    }
  },

  playSong: (index: number) => {
    const { playlist } = get()
    if (index < 0 || index >= playlist.length) return
    const song = playlist[index]
    // 写入播放历史（去重，最新的在前面）
    const newHistory = [song, ...get().history.filter((s) => s.id !== song.id)].slice(0, 50)
    saveHistory(newHistory)
    // 每次 playSong 递增 _loadId，防止旧请求覆盖
    const loadId = get()._loadId + 1
    // 取消之前的定时器
    clearPendingTimers()
    // 如果是 shuffle 模式，更新 shuffle 状态
    const { playMode, shuffleOrder, shuffleIndex } = get()
    let newShuffleOrder = shuffleOrder
    let newShuffleIndex = shuffleIndex
    if (playMode === 'shuffle') {
      const idx = shuffleOrder.indexOf(index)
      if (idx >= 0) {
        newShuffleIndex = idx
      } else {
        // 当前歌曲不在随机顺序中，重新生成
        const indices = playlist.map((_, i) => i).filter((i) => i !== index)
        for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]]
        }
        indices.unshift(index)
        newShuffleOrder = indices
        newShuffleIndex = 0
      }
    }

    _lastSaveTimestamp = 0
    set({
      currentSong: song,
      currentSongIndex: index,
      isPlaying: true,
      currentTime: 0,
      duration: 0,
      currentLyricIndex: -1,
      isLoading: true,
      audioUrl: '',
      history: newHistory,
      _loadId: loadId,
      _skipCount: 0,
      shuffleOrder: newShuffleOrder,
      shuffleIndex: newShuffleIndex,
    })
    get().loadSongData(song.id, loadId)
  },

  togglePlay: () => {
    set((state) => ({ isPlaying: !state.isPlaying }))
  },

  nextSong: () => {
    const { playlist, currentSongIndex, playMode, playNextQueue, isRoaming, roamSongs } = get()

    if (playNextQueue.length > 0) {
      const nextUp = playNextQueue[0]
      const newQueue = playNextQueue.slice(1)
      const existingIndex = playlist.findIndex((s) => s.id === nextUp.id)
      if (existingIndex >= 0) {
        set({ playNextQueue: newQueue })
        get().playSong(existingIndex)
      } else {
        // 限制播放列表大小
        if (playlist.length >= MAX_PLAYLIST_SIZE) {
          // 移除最早的非当前播放歌曲
          const removeIndex = currentSongIndex === 0 ? 1 : 0
          const newPlaylist = playlist.filter((_, i) => i !== removeIndex)
          const adjustedIndex = currentSongIndex > removeIndex ? currentSongIndex - 1 : currentSongIndex
          const updatedPlaylist = [...newPlaylist.slice(0, adjustedIndex + 1), nextUp, ...newPlaylist.slice(adjustedIndex + 1)]
          set({ playlist: updatedPlaylist, playNextQueue: newQueue })
          get().playSong(adjustedIndex + 1)
        } else {
          const newPlaylist = [...playlist, nextUp]
          const newIndex = newPlaylist.length - 1
          set({ playlist: newPlaylist, playNextQueue: newQueue })
          get().playSong(newIndex)
        }
      }
      return
    }

    // 漫游模式
    if (isRoaming && roamSongs.length > 0) {
      // 找到下一首未播放的漫游歌曲
      const { _roamPlayIndex } = get()
      const nextIndex = _roamPlayIndex + 1
      if (nextIndex >= roamSongs.length) {
        // 所有漫游歌曲已播放完，在后台加载新的
        get().loadRoamSongs()
        return
      }
      const nextRoam = roamSongs[nextIndex]
      set({ _roamPlayIndex: nextIndex })
      const existingIndex = playlist.findIndex((s) => s.id === nextRoam.id)
      if (existingIndex >= 0) {
        get().playSong(existingIndex)
      } else {
        if (playlist.length >= MAX_PLAYLIST_SIZE) {
          const removeIndex = currentSongIndex === 0 ? 1 : 0
          const newPlaylist = playlist.filter((_, i) => i !== removeIndex)
          const adjustedIndex = currentSongIndex > removeIndex ? currentSongIndex - 1 : currentSongIndex
          const updatedPlaylist = [...newPlaylist.slice(0, adjustedIndex + 1), nextRoam, ...newPlaylist.slice(adjustedIndex + 1)]
          set({ playlist: updatedPlaylist })
          get().playSong(adjustedIndex + 1)
        } else {
          const newPlaylist = [...playlist, nextRoam]
          const newIndex = newPlaylist.length - 1
          set({ playlist: newPlaylist })
          get().playSong(newIndex)
        }
      }
      if (roamSongs.length - nextIndex - 1 < 3) {
        get().loadRoamSongs()
      }
      return
    }

    if (playlist.length === 0) return

    if (playMode === 'single') {
      get().playSong(currentSongIndex)
      return
    }

    if (playMode === 'shuffle') {
      const { shuffleOrder, shuffleIndex } = get()
      if (shuffleOrder.length === 0) {
        // 重新生成随机顺序，而不是切换播放模式
        const indices = playlist.map((_, i) => i).filter((i) => i !== currentSongIndex)
        for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]]
        }
        if (currentSongIndex >= 0) indices.unshift(currentSongIndex)
        set({ shuffleOrder: indices, shuffleIndex: 0 })
        if (indices.length > 1) {
          set({ shuffleIndex: 1 })
          get().playSong(indices[1])
        }
        return
      }
      const nextShuffleIndex = shuffleIndex + 1
      if (nextShuffleIndex < shuffleOrder.length) {
        set({ shuffleIndex: nextShuffleIndex })
        get().playSong(shuffleOrder[nextShuffleIndex])
      } else {
        const { playlist, currentSongIndex } = get()
        const indices = playlist.map((_, i) => i).filter((i) => i !== currentSongIndex)
        for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]]
        }
        if (currentSongIndex >= 0) indices.unshift(currentSongIndex)
        set({ shuffleOrder: indices, shuffleIndex: 0 })
        if (indices.length > 1) {
          get().playSong(indices[1])
          set({ shuffleIndex: 1 })
        }
      }
      return
    }

    if (playMode === 'sequential') {
      if (currentSongIndex < playlist.length - 1) {
        get().playSong(currentSongIndex + 1)
      } else {
        set({ isPlaying: false })
      }
      return
    }

    const nextIndex = (currentSongIndex + 1) % playlist.length
    get().playSong(nextIndex)
  },

  prevSong: () => {
    const { isRoaming, roamSongs, _roamPlayIndex } = get()
    if (isRoaming && roamSongs.length > 0) {
      const prevIndex = _roamPlayIndex - 1
      if (prevIndex >= 0) {
        get().playRoamSong(prevIndex)
      }
      return
    }

    const { playlist, playMode } = get()
    if (playlist.length === 0) return

    if (playMode === 'shuffle') {
      const { shuffleOrder, shuffleIndex } = get()
      if (shuffleOrder.length > 0 && shuffleIndex > 0) {
        const prevShuffleIndex = shuffleIndex - 1
        set({ shuffleIndex: prevShuffleIndex })
        get().playSong(shuffleOrder[prevShuffleIndex])
      } else {
        const randomIndex = Math.floor(Math.random() * playlist.length)
        get().playSong(randomIndex)
      }
      return
    }

    const { currentSongIndex } = get()
    if (playMode === 'sequential') {
      if (currentSongIndex > 0) {
        get().playSong(currentSongIndex - 1)
      }
      return
    }
    const prevIndex = (currentSongIndex - 1 + playlist.length) % playlist.length
    get().playSong(prevIndex)
  },

  setCurrentTime: (time: number) => {
    const { lyrics, currentLyricIndex, currentSong } = get()
    const newLyricIndex = findCurrentLine(lyrics, time)
    // 只在歌词行变化时才更新 currentLyricIndex，减少不必要的重渲染
    if (newLyricIndex !== currentLyricIndex) {
      set({ currentTime: time, currentLyricIndex: newLyricIndex })
    } else {
      set({ currentTime: time })
    }
    // 保存播放进度（节流：每 5 秒保存一次，基于实际时间间隔）
    if (currentSong && Date.now() - _lastSaveTimestamp >= 5000) {
      _lastSaveTimestamp = Date.now()
      saveProgress(currentSong.id, time)
    }
  },

  setDuration: (duration: number) => {
    set({ duration })
    // 检测试听版：音频时长不到60秒，视为不完整
    if (duration > 0 && duration < 60) {
      const { currentSong, _skipCount } = get()
      const skipCount = _skipCount + 1
      set({ _skipCount: skipCount })
      if (currentSong) {
        showToast(`「${currentSong.name}」为试听版，自动跳过`, 'warning')
      }
      if (skipCount < MAX_CONSECUTIVE_SKIPS) {
        setCancelableTimeout(() => {
          get().nextSong()
        }, 500)
      } else {
        showToast('连续多首无法播放，已停止', 'warning')
        set({ _skipCount: 0 })
      }
    }
  },

  setVolume: (volume: number) => {
    const v = Math.max(0, Math.min(1, volume))
    set((state) => ({
      volume: v,
      prevVolume: v > 0 ? v : state.prevVolume,
    }))
  },

  toggleMute: () => {
    const { volume, prevVolume } = get()
    if (volume > 0) {
      set({ volume: 0 })
    } else {
      set({ volume: prevVolume || 0.7 })
    }
  },

  loadSongData: async (_songId: number, loadId: number) => {
    const { currentSong, playlist, currentSongIndex } = get()
    const song = currentSong
    if (!song) return

    // 本地歌曲直接使用本地 URL
    if (song.platform === 'local') {
      set({
        audioUrl: song.album,
        lyrics: [],
        currentLyricIndex: -1,
        isLoading: false,
        _restoreSeekTarget: null,
      })
      return
    }

    try {
      const result = await getSongUrl(song)
      if (get()._loadId !== loadId) return
      if (!result || !result.url) {
        // 尝试在另一个平台搜索同一首歌
        const altPlatform: MusicPlatform = song.platform === 'netease' ? 'qq' : 'netease'
        try {
          const altSearch = await searchSongs(`${song.name} ${song.artists}`, altPlatform, 3)
          if (get()._loadId !== loadId) return
          if (altSearch.songs.length > 0) {
            const altSong = altSearch.songs[0]
            const nameSimilar = altSong.name.includes(song.name) || song.name.includes(altSong.name)
            if (nameSimilar) {
              const altResult = await getSongUrl(altSong)
              if (get()._loadId !== loadId) return
              if (altResult && altResult.url) {
                // 使用另一平台的完整歌曲信息（保留正确的平台和ID）
                const { playlist: currentPlaylist, currentSongIndex: currentIndex } = get()
                if (currentIndex >= 0 && currentIndex < currentPlaylist.length) {
                  const newPlaylist = [...currentPlaylist]
                  newPlaylist[currentIndex] = altSong
                  set({ playlist: newPlaylist, currentSong: altSong })
                }
                const lyrics = parseLrc(altResult.lrc)
                if (altResult.cover && !altSong.picUrl) {
                  const { playlist: pl2, currentSongIndex: ci2 } = get()
                  if (ci2 >= 0 && ci2 < pl2.length) {
                    const updatedPlaylist = [...pl2]
                    updatedPlaylist[ci2] = { ...altSong, picUrl: altResult.cover }
                    set({ playlist: updatedPlaylist, currentSong: { ...altSong, picUrl: altResult.cover } })
                  }
                }
                set({
                  audioUrl: altResult.url,
                  lyrics,
                  currentLyricIndex: -1,
                  isLoading: false,
                  _skipCount: 0,
                  _restoreSeekTarget: null,
                })
                return
              }
            }
          }
        } catch {
          // 跨平台搜索也失败，继续正常跳过逻辑
        }

        const skipCount = get()._skipCount + 1
        set({ isLoading: false, isPlaying: false, audioUrl: '', _skipCount: skipCount, _restoreSeekTarget: null })

        // 连续跳过次数过多，停止自动跳过
        if (skipCount >= MAX_CONSECUTIVE_SKIPS) {
          showToast('连续多首无法播放，已停止', 'warning')
          set({ _skipCount: 0 })
          return
        }

        // 只在第一次跳过时提示，避免刷屏
        if (skipCount <= 1) {
          showToast(`无法播放「${song.name}」，自动跳过`, 'warning')
        }
        setCancelableTimeout(() => {
          const { currentSongIndex } = get()
          if (currentSongIndex >= 0) {
            get().nextSong()
          }
        }, 500)
        return
      }

      const lyrics = parseLrc(result.lrc)

      // QQ 音乐返回封面图，更新到播放列表
      if (result.cover && !song.picUrl) {
        const { playlist: currentPlaylist, currentSongIndex: currentIndex } = get()
        if (currentIndex >= 0 && currentIndex < currentPlaylist.length) {
          const newPlaylist = [...currentPlaylist]
          newPlaylist[currentIndex] = { ...song, picUrl: result.cover }
          set({ playlist: newPlaylist, currentSong: { ...song, picUrl: result.cover } })
        }
      }

      set({
        audioUrl: result.url,
        lyrics,
        currentLyricIndex: -1,
        isLoading: false,
        _skipCount: 0,
        _restoreSeekTarget: null,
      })
    } catch {
      if (get()._loadId !== loadId) return
      const skipCount = get()._skipCount + 1
      set({ isLoading: false, isPlaying: false, audioUrl: '', _skipCount: skipCount, _restoreSeekTarget: null })
      if (skipCount >= MAX_CONSECUTIVE_SKIPS) {
        showToast('连续多首无法播放，已停止', 'warning')
        set({ _skipCount: 0 })
        return
      }
      if (skipCount <= 1) {
        showToast(`加载「${song.name}」失败，自动跳过`, 'error')
      }
      setCancelableTimeout(() => {
        get().nextSong()
      }, 500)
    }
  },

  cyclePlayMode: () => {
    const modes: PlayMode[] = ['sequential', 'loop', 'single', 'shuffle']
    const currentIndex = modes.indexOf(get().playMode)
    const nextMode = modes[(currentIndex + 1) % modes.length]

    if (nextMode === 'shuffle') {
      const { playlist, currentSongIndex } = get()
      const indices = playlist.map((_, i) => i).filter((i) => i !== currentSongIndex)
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]]
      }
      if (currentSongIndex >= 0) {
        indices.unshift(currentSongIndex)
      }
      set({ playMode: nextMode, shuffleOrder: indices, shuffleIndex: 0 })
    } else {
      set({ playMode: nextMode, shuffleOrder: [], shuffleIndex: -1 })
    }
  },

  addToPlayNext: (song: Song) => {
    set((state) => ({
      playNextQueue: [...state.playNextQueue, song],
    }))
    showToast(`已添加「${song.name}」到待播队列`, 'success')
  },

  removeFromPlayNext: (index: number) => {
    set((state) => ({
      playNextQueue: state.playNextQueue.filter((_, i) => i !== index),
    }))
  },

  moveInPlayNext: (fromIndex: number, toIndex: number) => {
    set((state) => {
      const queue = [...state.playNextQueue]
      const [moved] = queue.splice(fromIndex, 1)
      queue.splice(toIndex, 0, moved)
      return { playNextQueue: queue }
    })
  },

  playFromQueue: (index: number) => {
    const { playNextQueue, playlist, currentSongIndex } = get()
    const song = playNextQueue[index]
    if (!song) return
    // 只删除点击的那首歌，保留之前和之后的歌
    const remaining = [...playNextQueue.slice(0, index), ...playNextQueue.slice(index + 1)]
    const existingIndex = playlist.findIndex((s) => s.id === song.id)
    if (existingIndex >= 0) {
      set({ playNextQueue: remaining })
      get().playSong(existingIndex)
    } else {
      let newPlaylist: Song[]
      let adjustedIndex = currentSongIndex
      if (playlist.length >= MAX_PLAYLIST_SIZE) {
        const removeIndex = currentSongIndex === 0 ? 1 : 0
        newPlaylist = [...playlist.slice(0, removeIndex), ...playlist.slice(removeIndex + 1), song]
        adjustedIndex = currentSongIndex > removeIndex ? currentSongIndex - 1 : currentSongIndex
      } else {
        newPlaylist = [...playlist, song]
      }
      const newIndex = newPlaylist.length - 1
      set({ playlist: newPlaylist, currentSongIndex: adjustedIndex, playNextQueue: remaining })
      get().playSong(newIndex)
    }
  },

  clearPlayNext: () => {
    set({ playNextQueue: [] })
  },

  toggleFavorite: (song: Song) => {
    const { favorites } = get()
    const exists = favorites.findIndex((s) => s.id === song.id && s.platform === song.platform)
    let newFavorites: Song[]
    if (exists >= 0) {
      newFavorites = favorites.filter((_, i) => i !== exists)
      showToast('已取消收藏', 'info')
    } else {
      newFavorites = [...favorites, song]
      showToast(`已收藏「${song.name}」`, 'success')
    }
    set({ favorites: newFavorites })
    saveFavorites(newFavorites)
  },

  isFavorite: (songId: number, platform?: MusicPlatform) => {
    return get().favorites.some((s) => s.id === songId && (!platform || s.platform === platform))
  },

  addFavoritesToPlayNext: () => {
    const { favorites, playNextQueue } = get()
    const existingIds = new Set(playNextQueue.map((s) => s.id))
    const toAdd = favorites.filter((s) => !existingIds.has(s.id))
    set({ playNextQueue: [...playNextQueue, ...toAdd] })
    showToast(`已添加 ${toAdd.length} 首收藏到待播队列`, 'success')
  },

  playFavorite: (index: number) => {
    const { favorites, playlist, currentSongIndex } = get()
    if (index < 0 || index >= favorites.length) return
    const song = favorites[index]
    const existingIndex = playlist.findIndex((s) => s.id === song.id)
    if (existingIndex >= 0) {
      get().playSong(existingIndex)
    } else {
      let newPlaylist: Song[]
      let adjustedIndex = currentSongIndex
      if (playlist.length >= MAX_PLAYLIST_SIZE) {
        const removeIndex = currentSongIndex === 0 ? 1 : 0
        newPlaylist = [...playlist.slice(0, removeIndex), ...playlist.slice(removeIndex + 1), song]
        adjustedIndex = currentSongIndex > removeIndex ? currentSongIndex - 1 : currentSongIndex
      } else {
        newPlaylist = [...playlist, song]
      }
      const newIndex = newPlaylist.length - 1
      set({ playlist: newPlaylist, currentSongIndex: adjustedIndex })
      get().playSong(newIndex)
    }
  },

  addLocalSongs: (files: File[]) => {
    const audioFiles = files.filter((f) => f.type.startsWith('audio/'))
    if (audioFiles.length === 0) {
      showToast('未选择有效的音频文件', 'warning')
      return
    }
    const { playlist } = get()
    const localSongs: Song[] = audioFiles.map((file, index) => {
      const objectUrl = createObjectURL(file)
      const name = file.name.replace(/\.[^.]+$/, '')
      return {
        id: -(Date.now() * 1000 + index + Math.floor(Math.random() * 1000)),
        name,
        artists: '本地音乐',
        album: objectUrl,
        picUrl: '',
        duration: 0,
        platform: 'local' as MusicPlatform,
      }
    })
    set({ playlist: [...playlist, ...localSongs] })
    showToast(`已添加 ${audioFiles.length} 首本地音乐`, 'success')
  },

  playHistory: (index: number) => {
    const { history, playlist, currentSongIndex } = get()
    if (index < 0 || index >= history.length) return
    const song = history[index]
    const existingIndex = playlist.findIndex((s) => s.id === song.id)
    if (existingIndex >= 0) {
      get().playSong(existingIndex)
    } else {
      let newPlaylist: Song[]
      let adjustedIndex = currentSongIndex
      if (playlist.length >= MAX_PLAYLIST_SIZE) {
        const removeIndex = currentSongIndex === 0 ? 1 : 0
        newPlaylist = [...playlist.slice(0, removeIndex), ...playlist.slice(removeIndex + 1), song]
        adjustedIndex = currentSongIndex > removeIndex ? currentSongIndex - 1 : currentSongIndex
      } else {
        newPlaylist = [...playlist, song]
      }
      const newIndex = newPlaylist.length - 1
      set({ playlist: newPlaylist, currentSongIndex: adjustedIndex })
      get().playSong(newIndex)
    }
  },

  clearHistory: () => {
    set({ history: [] })
    saveHistory([])
    showToast('已清空播放历史', 'info')
  },

  loadSmartRecommend: async () => {
    const myLoadId = ++_recommendLoadId
    set({ smartRecommendLoading: true })
    const { favorites, history, playlist } = get()
    const allSongs = [...favorites, ...history]
    if (allSongs.length === 0) {
      set({ smartRecommendLoading: false })
      showToast('需要先收藏或播放歌曲才能推荐', 'info')
      return
    }

    const artistCount: Record<string, number> = {}
    for (const song of allSongs) {
      const artists = song.artists.split(/[/、,，]/).map((a) => a.trim()).filter(Boolean)
      for (const artist of artists) {
        artistCount[artist] = (artistCount[artist] || 0) + 1
      }
    }

    const topArtists = Object.entries(artistCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name]) => name)

    if (topArtists.length === 0) {
      set({ smartRecommendLoading: false })
      showToast('需要先收藏或播放歌曲才能推荐', 'info')
      return
    }

    try {
      const existingIds = new Set([
        ...playlist.map((s) => s.id),
        ...favorites.map((s) => s.id),
        ...history.map((s) => s.id),
      ])

      // 同时搜索网易云和QQ音乐，加快速度
      const results = await Promise.all(
        topArtists.flatMap((artist) => [
          searchSongs(artist, 'netease', 5).catch(() => ({ songs: [], total: 0 })),
          searchSongs(artist, 'qq', 5).catch(() => ({ songs: [], total: 0 })),
        ])
      )

      if (myLoadId !== _recommendLoadId) return

      const recommended: Song[] = []
      for (const result of results) {
        for (const song of result.songs) {
          if (!existingIds.has(song.id) && (!song.duration || song.duration >= 60000) && recommended.length < 15) {
            recommended.push(song)
            existingIds.add(song.id)
          }
        }
      }

      if (recommended.length === 0) {
        showToast('暂无新歌推荐，稍后再试', 'info')
      }
      if (myLoadId !== _recommendLoadId) {
        set({ smartRecommendLoading: false })
        return
      }
      set({ smartRecommend: recommended, smartRecommendLoading: false })
    } catch {
      if (myLoadId !== _recommendLoadId) return
      set({ smartRecommendLoading: false })
      showToast('推荐加载失败，请重试', 'warning')
    }
  },

  playSmartRecommend: (index: number) => {
    const { smartRecommend, playlist, currentSongIndex } = get()
    if (index < 0 || index >= smartRecommend.length) return
    const song = smartRecommend[index]
    const existingIndex = playlist.findIndex((s) => s.id === song.id)
    if (existingIndex >= 0) {
      get().playSong(existingIndex)
    } else {
      let newPlaylist: Song[]
      let adjustedIndex = currentSongIndex
      if (playlist.length >= MAX_PLAYLIST_SIZE) {
        const removeIndex = currentSongIndex === 0 ? 1 : 0
        newPlaylist = [...playlist.slice(0, removeIndex), ...playlist.slice(removeIndex + 1), song]
        adjustedIndex = currentSongIndex > removeIndex ? currentSongIndex - 1 : currentSongIndex
      } else {
        newPlaylist = [...playlist, song]
      }
      const newIndex = newPlaylist.length - 1
      set({ playlist: newPlaylist, currentSongIndex: adjustedIndex })
      get().playSong(newIndex)
    }
  },

  setSleepTimer: (minutes: number) => {
    if (minutes <= 0) {
      set({ sleepTimer: 0, sleepTimerTotal: 0 })
      showToast('已取消定时停止', 'info')
    } else {
      const seconds = minutes * 60
      set({ sleepTimer: seconds, sleepTimerTotal: seconds })
      showToast(`将在 ${minutes} 分钟后自动暂停`, 'info')
    }
  },

  tickSleepTimer: () => {
    const { sleepTimer, isPlaying } = get()
    if (sleepTimer <= 0) return
    const newTimer = sleepTimer - 1
    if (newTimer <= 0) {
      set({ sleepTimer: 0, sleepTimerTotal: 0 })
      if (isPlaying) {
        get().togglePlay()
        showToast('定时结束，已暂停播放', 'info')
      }
    } else {
      set({ sleepTimer: newTimer })
    }
  },

  recognizeAndSearch: async (imageBase64: string, mimeType = 'image/jpeg') => {
    set({ ocrLoading: true, ocrSongs: [], ocrProgress: '正在识别图片...' })

    try {
      const { recognizeImage, parseSongList } = await import('@/services/ocrService')
      const ocrResult = await recognizeImage(imageBase64, mimeType)

      if (!ocrResult.success || ocrResult.lines.length === 0) {
        set({ ocrLoading: false, ocrProgress: '识别失败，请尝试更清晰的截图' })
        setCancelableTimeout(() => set({ ocrProgress: '' }), 3000)
        return
      }

      const parsedSongs = parseSongList(ocrResult.lines)
      if (parsedSongs.length === 0) {
        set({ ocrLoading: false, ocrProgress: '未识别到歌曲，请尝试更清晰的歌单截图' })
        setCancelableTimeout(() => set({ ocrProgress: '' }), 3000)
        return
      }

      // 并行搜索，最多 3 个并发
      const foundSongs: Song[] = []
      const batchSize = 3
      for (let i = 0; i < parsedSongs.length; i += batchSize) {
        const batch = parsedSongs.slice(i, i + batchSize)
        set({ ocrProgress: `搜索中 ${Math.min(i + batchSize, parsedSongs.length)}/${parsedSongs.length}...` })
        const results = await Promise.allSettled(
          batch.map(async (item) => {
            const keyword = item.artist ? `${item.name} ${item.artist}` : item.name
            let result = await searchSongs(keyword, 'netease', 3)
            if (result.songs.length === 0) {
              result = await searchSongs(keyword, 'qq', 3)
            }
            return result
          })
        )
        for (const result of results) {
          if (result.status === 'fulfilled' && result.value.songs.length > 0) {
            const song = result.value.songs[0]
            if (!song.duration || song.duration >= 60000) {
              foundSongs.push(song)
            }
          }
        }
        if (i + batchSize < parsedSongs.length) {
          await new Promise((r) => setTimeout(r, 200))
        }
      }

      if (foundSongs.length === 0) {
        set({ ocrLoading: false, ocrProgress: '未搜索到匹配歌曲' })
        setCancelableTimeout(() => set({ ocrProgress: '' }), 3000)
      } else {
        set({ ocrSongs: foundSongs, ocrLoading: false, ocrProgress: '' })
        showToast(`识别到 ${foundSongs.length} 首歌曲`, 'success')
      }
    } catch {
      set({ ocrLoading: false, ocrProgress: '识别出错，请重试' })
      setCancelableTimeout(() => set({ ocrProgress: '' }), 3000)
    }
  },

  addOcrSongsToPlaylist: () => {
    const { ocrSongs, playNextQueue } = get()
    if (ocrSongs.length === 0) return
    set({ playNextQueue: [...playNextQueue, ...ocrSongs], ocrSongs: [] })
    showToast(`已添加 ${ocrSongs.length} 首歌到待播队列`, 'success')
  },

  clearOcrSongs: () => {
    set({ ocrSongs: [] })
  },

  setDisplayMode: (mode: DisplayMode) => {
    set({ displayMode: mode })
  },

  toggleRoaming: () => {
    const { isRoaming } = get()
    if (!isRoaming) {
      set({ isRoaming: true, _roamPlayIndex: -1 })
      get().loadRoamSongs()
      showToast('已开启漫游模式', 'info')
    } else {
      set({ isRoaming: false, roamSongs: [], roamLoading: false, _roamPlayIndex: -1 })
      showToast('已关闭漫游模式', 'info')
    }
  },

  loadRoamSongs: async () => {
    const { roamLoading } = get()
    if (roamLoading) return // 防止并发调用
    set({ roamLoading: true })
    const { favorites, history, playlist, roamSongs } = get()
    const wasEmpty = roamSongs.length === 0
    const allSongs = [...favorites, ...history]
    if (allSongs.length === 0) {
      set({ roamLoading: false })
      showToast('需要先收藏或播放歌曲才能漫游', 'info')
      return
    }

    const artistCount: Record<string, number> = {}
    for (const song of allSongs) {
      const artists = song.artists.split(/[/、,，]/).map((a) => a.trim()).filter(Boolean)
      for (const artist of artists) {
        artistCount[artist] = (artistCount[artist] || 0) + 1
      }
    }

    const topArtists = Object.entries(artistCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name]) => name)

    if (topArtists.length === 0) {
      set({ roamLoading: false })
      return
    }

    for (let i = topArtists.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [topArtists[i], topArtists[j]] = [topArtists[j], topArtists[i]]
    }
    const selectedArtists = topArtists.slice(0, Math.min(3, topArtists.length))

    try {
      const existingIds = new Set([
        ...playlist.map((s) => s.id),
        ...roamSongs.map((s) => s.id),
        ...favorites.map((s) => s.id),
        ...history.map((s) => s.id),
      ])

      // 同时搜索网易云和QQ音乐，加快速度
      const results = await Promise.all(
        selectedArtists.flatMap((artist) => [
          searchSongs(artist, 'netease', 5).catch(() => ({ songs: [], total: 0 })),
          searchSongs(artist, 'qq', 5).catch(() => ({ songs: [], total: 0 })),
        ])
      )

      const newSongs: Song[] = []
      for (const result of results) {
        for (const song of result.songs) {
          if (!existingIds.has(song.id) && (!song.duration || song.duration >= 60000)) {
            newSongs.push(song)
            existingIds.add(song.id)
          }
        }
      }

      // 如果按歌手搜索没有新歌，尝试用收藏/历史中的歌名搜索
      if (newSongs.length === 0) {
        const songNames = allSongs
          .map((s) => s.name)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
        const fallbackResults = await Promise.all(
          songNames.flatMap((name) => [
            searchSongs(name, 'netease', 3).catch(() => ({ songs: [], total: 0 })),
            searchSongs(name, 'qq', 3).catch(() => ({ songs: [], total: 0 })),
          ])
        )
        for (const result of fallbackResults) {
          for (const song of result.songs) {
            if (!existingIds.has(song.id) && (!song.duration || song.duration >= 60000)) {
              newSongs.push(song)
              existingIds.add(song.id)
            }
          }
        }
      }

      // 预验证播放链接，过滤掉无法播放的歌曲
      const verifiedSongs: Song[] = []
      const verifyBatchSize = 5
      for (let i = 0; i < newSongs.length; i += verifyBatchSize) {
        const batch = newSongs.slice(i, i + verifyBatchSize)
        const verifyResults = await Promise.allSettled(
          batch.map((song) => getSongUrl(song))
        )
        for (let j = 0; j < batch.length; j++) {
          const r = verifyResults[j]
          if (r.status === 'fulfilled' && r.value && r.value.url) {
            // 验证通过，更新封面（QQ音乐会返回封面）
            const song = batch[j]
            if (r.value.cover && !song.picUrl) {
              verifiedSongs.push({ ...song, picUrl: r.value.cover })
            } else {
              verifiedSongs.push(song)
            }
          }
        }
        // 够了就不再验证
        if (verifiedSongs.length >= 10) break
      }

      for (let i = verifiedSongs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [verifiedSongs[i], verifiedSongs[j]] = [verifiedSongs[j], verifiedSongs[i]]
      }

      if (verifiedSongs.length === 0) {
        showToast('暂无新歌可漫游，稍后再试', 'info')
      }
      if (!get().isRoaming) {
        set({ roamLoading: false })
        return
      }
      set((state) => ({ roamSongs: [...state.roamSongs, ...verifiedSongs], roamLoading: false }))

      // 首次加载漫游歌曲时，自动播放第一首
      if (wasEmpty && verifiedSongs.length > 0 && get().isRoaming) {
        get().playRoamSong(0)
      }
    } catch {
      set({ roamLoading: false })
      showToast('漫游加载失败，请重试', 'warning')
    }
  },

  playRoamSong: (index: number) => {
    const { roamSongs, playlist, currentSongIndex } = get()
    if (index < 0 || index >= roamSongs.length) return
    const song = roamSongs[index]
    set({ _roamPlayIndex: index })
    const existingIndex = playlist.findIndex((s) => s.id === song.id)
    if (existingIndex >= 0) {
      get().playSong(existingIndex)
    } else {
      let newPlaylist: Song[]
      let adjustedIndex = currentSongIndex
      if (playlist.length >= MAX_PLAYLIST_SIZE) {
        const removeIndex = currentSongIndex === 0 ? 1 : 0
        newPlaylist = [...playlist.slice(0, removeIndex), ...playlist.slice(removeIndex + 1), song]
        adjustedIndex = currentSongIndex > removeIndex ? currentSongIndex - 1 : currentSongIndex
      } else {
        newPlaylist = [...playlist, song]
      }
      const newIndex = newPlaylist.length - 1
      set({ playlist: newPlaylist, currentSongIndex: adjustedIndex })
      get().playSong(newIndex)
    }
  },

  removeRoamSong: (index: number) => {
    const { roamSongs, _roamPlayIndex } = get()
    if (index < 0 || index >= roamSongs.length) return
    const newRoamSongs = roamSongs.filter((_, i) => i !== index)
    // 调整播放索引
    let newPlayIndex = _roamPlayIndex
    if (index < _roamPlayIndex) {
      newPlayIndex = _roamPlayIndex - 1
    } else if (index === _roamPlayIndex) {
      newPlayIndex = -1
    }
    set({ roamSongs: newRoamSongs, _roamPlayIndex: newPlayIndex })
  },

  toggleDarkMode: () => {
    const newMode = !get().darkMode
    set({ darkMode: newMode })
    try {
      localStorage.setItem('music_darkMode', String(newMode))
    } catch { /* ignore */ }
    if (newMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  },

  createPlaylist: (name: string) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
    const newPlaylist: Playlist = { id, name, songs: [], createdAt: Date.now() }
    const playlists = [...get().savedPlaylists, newPlaylist]
    set({ savedPlaylists: playlists })
    saveSavedPlaylists(playlists)
    showToast(`已创建歌单「${name}」`, 'success')
    return id
  },

  deletePlaylist: (id: string) => {
    const playlists = get().savedPlaylists.filter((p) => p.id !== id)
    set({ savedPlaylists: playlists })
    saveSavedPlaylists(playlists)
    showToast('已删除歌单', 'info')
  },

  renamePlaylist: (id: string, name: string) => {
    const playlists = get().savedPlaylists.map((p) =>
      p.id === id ? { ...p, name } : p
    )
    set({ savedPlaylists: playlists })
    saveSavedPlaylists(playlists)
  },

  addSongToPlaylist: (playlistId: string, song: Song) => {
    const playlists = get().savedPlaylists.map((p) => {
      if (p.id !== playlistId) return p
      if (p.songs.length >= MAX_PLAYLIST_SIZE) return p
      // 按 id+platform 去重
      if (p.songs.some((s) => s.id === song.id && s.platform === song.platform)) return p
      return { ...p, songs: [...p.songs, song] }
    })
    set({ savedPlaylists: playlists })
    saveSavedPlaylists(playlists)
  },

  removeSongFromPlaylist: (playlistId: string, songId: number, songPlatform: string) => {
    const playlists = get().savedPlaylists.map((p) => {
      if (p.id !== playlistId) return p
      return { ...p, songs: p.songs.filter((s) => !(s.id === songId && s.platform === songPlatform)) }
    })
    set({ savedPlaylists: playlists })
    saveSavedPlaylists(playlists)
  },

  playPlaylist: (id: string) => {
    const playlist = get().savedPlaylists.find((p) => p.id === id)
    if (!playlist || playlist.songs.length === 0) return
    set({
      playlist: playlist.songs,
      currentSongIndex: -1,
      shuffleOrder: [],
      shuffleIndex: -1,
    })
    get().playSong(0)
  },

  addPlaylistToPlayNext: (id: string) => {
    const playlist = get().savedPlaylists.find((p) => p.id === id)
    if (!playlist || playlist.songs.length === 0) return
    const { playNextQueue } = get()
    const existingIds = new Set(playNextQueue.map((s) => `${s.id}:${s.platform}`))
    const toAdd = playlist.songs.filter((s) => !existingIds.has(`${s.id}:${s.platform}`))
    set({ playNextQueue: [...playNextQueue, ...toAdd] })
    showToast(`已添加 ${toAdd.length} 首歌到待播队列`, 'success')
  },

  restoreProgress: () => {
    const progress = loadProgress()
    if (!progress) return
    const { playlist } = get()
    const songIndex = playlist.findIndex((s) => s.id === progress.songId)
    if (songIndex >= 0) {
      const loadId = get()._loadId + 1
      set({
        currentSong: playlist[songIndex],
        currentSongIndex: songIndex,
        isPlaying: true,
        currentTime: 0,
        audioUrl: '',
        currentLyricIndex: -1,
        _skipCount: 0,
        isLoading: true,
        _loadId: loadId,
        _restoreSeekTarget: progress.currentTime,
      })
      get().loadSongData(progress.songId, loadId)
      localStorage.removeItem('music_progress')
    }
  },

  clearSearchHistory: () => {
    set({ searchHistory: [] })
    saveSearchHistory([])
  },

  removeSearchHistoryItem: (keyword: string) => {
    const newHistory = get().searchHistory.filter((k) => k !== keyword)
    set({ searchHistory: newHistory })
    saveSearchHistory(newHistory)
  },
}))

// 页面卸载时清理 ObjectURL 并保存播放进度
window.addEventListener('beforeunload', () => {
  const { currentSong, currentTime } = usePlayerStore.getState()
  if (currentSong && currentTime > 0) {
    saveProgress(currentSong.id, currentTime)
  }
  revokeAllObjectURLs()
})
