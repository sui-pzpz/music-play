import { usePlayerStore } from '@/store/playerStore'
import { Music, Search, Loader2, Plus, Heart, FolderOpen, Clock, Trash2, RefreshCw, Sparkles, ImageIcon, X, Compass, ChevronDown, ChevronRight, ListMusic, Pencil, Check, Play, History } from 'lucide-react'
import { useState, useCallback, useRef, useEffect } from 'react'
import { clsx } from 'clsx'
import type { MusicPlatform, Song } from '@/types'

// 骨架屏组件
function SongSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="h-10 w-10 flex-shrink-0 rounded skeleton" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-3.5 w-3/4 rounded skeleton" />
        <div className="h-2.5 w-1/2 rounded skeleton" />
      </div>
    </div>
  )
}

// 歌曲行组件
export function SongRow({ song, isActive, onPlay, onFavorite, onAddNext, onDelete, onAddToPlaylist, isFav, compact, platformTag, darkMode }: {
  song: { id: number; mid?: string; name: string; artists: string; picUrl?: string; platform: string }
  index?: number
  isActive?: boolean
  onPlay: () => void
  onFavorite?: () => void
  onAddNext?: () => void
  onDelete?: () => void
  onAddToPlaylist?: () => void
  isFav?: boolean
  compact?: boolean
  platformTag?: boolean
  darkMode?: boolean
}) {
  const [showPlaylistDropdown, setShowPlaylistDropdown] = useState(false)
  const [added, setAdded] = useState(false)
  const size = compact ? 'h-9 w-9' : 'h-10 w-10'
  const iconSize = compact ? 'h-3.5 w-3.5' : 'h-4 w-4'
  const py = compact ? 'py-2' : 'py-3'

  const handleAddNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    onAddNext?.()
    setAdded(true)
    setTimeout(() => setAdded(false), 1000)
  }

  return (
    <div
      className={clsx(
        'group relative flex w-full items-center gap-3 rounded-lg px-4 text-left transition-all duration-200',
        py,
        isActive
          ? darkMode ? 'bg-[#3a2a1a] text-emerald-400' : 'bg-emerald-50 text-emerald-700'
          : darkMode ? 'text-zinc-300 hover:bg-[#1e1e3a]' : 'text-zinc-600 hover:bg-green-100 hover:text-zinc-900'
      )}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-emerald-600" />
      )}
      {song.picUrl ? (
        <img src={song.picUrl} alt={song.name} loading="lazy" className={`${size} flex-shrink-0 rounded object-cover shadow-sm`} />
      ) : (
        <div className={`flex ${size} flex-shrink-0 items-center justify-center rounded ${darkMode ? 'bg-[#2a2a4a]' : 'bg-zinc-200'}`}>
          <Music className={`${iconSize} text-zinc-400`} />
        </div>
      )}
      <button onClick={onPlay} className="min-w-0 flex-1">
        <p className={clsx('truncate text-sm font-medium text-left', isActive ? 'text-emerald-700' : darkMode ? 'text-zinc-200' : 'text-zinc-800')}>
          {song.name}
        </p>
        <p className="truncate text-xs text-zinc-400">
          {song.artists}
          {platformTag && (
            <span className={clsx(
              'ml-1.5 inline-block rounded px-1 py-0.5 text-[10px]',
              song.platform === 'qq' ? (darkMode ? 'bg-[#1e3a2a] text-green-400' : 'bg-green-100 text-green-600') : song.platform === 'local' ? (darkMode ? 'bg-[#2a2a4a] text-zinc-400' : 'bg-zinc-100 text-zinc-500') : (darkMode ? 'bg-[#3a1a2a] text-red-400' : 'bg-red-50 text-red-500')
            )}>
              {song.platform === 'qq' ? 'QQ' : song.platform === 'local' ? '本地' : '网易云'}
            </span>
          )}
        </p>
      </button>
      {onFavorite && (
        <button
          onClick={(e) => { e.stopPropagation(); onFavorite() }}
          className={clsx(
            'flex-shrink-0 rounded-full p-1.5 transition-all',
            isFav ? 'text-red-500' : 'text-zinc-300 md:opacity-0 md:group-hover:opacity-100 hover:text-red-400'
          )}
          title={isFav ? '取消收藏' : '收藏'}
        >
          <Heart className="h-4 w-4" fill={isFav ? 'currentColor' : 'none'} />
        </button>
      )}
      {onAddNext && (
        <button
          onClick={handleAddNext}
          className={clsx(
            'flex-shrink-0 rounded-full p-1.5 transition-all duration-300',
            added
              ? 'text-emerald-500 scale-110'
              : 'text-zinc-300 md:opacity-0 md:group-hover:opacity-100',
            !added && (darkMode ? 'hover:text-emerald-400 hover:bg-[#3a2a1a]' : 'hover:text-emerald-600 hover:bg-emerald-50')
          )}
          title="下一首播放"
        >
          {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </button>
      )}
      {onAddToPlaylist && (
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setShowPlaylistDropdown(!showPlaylistDropdown) }}
            className={clsx(
              'flex-shrink-0 rounded-full p-1.5 transition-all md:opacity-0 md:group-hover:opacity-100',
              showPlaylistDropdown
                ? 'text-green-600 bg-green-50'
                : darkMode ? 'text-zinc-400 hover:text-green-400 hover:bg-[#1e3a2a]' : 'text-zinc-300 hover:text-green-600 hover:bg-green-50'
            )}
            title="添加到歌单"
          >
            <ListMusic className="h-4 w-4" />
          </button>
          {showPlaylistDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowPlaylistDropdown(false) }} />
              <AddToPlaylistDropdown song={song} onClose={() => setShowPlaylistDropdown(false)} />
            </>
          )}
        </div>
      )}
      {onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className={clsx(
            'flex-shrink-0 rounded-full p-1.5 text-zinc-300 md:opacity-0 transition-all md:group-hover:opacity-100',
            darkMode ? 'hover:text-red-400 hover:bg-[#3a1a1a]' : 'hover:text-red-500 hover:bg-red-50'
          )}
          title="删除"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

// 可折叠区域
export function CollapsibleSection({ title, icon, count, collapsed, onToggle, rightAction, children }: {
  title: string
  icon: React.ReactNode
  count?: number
  collapsed: boolean
  onToggle: () => void
  rightAction?: React.ReactNode
  children: React.ReactNode
}) {
  const darkMode = usePlayerStore((s) => s.darkMode)
  return (
    <div>
      <div className="w-full px-4 pt-3 pb-1 flex items-center justify-between">
        <button onClick={onToggle} className="flex items-center gap-1.5">
          {collapsed ? <ChevronRight className="h-3 w-3 text-zinc-400" /> : <ChevronDown className="h-3 w-3 text-zinc-400" />}
          {icon}
          <p className={clsx('text-xs font-medium', darkMode ? 'text-zinc-400' : 'text-zinc-500')}>{title}</p>
          {count !== undefined && <span className="text-[10px] text-zinc-400">{count}首</span>}
        </button>
        {rightAction}
      </div>
      {!collapsed && children}
    </div>
  )
}

// 添加到歌单下拉菜单
export function AddToPlaylistDropdown({ song, onClose }: {
  song: { id: number; mid?: string; name: string; artists: string; picUrl?: string; platform: string }
  onClose: () => void
}) {
  const darkMode = usePlayerStore((s) => s.darkMode)
  const savedPlaylists = usePlayerStore((s) => s.savedPlaylists)
  const createPlaylist = usePlayerStore((s) => s.createPlaylist)
  const addSongToPlaylist = usePlayerStore((s) => s.addSongToPlaylist)
  const [newName, setNewName] = useState('')
  const [showNewInput, setShowNewInput] = useState(false)

  const handleCreateAndAdd = () => {
    const name = newName.trim() || `我的歌单 ${savedPlaylists.length + 1}`
    const id = createPlaylist(name)
    const fullSong: Song = {
      id: song.id,
      mid: song.mid,
      name: song.name,
      artists: song.artists,
      picUrl: song.picUrl ?? '',
      album: '',
      duration: 0,
      platform: song.platform as MusicPlatform,
    }
    addSongToPlaylist(id, fullSong)
    onClose()
  }

  const handleSelect = (playlistId: string) => {
    const fullSong: Song = {
      id: song.id,
      mid: song.mid,
      name: song.name,
      artists: song.artists,
      picUrl: song.picUrl ?? '',
      album: '',
      duration: 0,
      platform: song.platform as MusicPlatform,
    }
    addSongToPlaylist(playlistId, fullSong)
    onClose()
  }

  return (
    <div className="absolute right-0 top-full z-50 mt-1 min-w-[160px] rounded-lg shadow-lg border animate-fade-in"
      style={{ backgroundColor: darkMode ? '#27273a' : '#fff', borderColor: darkMode ? '#3a3a5a' : '#e5e7eb' }}
    >
      <div className="py-1">
        <button
          onClick={() => setShowNewInput(true)}
          className={clsx(
            'flex w-full items-center gap-2 px-3 py-2 text-xs font-medium',
            darkMode ? 'text-green-400 hover:bg-[#3a3a5a]' : 'text-green-600 hover:bg-green-50'
          )}
        >
          <Plus className="h-3 w-3" />
          新建歌单
        </button>
        {showNewInput && (
          <div className="flex items-center gap-1 px-2 py-1">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={`我的歌单 ${savedPlaylists.length + 1}`}
              className={clsx(
                'flex-1 rounded px-2 py-1 text-xs outline-none ring-1 focus:ring-green-400',
                darkMode ? 'bg-[#1e1e3a] text-zinc-200 ring-[#3a3a5a]' : 'bg-white text-zinc-800 ring-zinc-200'
              )}
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreateAndAdd(); if (e.key === 'Escape') onClose() }}
            />
            <button onClick={handleCreateAndAdd} className="rounded p-1 text-green-600 hover:bg-green-50">
              <Check className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        {savedPlaylists.length > 0 && (
          <div className={clsx('border-t', darkMode ? 'border-[#3a3a5a]' : 'border-zinc-100')}>
            {savedPlaylists.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelect(p.id)}
                className={clsx(
                  'flex w-full items-center gap-2 px-3 py-2 text-xs',
                  darkMode ? 'text-zinc-300 hover:bg-[#3a3a5a]' : 'text-zinc-700 hover:bg-zinc-50'
                )}
              >
                <ListMusic className="h-3 w-3 text-zinc-400" />
                <span className="truncate flex-1 text-left">{p.name}</span>
                <span className="text-[10px] text-zinc-400">{p.songs.length}首</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// 歌单 Tab 内容
export function PlaylistTabContent({ savedPlaylists, createPlaylist, deletePlaylist, renamePlaylist, removeSongFromPlaylist, playPlaylist, addPlaylistToPlayNext, addToPlayNext, toggleFavorite, isFav, darkMode }: {
  savedPlaylists: import('@/types').Playlist[]
  createPlaylist: (name: string) => string
  deletePlaylist: (id: string) => void
  renamePlaylist: (id: string, name: string) => void
  removeSongFromPlaylist: (playlistId: string, songId: number, songPlatform: string) => void
  playPlaylist: (id: string) => void
  addPlaylistToPlayNext: (id: string) => void
  addToPlayNext: (song: import('@/types').Song) => void
  toggleFavorite: (song: import('@/types').Song) => void
  isFav: (songId: number, platform?: string) => boolean
  darkMode: boolean
}) {
  const [expandedPlaylist, setExpandedPlaylist] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [showNewPlaylist, setShowNewPlaylist] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const renameCancelledRef = useRef(false)

  const handleCreate = () => {
    const name = newPlaylistName.trim() || `我的歌单 ${savedPlaylists.length + 1}`
    createPlaylist(name)
    setNewPlaylistName('')
    setShowNewPlaylist(false)
  }

  const handleRename = (id: string) => {
    if (editName.trim()) {
      renamePlaylist(id, editName.trim())
    }
    setEditingId(null)
    setEditName('')
  }

  return (
    <div className="animate-fade-in">
      {/* 新建歌单按钮 */}
      <div className="px-4 pt-2 pb-2">
        {showNewPlaylist ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder={`我的歌单 ${savedPlaylists.length + 1}`}
              className={clsx(
                'flex-1 rounded-lg px-3 py-2 text-sm outline-none ring-1 focus:ring-green-400',
                darkMode ? 'bg-[#27273a] text-zinc-200 ring-[#3a3a5a]' : 'bg-white/70 text-zinc-800 ring-green-200'
              )}
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setShowNewPlaylist(false) }}
            />
            <button onClick={handleCreate} className="rounded-lg bg-emerald-600 p-2 text-white hover:bg-emerald-500">
              <Check className="h-4 w-4" />
            </button>
            <button onClick={() => { setShowNewPlaylist(false); setNewPlaylistName('') }} className="rounded-lg p-2 text-zinc-400 hover:text-zinc-600">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowNewPlaylist(true)}
            className={clsx(
              'flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium ring-1 transition-all',
              darkMode
                ? 'bg-[#27273a] text-zinc-400 ring-[#3a3a5a] hover:bg-[#3a3a5a] hover:text-zinc-200'
                : 'bg-white/70 text-zinc-500 ring-green-200 hover:bg-green-100 hover:text-zinc-700'
            )}
          >
            <Plus className="h-4 w-4" />
            新建歌单
          </button>
        )}
      </div>

      {/* 歌单列表 */}
      {savedPlaylists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
          <ListMusic className="mb-3 h-10 w-10" />
          <p className="text-sm">还没有歌单</p>
          <p className="text-xs mt-1">点击上方按钮创建歌单</p>
        </div>
      ) : (
        savedPlaylists.map((pl) => (
          <div key={pl.id} className={clsx('mb-1 rounded-lg', darkMode ? 'hover:bg-[#1e1e3a]' : 'hover:bg-green-50')}>
            {/* 歌单头部 */}
            <div className="flex items-center gap-2 px-4 py-2">
              <button
                onClick={() => setExpandedPlaylist(expandedPlaylist === pl.id ? null : pl.id)}
                className="flex items-center gap-1.5 min-w-0 flex-1"
              >
                {expandedPlaylist === pl.id
                  ? <ChevronDown className="h-3.5 w-3.5 flex-shrink-0 text-zinc-400" />
                  : <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-zinc-400" />
                }
                <ListMusic className={clsx('h-4 w-4 flex-shrink-0', darkMode ? 'text-emerald-400' : 'text-emerald-600')} />
                {editingId === pl.id ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => { if (!renameCancelledRef.current) handleRename(pl.id); renameCancelledRef.current = false }}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleRename(pl.id); if (e.key === 'Escape') { renameCancelledRef.current = true; setEditingId(null) } }}
                    className={clsx(
                      'flex-1 rounded px-1.5 py-0.5 text-sm outline-none ring-1 focus:ring-green-400',
                      darkMode ? 'bg-[#27273a] text-zinc-200 ring-[#3a3a5a]' : 'bg-white text-zinc-800 ring-green-200'
                    )}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className={clsx('truncate text-sm font-medium', darkMode ? 'text-zinc-200' : 'text-zinc-800')}>
                    {pl.name}
                  </span>
                )}
                <span className="text-[10px] text-zinc-400 flex-shrink-0">{pl.songs.length}首</span>
              </button>

              {/* 操作按钮 */}
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <button
                  onClick={() => playPlaylist(pl.id)}
                  className={clsx('rounded-full p-1 text-zinc-400', darkMode ? 'hover:text-emerald-400 hover:bg-[#3a2a1a]' : 'hover:text-emerald-600 hover:bg-emerald-50')}
                  title="播放全部"
                >
                  <Play className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => addPlaylistToPlayNext(pl.id)}
                  className={clsx('rounded-full p-1 text-zinc-400', darkMode ? 'hover:text-emerald-400 hover:bg-[#3a2a1a]' : 'hover:text-emerald-600 hover:bg-emerald-50')}
                  title="添加到待播队列"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => { setEditingId(pl.id); setEditName(pl.name) }}
                  className={clsx('rounded-full p-1 text-zinc-400', darkMode ? 'hover:text-blue-400 hover:bg-[#1a2a3a]' : 'hover:text-blue-500 hover:bg-blue-50')}
                  title="重命名"
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  onClick={() => deletePlaylist(pl.id)}
                  className={clsx('rounded-full p-1 text-zinc-400', darkMode ? 'hover:text-red-400 hover:bg-[#3a1a1a]' : 'hover:text-red-500 hover:bg-red-50')}
                  title="删除歌单"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* 展开的歌曲列表 */}
            {expandedPlaylist === pl.id && (
              <div className="animate-fade-in">
                {pl.songs.length === 0 ? (
                  <div className="flex items-center justify-center py-4 text-zinc-400">
                    <span className="text-xs">歌单是空的，从搜索或收藏中添加歌曲</span>
                  </div>
                ) : (
                  pl.songs.map((song, songIndex) => (
                    <SongRow
                      key={`${pl.id}-song-${songIndex}`}
                      song={song}
                      index={songIndex}
                      onPlay={() => {
                        const { playlist, currentSongIndex } = usePlayerStore.getState()
                        const existingIndex = playlist.findIndex((s) => s.id === song.id && s.platform === song.platform)
                        if (existingIndex >= 0) {
                          usePlayerStore.getState().playSong(existingIndex)
                        } else {
                          let newPlaylist: typeof playlist
                          let adjustedIndex = currentSongIndex
                          if (playlist.length >= 200) {
                            const removeIndex = currentSongIndex === 0 ? 1 : 0
                            newPlaylist = [...playlist.slice(0, removeIndex), ...playlist.slice(removeIndex + 1), song]
                            adjustedIndex = currentSongIndex > removeIndex ? currentSongIndex - 1 : currentSongIndex
                          } else {
                            newPlaylist = [...playlist, song]
                          }
                          usePlayerStore.setState({ playlist: newPlaylist, currentSongIndex: adjustedIndex })
                          usePlayerStore.getState().playSong(newPlaylist.length - 1)
                        }
                      }}
                      onFavorite={() => toggleFavorite(song)}
                      onAddNext={() => addToPlayNext(song)}
                      onAddToPlaylist={() => {}}
                      isFav={isFav(song.id, song.platform)}
                      onDelete={() => removeSongFromPlaylist(pl.id, song.id, song.platform)}
                      compact
                      darkMode={darkMode}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}

export default function PlaylistPanel() {
  const playlist = usePlayerStore((s) => s.playlist)
  const currentSongIndex = usePlayerStore((s) => s.currentSongIndex)
  const playSong = usePlayerStore((s) => s.playSong)
  const setSearchKeyword = usePlayerStore((s) => s.setSearchKeyword)
  const search = usePlayerStore((s) => s.search)
  const isSearching = usePlayerStore((s) => s.isSearching)
  const searchKeyword = usePlayerStore((s) => s.searchKeyword)
  const addToPlayNext = usePlayerStore((s) => s.addToPlayNext)
  const favorites = usePlayerStore((s) => s.favorites)
  const toggleFavorite = usePlayerStore((s) => s.toggleFavorite)
  const playFavorite = usePlayerStore((s) => s.playFavorite)
  const platform = usePlayerStore((s) => s.platform)
  const setPlatform = usePlayerStore((s) => s.setPlatform)
  const addLocalSongs = usePlayerStore((s) => s.addLocalSongs)
  const history = usePlayerStore((s) => s.history)
  const playHistory = usePlayerStore((s) => s.playHistory)
  const clearHistory = usePlayerStore((s) => s.clearHistory)
  const smartRecommend = usePlayerStore((s) => s.smartRecommend)
  const smartRecommendLoading = usePlayerStore((s) => s.smartRecommendLoading)
  const loadSmartRecommend = usePlayerStore((s) => s.loadSmartRecommend)
  const playSmartRecommend = usePlayerStore((s) => s.playSmartRecommend)
  const ocrLoading = usePlayerStore((s) => s.ocrLoading)
  const ocrProgress = usePlayerStore((s) => s.ocrProgress)
  const ocrSongs = usePlayerStore((s) => s.ocrSongs)
  const recognizeAndSearch = usePlayerStore((s) => s.recognizeAndSearch)
  const addOcrSongsToPlaylist = usePlayerStore((s) => s.addOcrSongsToPlaylist)
  const clearOcrSongs = usePlayerStore((s) => s.clearOcrSongs)
  const isRoaming = usePlayerStore((s) => s.isRoaming)
  const roamSongs = usePlayerStore((s) => s.roamSongs)
  const roamLoading = usePlayerStore((s) => s.roamLoading)
  const toggleRoaming = usePlayerStore((s) => s.toggleRoaming)
  const loadRoamSongs = usePlayerStore((s) => s.loadRoamSongs)
  const playRoamSong = usePlayerStore((s) => s.playRoamSong)
  const removeRoamSong = usePlayerStore((s) => s.removeRoamSong)
  const darkMode = usePlayerStore((s) => s.darkMode)
  const _roamPlayIndex = usePlayerStore((s) => s._roamPlayIndex)
  const savedPlaylists = usePlayerStore((s) => s.savedPlaylists)
  const createPlaylist = usePlayerStore((s) => s.createPlaylist)
  const deletePlaylist = usePlayerStore((s) => s.deletePlaylist)
  const renamePlaylist = usePlayerStore((s) => s.renamePlaylist)
  const removeSongFromPlaylist = usePlayerStore((s) => s.removeSongFromPlaylist)
  const playPlaylist = usePlayerStore((s) => s.playPlaylist)
  const addPlaylistToPlayNext = usePlayerStore((s) => s.addPlaylistToPlayNext)
  const searchHistory = usePlayerStore((s) => s.searchHistory)
  const clearSearchHistory = usePlayerStore((s) => s.clearSearchHistory)
  const removeSearchHistoryItem = usePlayerStore((s) => s.removeSearchHistoryItem)
  const removeSmartRecommend = usePlayerStore((s) => s.removeSmartRecommend)

  const [inputValue, setInputValue] = useState('')
  const [searchInputFocused, setSearchInputFocused] = useState(false)
  const [activeTab, setActiveTab] = useState<'search' | 'favorites' | 'history' | 'playlists'>('search')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const ocrInputRef = useRef<HTMLInputElement>(null)
  const [showOcrResult, setShowOcrResult] = useState(false)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (smartRecommend.length === 0 && (favorites.length > 0 || history.length > 0)) {
      loadSmartRecommend()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSearch = useCallback(() => {
    if (!inputValue.trim()) return
    setSearchKeyword(inputValue)
    search(inputValue)
  }, [inputValue, setSearchKeyword, search])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSearch()
    },
    [handleSearch]
  )

  const handlePlatformChange = useCallback((p: MusicPlatform) => {
    setPlatform(p)
    if (inputValue.trim()) {
      setSearchKeyword(inputValue)
      search(inputValue)
    }
  }, [inputValue, setPlatform, setSearchKeyword, search])

  const playOcrSong = useCallback((index: number) => {
    const song = ocrSongs[index]
    if (!song) return
    const { playlist, currentSongIndex } = usePlayerStore.getState()
    const existingIndex = playlist.findIndex((s) => s.id === song.id && s.platform === song.platform)
    if (existingIndex >= 0) {
      usePlayerStore.getState().playSong(existingIndex)
    } else {
      let newPlaylist: typeof playlist
      let adjustedIndex = currentSongIndex
      if (playlist.length >= 200) {
        const removeIndex = currentSongIndex === 0 ? 1 : 0
        newPlaylist = [...playlist.slice(0, removeIndex), ...playlist.slice(removeIndex + 1), song]
        adjustedIndex = currentSongIndex > removeIndex ? currentSongIndex - 1 : currentSongIndex
      } else {
        newPlaylist = [...playlist, song]
      }
      usePlayerStore.setState({ playlist: newPlaylist, currentSongIndex: adjustedIndex })
      usePlayerStore.getState().playSong(newPlaylist.length - 1)
    }
  }, [ocrSongs])

  const isFav = (songId: number, platform?: string) => favorites.some((s) => s.id === songId && (platform === undefined || s.platform === platform))
  const toggleSection = (key: string) => setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }))

  return (
    <div className={clsx('flex h-full flex-col', darkMode ? 'bg-[#16213e]' : 'bg-green-100')}>
      {/* 标题 */}
      <div className="flex items-center gap-3 px-5 py-4">
        <Music className="h-5 w-5 text-emerald-600" />
        <h2 className={clsx('text-lg font-semibold tracking-wide', darkMode ? 'text-zinc-200' : 'text-zinc-800')}>音瓶</h2>
      </div>

      {/* Tab 切换 */}
      <div className="flex px-4 gap-1 mb-2">
        {(['search', 'favorites', 'playlists', 'history'] as const).map((tab) => {
          const icons = { search: Search, favorites: Heart, playlists: ListMusic, history: Clock }
          const labels = { search: '搜索', favorites: '收藏', playlists: '歌单', history: '历史' }
          const counts = { search: 0, favorites: favorites.length, playlists: savedPlaylists.length, history: history.length }
          const Icon = icons[tab]
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
                activeTab === tab
                  ? 'bg-emerald-600 text-white'
                  : darkMode ? 'text-zinc-400 hover:bg-[#1e1e3a] hover:text-zinc-200' : 'text-zinc-500 hover:bg-green-100 hover:text-zinc-700'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {labels[tab]}
              {counts[tab] > 0 && (
                <span className={clsx(
                  'ml-0.5 rounded-full px-1.5 text-[10px] font-bold',
                  activeTab === tab ? 'bg-white/30 text-white' : (darkMode ? 'bg-[#3a2a1a] text-emerald-400' : 'bg-emerald-100 text-emerald-600')
                )}>
                  {counts[tab]}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* 搜索区 */}
      {activeTab === 'search' && (
        <div className="px-4 pb-3 animate-fade-in">
          {/* 平台切换 */}
          <div className="flex gap-1 mb-2">
            <button
              onClick={() => handlePlatformChange('netease')}
              className={clsx(
                'rounded-md px-2.5 py-1 text-xs font-medium transition-all',
                platform === 'netease'
                  ? 'bg-red-500 text-white'
                  : darkMode ? 'bg-[#27273a] text-zinc-400 hover:bg-[#3a3a5a]' : 'bg-white text-zinc-500 hover:bg-green-100'
              )}
            >
              网易云
            </button>
            <button
              onClick={() => handlePlatformChange('qq')}
              className={clsx(
                'rounded-md px-2.5 py-1 text-xs font-medium transition-all',
                platform === 'qq'
                  ? 'bg-green-500 text-white'
                  : darkMode ? 'bg-[#27273a] text-zinc-400 hover:bg-[#3a3a5a]' : 'bg-white text-zinc-500 hover:bg-green-100'
              )}
            >
              QQ音乐
            </button>
          </div>

          {/* 搜索框 */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={() => setSearchInputFocused(true)}
                onBlur={() => setTimeout(() => setSearchInputFocused(false), 150)}
                onKeyDown={handleKeyDown}
                placeholder={`在${platform === 'netease' ? '网易云音乐' : 'QQ音乐'}搜索...`}
                className={clsx(
                  'w-full rounded-lg py-2.5 pl-9 pr-3 text-sm placeholder-zinc-400 outline-none ring-1 focus:ring-green-400 focus:ring-2 transition-all',
                  darkMode ? 'bg-[#27273a] text-zinc-200 ring-[#3a3a5a]' : 'bg-white/70 text-zinc-800 ring-green-200'
                )}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white transition-all hover:bg-emerald-500 disabled:opacity-50"
            >
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </button>
          </div>

          {/* 搜索历史 */}
          {searchInputFocused && !inputValue.trim() && searchHistory.length > 0 && (
            <div className={clsx(
              'mt-2 rounded-lg p-3 animate-fade-in',
              darkMode ? 'bg-[#27273a]' : 'bg-white/70'
            )}>
              <div className="flex items-center gap-1.5 mb-2">
                <History className="h-3.5 w-3.5 text-zinc-400" />
                <p className={clsx('text-xs font-medium', darkMode ? 'text-zinc-400' : 'text-zinc-500')}>搜索历史</p>
              </div>
              <div className="space-y-0.5">
                {searchHistory.map((keyword) => (
                  <div
                    key={keyword}
                    className={clsx(
                      'group flex items-center justify-between rounded-md px-2 py-1.5 cursor-pointer transition-colors',
                      darkMode ? 'hover:bg-[#3a3a5a]' : 'hover:bg-green-100'
                    )}
                  >
                    <button
                      onMouseDown={(e) => { e.preventDefault(); setInputValue(keyword); setSearchKeyword(keyword); search(keyword) }}
                      className={clsx('flex-1 text-left text-sm truncate', darkMode ? 'text-zinc-300' : 'text-zinc-700')}
                    >
                      {keyword}
                    </button>
                    <button
                      onMouseDown={(e) => { e.preventDefault(); removeSearchHistoryItem(keyword) }}
                      className={clsx(
                        'flex-shrink-0 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity',
                        darkMode ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-400 hover:text-zinc-600'
                      )}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onMouseDown={(e) => { e.preventDefault(); clearSearchHistory() }}
                className={clsx(
                  'mt-2 w-full rounded-md py-1.5 text-xs font-medium transition-colors',
                  darkMode ? 'text-zinc-500 hover:text-zinc-300 hover:bg-[#3a3a5a]' : 'text-zinc-400 hover:text-zinc-600 hover:bg-green-100'
                )}
              >
                清空搜索历史
              </button>
            </div>
          )}

          {/* 工具按钮：一行排列 */}
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className={clsx(
                'flex-1 flex items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-medium ring-1 transition-all',
                darkMode ? 'bg-[#27273a] text-zinc-400 ring-[#3a3a5a] hover:bg-[#3a3a5a]' : 'bg-white/70 text-zinc-500 ring-green-200 hover:bg-green-100'
              )}
            >
              <FolderOpen className="h-3 w-3" />
              导入本地
            </button>
            <button
              onClick={() => ocrInputRef.current?.click()}
              disabled={ocrLoading}
              className={clsx(
                'flex-1 flex items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-medium ring-1 transition-all disabled:opacity-50',
                darkMode ? 'ring-[#4a3a2a] bg-[#3a2a1a] text-emerald-400 hover:bg-[#4a3a2a]' : 'ring-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
              )}
            >
              {ocrLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <ImageIcon className="h-3 w-3" />}
              {ocrLoading ? (ocrProgress || '识别中') : '图片识别歌单'}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            multiple
            onChange={(e) => {
              const files = e.target.files
              if (files && files.length > 0) {
                addLocalSongs(Array.from(files))
                e.target.value = ''
              }
            }}
            className="hidden"
          />
          <input
            ref={ocrInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                const reader = new FileReader()
                reader.onload = (ev) => {
                  const result = ev.target?.result as string
                  const base64 = result.split(',')[1]
                  if (base64) {
                    recognizeAndSearch(base64, file.type || 'image/jpeg')
                    setShowOcrResult(true)
                  }
                }
                reader.readAsDataURL(file)
                e.target.value = ''
              }
            }}
            className="hidden"
          />

          {/* OCR 识别结果 */}
          {ocrSongs.length > 0 && showOcrResult && (
            <div className={clsx('mt-2 rounded-xl border p-3 animate-slide-up', darkMode ? 'border-[#3a3a5a] bg-[#1e1e3a]/50' : 'border-emerald-200 bg-emerald-50/50')}>
              <div className="flex items-center justify-between mb-2">
                <p className={clsx('text-xs font-medium', darkMode ? 'text-emerald-400' : 'text-emerald-700')}>识别到 {ocrSongs.length} 首歌</p>
                <button onClick={() => { clearOcrSongs(); setShowOcrResult(false) }} className={clsx('hover:text-zinc-600', darkMode ? 'text-zinc-500' : 'text-zinc-400')}>
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1 scrollbar-thin">
                {ocrSongs.map((song, i) => (
                  <div
                    key={`${song.id}-${i}`}
                    onClick={() => playOcrSong(i)}
                    className={clsx('flex items-center gap-2 rounded-lg px-2 py-1 cursor-pointer', darkMode ? 'hover:bg-[#3a3a5a]' : 'hover:bg-emerald-100/50')}
                  >
                    <span className="text-[10px] text-zinc-400 w-4 text-center">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className={clsx('truncate text-xs font-medium', darkMode ? 'text-zinc-300' : 'text-zinc-700')}>{song.name}</p>
                      <p className="truncate text-[10px] text-zinc-400">{song.artists}</p>
                    </div>
                    <span className={clsx('text-[9px] px-1.5 py-0.5 rounded-full', song.platform === 'qq' ? (darkMode ? 'bg-[#1e3a2a] text-green-400' : 'bg-green-100 text-green-600') : (darkMode ? 'bg-[#3a1a2a] text-red-400' : 'bg-red-50 text-red-500'))}>
                      {song.platform === 'qq' ? 'QQ' : '网易云'}
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => { addOcrSongsToPlaylist(); setShowOcrResult(false) }}
                className="mt-2 w-full rounded-lg bg-emerald-600 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 transition-colors"
              >
                全部加入待播队列
              </button>
            </div>
          )}
        </div>
      )}

      {/* 歌曲列表 */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 scrollbar-thin">
        {activeTab === 'search' && (
          <>
            {/* 空状态 */}
            {!searchKeyword && !isSearching && smartRecommend.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
                <Music className="mb-3 h-10 w-10" />
                <p className="text-sm">搜索你喜欢的歌曲</p>
              </div>
            )}

            {/* 搜索中骨架屏 */}
            {isSearching && playlist.length === 0 && (
              <div className="animate-fade-in">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SongSkeleton key={i} />
                ))}
              </div>
            )}

            {/* 搜索结果 - 仅在搜索后显示 */}
            {searchKeyword && playlist.length > 0 && (
              <div className="animate-fade-in">
                <div className={clsx('px-4 pt-3 pb-1 flex items-center justify-between', darkMode ? 'text-zinc-400' : 'text-zinc-500')}>
                  <p className="text-xs font-medium">搜索结果 · {playlist.length}首</p>
                  <button
                    onClick={() => { usePlayerStore.setState({ searchKeyword: '', playlist: [] }); setInputValue('') }}
                    className="text-xs hover:text-emerald-500 transition-colors flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />清除搜索
                  </button>
                </div>
                {playlist.map((song, index) => (
                  <SongRow
                    key={`${song.platform}-${song.mid || song.id}`}
                    song={song}
                    index={index}
                    isActive={currentSongIndex === index}
                    onPlay={() => playSong(index)}
                    onFavorite={() => toggleFavorite(song)}
                    onAddNext={() => addToPlayNext(song)}
                    onAddToPlaylist={() => {}}
                    isFav={isFav(song.id, song.platform)}
                    platformTag
                    darkMode={darkMode}
                  />
                ))}
              </div>
            )}

            {/* 搜索无结果 */}
            {searchKeyword && !isSearching && playlist.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
                <Search className="mb-3 h-10 w-10" />
                <p className="text-sm">未找到相关歌曲</p>
                <p className="text-xs mt-1">试试其他关键词</p>
              </div>
            )}

            {/* 猜你喜好 */}
            <CollapsibleSection
              title="猜你喜好"
              icon={<Sparkles className="h-3.5 w-3.5 text-purple-500" />}
              count={smartRecommend.length}
              collapsed={!!collapsedSections['smart']}
              onToggle={() => toggleSection('smart')}
              rightAction={
                favorites.length > 0 || history.length > 0 ? (
                  <button
                    onClick={() => { usePlayerStore.setState({ smartRecommend: [] }); loadSmartRecommend() }}
                    disabled={smartRecommendLoading}
                    className="flex items-center gap-1 text-xs text-zinc-400 hover:text-purple-500 disabled:opacity-50"
                  >
                    <RefreshCw className={clsx('h-3 w-3', smartRecommendLoading && 'animate-spin')} />
                    换一批
                  </button>
                ) : undefined
              }
            >
              {favorites.length === 0 && history.length === 0 ? (
                <div className="flex items-center justify-center py-4 text-zinc-400">
                  <span className="text-xs">收藏或播放歌曲后即可推荐</span>
                </div>
              ) : smartRecommendLoading && smartRecommend.length === 0 ? (
                <div className="flex items-center justify-center py-6 text-zinc-400">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-xs">正在发现新音乐...</span>
                </div>
              ) : smartRecommend.length === 0 ? (
                <div className="flex items-center justify-center py-4 text-zinc-400">
                  <span className="text-xs">暂无推荐，点击换一批试试</span>
                </div>
              ) : (
                smartRecommend.map((song, index) => (
                  <SongRow
                    key={`sr-${song.platform}-${song.mid || song.id}`}
                    song={song}
                    index={index}
                    onPlay={() => playSmartRecommend(index)}
                    onFavorite={() => toggleFavorite(song)}
                    onAddNext={() => addToPlayNext(song)}
                    onAddToPlaylist={() => {}}
                    onDelete={() => removeSmartRecommend(index)}
                    isFav={isFav(song.id, song.platform)}
                    compact
                    darkMode={darkMode}
                  />
                ))
              )}
            </CollapsibleSection>

            {/* 漫游 */}
            <CollapsibleSection
                title="漫游"
                icon={<Compass className={clsx('h-3.5 w-3.5', isRoaming ? 'text-emerald-500' : 'text-blue-500')} />}
                count={isRoaming ? roamSongs.length : undefined}
                collapsed={!!collapsedSections['roam']}
                onToggle={() => toggleSection('roam')}
                rightAction={
                  <div className="flex items-center gap-2">
                    {isRoaming && (
                      <button
                        onClick={() => { usePlayerStore.setState({ roamSongs: [] }); loadRoamSongs() }}
                        disabled={roamLoading}
                        className="flex items-center gap-1 text-xs text-zinc-400 hover:text-blue-500 disabled:opacity-50"
                      >
                        <RefreshCw className={clsx('h-3 w-3', roamLoading && 'animate-spin')} />
                        换一批
                      </button>
                    )}
                    <button
                      onClick={toggleRoaming}
                      disabled={favorites.length === 0 && history.length === 0}
                      className={clsx(
                        'text-xs px-2 py-0.5 rounded-full font-medium transition-all disabled:opacity-40',
                        isRoaming
                          ? (darkMode ? 'bg-[#3a2a1a] text-emerald-400 hover:bg-[#4a3a2a]' : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200')
                          : (darkMode ? 'bg-[#1a2a3a] text-blue-400 hover:bg-[#2a3a4a]' : 'bg-blue-50 text-blue-600 hover:bg-blue-100')
                      )}
                    >
                      {isRoaming ? '停止' : '开始'}
                    </button>
                  </div>
                }
              >
                {favorites.length === 0 && history.length === 0 ? (
                  <div className="flex items-center justify-center py-4 text-zinc-400">
                    <span className="text-xs">收藏或播放歌曲后即可漫游</span>
                  </div>
                ) : roamLoading && roamSongs.length === 0 ? (
                  <div className="flex items-center justify-center py-6 text-zinc-400">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-xs">正在发现新音乐...</span>
                  </div>
                ) : roamSongs.length === 0 ? (
                  <div className="flex items-center justify-center py-4 text-zinc-400">
                    <span className="text-xs">点击"开始"探索新音乐</span>
                  </div>
                ) : (
                  roamSongs.map((song, index) => (
                    <SongRow
                      key={`roam-${song.platform}-${song.mid || song.id}`}
                      song={song}
                      index={index}
                      isActive={isRoaming && index === _roamPlayIndex}
                      onPlay={() => playRoamSong(index)}
                      onFavorite={() => toggleFavorite(song)}
                      onAddNext={() => addToPlayNext(song)}
                      onAddToPlaylist={() => {}}
                      isFav={isFav(song.id, song.platform)}
                      onDelete={() => removeRoamSong(index)}
                      compact
                      darkMode={darkMode}
                    />
                  ))
                )}
              </CollapsibleSection>
          </>
        )}

        {/* 收藏 Tab */}
        {activeTab === 'favorites' && (
          <div className="animate-fade-in">
            {favorites.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
                <Heart className="mb-3 h-10 w-10" />
                <p className="text-sm">还没有收藏的歌曲</p>
                <p className="text-xs mt-1">搜索歌曲后点击 ♡ 收藏</p>
              </div>
            ) : (
              favorites.map((song, index) => (
                <SongRow
                  key={`fav-${song.platform}-${song.mid || song.id}`}
                  song={song}
                  index={index}
                  onPlay={() => playFavorite(index)}
                  onFavorite={() => toggleFavorite(song)}
                  onAddNext={() => addToPlayNext(song)}
                  onAddToPlaylist={() => {}}
                  isFav
                  platformTag
                  darkMode={darkMode}
                />
              ))
            )}
          </div>
        )}

        {/* 历史 Tab */}
        {activeTab === 'history' && (
          <div className="animate-fade-in">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
                <Clock className="mb-3 h-10 w-10" />
                <p className="text-sm">还没有播放记录</p>
                <p className="text-xs mt-1">播放歌曲后会自动记录</p>
              </div>
            ) : (
              <>
                <div className="px-4 pt-2 pb-1 flex items-center justify-between">
                  <p className="text-xs text-zinc-400">播放历史</p>
                  <button
                    onClick={clearHistory}
                    className="flex items-center gap-1 text-xs text-zinc-400 hover:text-red-500"
                  >
                    <Trash2 className="h-3 w-3" />
                    清空
                  </button>
                </div>
                {history.map((song, index) => (
                  <SongRow
                    key={`hist-${song.platform}-${song.mid || song.id}-${index}`}
                    song={song}
                    index={index}
                    onPlay={() => playHistory(index)}
                    onFavorite={() => toggleFavorite(song)}
                    onAddNext={() => addToPlayNext(song)}
                    onAddToPlaylist={() => {}}
                    isFav={isFav(song.id, song.platform)}
                    platformTag
                    darkMode={darkMode}
                  />
                ))}
              </>
            )}
          </div>
        )}

        {/* 歌单 Tab */}
        {activeTab === 'playlists' && (
          <PlaylistTabContent
            savedPlaylists={savedPlaylists}
            createPlaylist={createPlaylist}
            deletePlaylist={deletePlaylist}
            renamePlaylist={renamePlaylist}
            removeSongFromPlaylist={removeSongFromPlaylist}
            playPlaylist={playPlaylist}
            addPlaylistToPlayNext={addPlaylistToPlayNext}
            addToPlayNext={addToPlayNext}
            toggleFavorite={toggleFavorite}
            isFav={isFav}
            darkMode={darkMode}
          />
        )}
      </div>
    </div>
  )
}
