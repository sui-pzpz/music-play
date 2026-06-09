import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePlayerStore } from '@/store/playerStore'
import { showToast } from '@/store/toastStore'
import { clsx } from 'clsx'
import {
  Play,
  Heart,
  Plus,
  MoreHorizontal,
  Edit3,
  Trash2,
  Search,
  Check,
  Clock,
  Music,
  ChevronDown,
  X
} from 'lucide-react'
import { Decorations } from '@/components/Decorations'
import type { Song } from '@/types'

function SongRow({ 
  song, 
  index, 
  onPlay, 
  onFavorite, 
  onAddToQueue, 
  onRemove,
  selected,
  onSelect
}: { 
  song: Song 
  index: number 
  onPlay: () => void 
  onFavorite: () => void 
  onAddToQueue: () => void 
  onRemove: () => void
  selected?: boolean
  onSelect?: () => void
}) {
  const darkMode = usePlayerStore((s) => s.darkMode)
  const isFavorite = usePlayerStore((s) => s.isFavorite(song.id, song.platform))

  return (
    <div
      onClick={onSelect}
      className={clsx(
        'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
        'hover:shadow-md cursor-pointer',
        selected && (darkMode ? 'bg-green-900/20' : 'bg-green-50'),
        darkMode ? 'hover:bg-[#2a2a4a]/50' : 'hover:bg-white/60'
      )}
    >
      {onSelect && (
        <div className={clsx(
          'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
          selected 
            ? darkMode ? 'bg-green-500 border-green-500' : 'bg-green-500 border-green-500'
            : darkMode ? 'border-zinc-600' : 'border-zinc-300'
        )}>
          {selected && <Check className="h-3 w-3 text-white" />}
        </div>
      )}
      <span className={clsx('w-6 text-sm text-center', darkMode ? 'text-zinc-500' : 'text-zinc-400')}>
        {index + 1}
      </span>
      {song.picUrl ? (
        <img
          src={song.picUrl}
          alt=""
          className="w-10 h-10 rounded-lg object-cover"
        />
      ) : (
        <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center', darkMode ? 'bg-zinc-700' : 'bg-zinc-200')}>
          <Music className="h-5 w-5 text-zinc-400" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className={clsx('text-sm font-medium truncate', darkMode ? 'text-white' : 'text-zinc-800')}>
          {song.name}
        </p>
        <p className={clsx('text-xs truncate', darkMode ? 'text-zinc-500' : 'text-zinc-500')}>
          {song.artists}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={(e) => { e.stopPropagation(); onFavorite() }}
          className={clsx(
            'p-1.5 rounded-full transition-all',
            isFavorite ? 'text-red-500' : darkMode ? 'text-zinc-500 hover:text-red-400' : 'text-zinc-400 hover:text-red-500'
          )}
        >
          <Heart className="h-4 w-4" fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onAddToQueue() }}
          className={clsx(
            'p-1.5 rounded-full transition-all',
            darkMode ? 'text-zinc-500 hover:text-green-400' : 'text-zinc-400 hover:text-green-600'
          )}
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onPlay() }}
          className={clsx(
            'p-1.5 rounded-full transition-all',
            darkMode ? 'text-zinc-500 hover:text-green-400' : 'text-zinc-400 hover:text-green-600'
          )}
        >
          <Play className="h-4 w-4" />
        </button>
        {onRemove && (
          <button
            onClick={(e) => { e.stopPropagation(); onRemove() }}
            className={clsx(
              'p-1.5 rounded-full transition-all',
              darkMode ? 'text-zinc-500 hover:text-red-400' : 'text-zinc-400 hover:text-red-500'
            )}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

export default function PlaylistDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const darkMode = usePlayerStore((s) => s.darkMode)
  const savedPlaylists = usePlayerStore((s) => s.savedPlaylists)
  const addSongToPlaylist = usePlayerStore((s) => s.addSongToPlaylist)
  const removeSongFromPlaylist = usePlayerStore((s) => s.removeSongFromPlaylist)
  const playPlaylist = usePlayerStore((s) => s.playPlaylist)
  const addPlaylistToPlayNext = usePlayerStore((s) => s.addPlaylistToPlayNext)
  const deletePlaylist = usePlayerStore((s) => s.deletePlaylist)
  const renamePlaylist = usePlayerStore((s) => s.renamePlaylist)
  const toggleFavorite = usePlayerStore((s) => s.toggleFavorite)
  const addToPlayNext = usePlayerStore((s) => s.addToPlayNext)
  const search = usePlayerStore((s) => s.search)
  const playlist = usePlayerStore((s) => s.playlist)
  const playSong = usePlayerStore((s) => s.playSong)

  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchResults, setSearchResults] = useState<Song[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedSongs, setSelectedSongs] = useState<Set<string>>(new Set())
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [showAddFromSearch, setShowAddFromSearch] = useState(false)

  const currentPlaylist = savedPlaylists.find((p) => p.id === id)

  useEffect(() => {
    if (!currentPlaylist) {
      navigate('/')
    }
  }, [id, currentPlaylist, navigate])

  useEffect(() => {
    if (editName && isEditing) {
      const input = document.getElementById('edit-name-input') as HTMLInputElement
      input?.focus()
    }
  }, [isEditing, editName])

  const handleSearch = async () => {
    if (!searchKeyword.trim()) return
    setIsSearching(true)
    await search(searchKeyword)
    setSearchResults(playlist)
    setIsSearching(false)
  }

  const handlePlay = (index: number) => {
    const song = currentPlaylist?.songs[index]
    if (!song) return
    
    const existingIndex = playlist.findIndex((s) => s.id === song.id)
    if (existingIndex >= 0) {
      playSong(existingIndex)
    } else {
      const { addSongToPlaylist, savedPlaylists } = usePlayerStore.getState()
      const newPlaylist = [...playlist, song]
      playSong(newPlaylist.length - 1)
    }
  }

  const handleSelectAll = () => {
    if (selectedSongs.size === (currentPlaylist?.songs.length || 0)) {
      setSelectedSongs(new Set())
    } else {
      const allIds = new Set(currentPlaylist?.songs.map((s) => `${s.id}:${s.platform}`))
      setSelectedSongs(allIds)
    }
  }

  const handleSelectSong = (song: Song) => {
    const key = `${song.id}:${song.platform}`
    const newSelected = new Set(selectedSongs)
    if (newSelected.has(key)) {
      newSelected.delete(key)
    } else {
      newSelected.add(key)
    }
    setSelectedSongs(newSelected)
  }

  const handleDeleteSelected = () => {
    selectedSongs.forEach((key) => {
      const [id, platform] = key.split(':')
      removeSongFromPlaylist(currentPlaylist!.id, Number(id), platform)
    })
    setSelectedSongs(new Set())
    showToast(`已删除 ${selectedSongs.size} 首歌曲`, 'info')
  }

  const handleAddSelectedToQueue = () => {
    selectedSongs.forEach((key) => {
      const [songId, platform] = key.split(':')
      const song = currentPlaylist?.songs.find((s) => s.id === Number(songId) && s.platform === platform)
      if (song) {
        addToPlayNext(song)
      }
    })
    setSelectedSongs(new Set())
    showToast(`已添加 ${selectedSongs.size} 首歌曲到待播队列`, 'success')
  }

  const handleSaveEdit = () => {
    if (editName.trim()) {
      renamePlaylist(currentPlaylist!.id, editName.trim())
    }
    setIsEditing(false)
    setEditName('')
  }

  const handleDeletePlaylist = () => {
    if (confirm('确定删除这个歌单吗？')) {
      deletePlaylist(currentPlaylist!.id)
      navigate('/')
    }
  }

  if (!currentPlaylist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className={clsx(darkMode ? 'text-zinc-400' : 'text-zinc-500')}>歌单不存在</p>
      </div>
    )
  }

  const sortedSongs = [...currentPlaylist.songs].sort((a, b) => 0)

  return (
    <div className="min-h-screen relative">
      <Decorations />
      <div className="relative z-10 max-w-md mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={clsx(
              'w-16 h-16 rounded-2xl flex items-center justify-center',
              darkMode ? 'bg-green-900/30' : 'bg-green-100'
            )}>
              {currentPlaylist.songs.length > 0 && currentPlaylist.songs[0].picUrl ? (
                <img
                  src={currentPlaylist.songs[0].picUrl}
                  alt=""
                  className="w-full h-full rounded-2xl object-cover"
                />
              ) : (
                <Music className={clsx('h-8 w-8', darkMode ? 'text-green-400' : 'text-green-600')} />
              )}
            </div>
            <div>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    id="edit-name-input"
                    type="text"
                    value={editName || currentPlaylist.name}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit()
                      if (e.key === 'Escape') setIsEditing(false)
                    }}
                    className={clsx(
                      'px-2 py-1 rounded-lg text-sm font-semibold',
                      darkMode ? 'bg-[#2a2a4a] text-white' : 'bg-white text-zinc-800'
                    )}
                  />
                  <button onClick={handleSaveEdit} className="text-green-500">
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <h1 className={clsx('text-lg font-semibold', darkMode ? 'text-white' : 'text-zinc-800')}>
                  {currentPlaylist.name}
                </h1>
              )}
              <p className={clsx('text-sm', darkMode ? 'text-zinc-400' : 'text-zinc-500')}>
                {currentPlaylist.songs.length} 首歌曲 · 创建于{' '}
                {new Date(currentPlaylist.createdAt).toLocaleDateString('zh-CN')}
              </p>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className={clsx(
                'p-2 rounded-full transition-all',
                darkMode ? 'hover:bg-[#2a2a4a] text-zinc-400' : 'hover:bg-white/60 text-zinc-500'
              )}
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
            {showMoreMenu && (
              <div className={clsx(
                'absolute top-full right-0 mt-1 w-32 rounded-xl overflow-hidden z-20',
                darkMode ? 'bg-[#27273a]' : 'bg-white',
                'border border-green-200/30 shadow-xl'
              )}>
                <button
                  onClick={() => {
                    setIsEditing(true)
                    setShowMoreMenu(false)
                  }}
                  className={clsx(
                    'w-full px-4 py-2 text-left text-sm transition-colors',
                    darkMode ? 'hover:bg-[#3a3a4a] text-zinc-300' : 'hover:bg-green-50 text-zinc-700'
                  )}
                >
                  <Edit3 className="inline h-4 w-4 mr-2" />
                  重命名
                </button>
                <button
                  onClick={() => {
                    handleDeletePlaylist()
                    setShowMoreMenu(false)
                  }}
                  className={clsx(
                    'w-full px-4 py-2 text-left text-sm text-red-500 transition-colors',
                    darkMode ? 'hover:bg-red-500/10' : 'hover:bg-red-50'
                  )}
                >
                  <Trash2 className="inline h-4 w-4 mr-2" />
                  删除歌单
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card p-4 mb-4 animate-scale-in">
          <div className="flex items-center gap-2">
            <button
              onClick={() => playPlaylist(currentPlaylist.id)}
              className="flex-1 flex items-center justify-center gap-2 btn-primary"
            >
              <Play className="h-4 w-4" />
              <span>播放全部</span>
            </button>
            <button
              onClick={() => addPlaylistToPlayNext(currentPlaylist.id)}
              className="flex-1 flex items-center justify-center gap-2 btn-secondary"
            >
              <Plus className="h-4 w-4" />
              <span>添加到待播</span>
            </button>
            <button
              onClick={() => setShowAddFromSearch(!showAddFromSearch)}
              className={clsx(
                'flex items-center justify-center gap-2 px-3 py-2 rounded-full',
                darkMode ? 'bg-[#2a2a4a] text-zinc-300' : 'bg-white/60 text-zinc-600'
              )}
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>

        {showAddFromSearch && (
          <div className="glass-card p-4 mb-4 animate-scale-in">
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="搜索歌曲..."
                className="flex-1 input-field"
              />
              <button onClick={handleSearch} className="btn-primary">
                <Search className="h-4 w-4" />
              </button>
            </div>
            {isSearching ? (
              <p className={clsx('text-center text-sm', darkMode ? 'text-zinc-400' : 'text-zinc-500')}>
                搜索中...
              </p>
            ) : searchResults.length > 0 ? (
              <div className="max-h-48 overflow-auto scrollbar-thin space-y-2">
                {searchResults.map((song, index) => (
                  <div
                    key={`${song.id}-${song.platform}`}
                    className={clsx(
                      'flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all',
                      darkMode ? 'hover:bg-[#2a2a4a]/50' : 'hover:bg-white/60'
                    )}
                    onClick={() => {
                      addSongToPlaylist(currentPlaylist.id, song)
                      setSearchKeyword('')
                      setSearchResults([])
                      showToast(`已添加「${song.name}」到歌单`, 'success')
                    }}
                  >
                    <span className={clsx('w-5 text-xs', darkMode ? 'text-zinc-500' : 'text-zinc-400')}>
                      {index + 1}
                    </span>
                    {song.picUrl ? (
                      <img src={song.picUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
                    ) : (
                      <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', darkMode ? 'bg-zinc-700' : 'bg-zinc-200')}>
                        <Music className="h-4 w-4 text-zinc-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={clsx('text-sm truncate', darkMode ? 'text-white' : 'text-zinc-800')}>
                        {song.name}
                      </p>
                      <p className={clsx('text-xs truncate', darkMode ? 'text-zinc-500' : 'text-zinc-500')}>
                        {song.artists}
                      </p>
                    </div>
                    <Plus className={clsx('h-4 w-4', darkMode ? 'text-green-400' : 'text-green-600')} />
                  </div>
                ))}
              </div>
            ) : (
              <p className={clsx('text-center text-sm', darkMode ? 'text-zinc-400' : 'text-zinc-500')}>
                输入关键词搜索歌曲添加到歌单
              </p>
            )}
          </div>
        )}

        {selectedSongs.size > 0 && (
          <div className={clsx(
            'glass-card p-3 mb-4 flex items-center justify-between animate-slide-up',
            darkMode ? 'bg-green-900/20' : 'bg-green-50'
          )}>
            <span className={clsx('text-sm', darkMode ? 'text-green-400' : 'text-green-600')}>
              已选 {selectedSongs.size} 首
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteSelected}
                className="px-3 py-1.5 rounded-full text-sm text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors"
              >
                删除选中
              </button>
              <button
                onClick={handleAddSelectedToQueue}
                className="px-3 py-1.5 rounded-full text-sm btn-primary"
              >
                加入待播
              </button>
            </div>
          </div>
        )}

        <div className="glass-card overflow-hidden animate-scale-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-green-200/20">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSelectAll}
                className={clsx(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                  selectedSongs.size === sortedSongs.length
                    ? darkMode ? 'bg-green-500 border-green-500' : 'bg-green-500 border-green-500'
                    : darkMode ? 'border-zinc-600' : 'border-zinc-300'
                )}
              >
                {selectedSongs.size === sortedSongs.length && <Check className="h-3 w-3 text-white" />}
              </button>
              <span className={clsx('text-sm', darkMode ? 'text-zinc-400' : 'text-zinc-500')}>
                歌曲列表
              </span>
            </div>
            <select className={clsx(
              'text-sm rounded-full px-3 py-1',
              darkMode ? 'bg-[#2a2a4a] text-zinc-300' : 'bg-white/60 text-zinc-600'
            )}>
              <option value="added">添加时间</option>
              <option value="name">按歌名</option>
              <option value="artist">按歌手</option>
            </select>
          </div>
          <div className="max-h-[50vh] overflow-auto scrollbar-thin">
            {sortedSongs.length === 0 ? (
              <div className="py-12 text-center">
                <Music className={clsx('h-12 w-12 mx-auto mb-3', darkMode ? 'text-zinc-600' : 'text-zinc-300')} />
                <p className={clsx('text-sm', darkMode ? 'text-zinc-500' : 'text-zinc-400')}>
                  歌单暂无歌曲
                </p>
                <button
                  onClick={() => setShowAddFromSearch(true)}
                  className="mt-3 text-green-600 text-sm hover:underline"
                >
                  添加歌曲
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                {sortedSongs.map((song, index) => (
                  <SongRow
                    key={`${song.id}-${song.platform}`}
                    song={song}
                    index={index}
                    onPlay={() => handlePlay(index)}
                    onFavorite={() => toggleFavorite(song)}
                    onAddToQueue={() => addToPlayNext(song)}
                    onRemove={() => removeSongFromPlaylist(currentPlaylist.id, song.id, song.platform)}
                    selected={selectedSongs.has(`${song.id}:${song.platform}`)}
                    onSelect={() => handleSelectSong(song)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
