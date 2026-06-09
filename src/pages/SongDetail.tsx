import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePlayerStore } from '@/store/playerStore'
import { showToast } from '@/store/toastStore'
import { clsx } from 'clsx'
import {
  Play,
  Heart,
  Plus,
  Share2,
  Music,
  Clock,
  Disc,
  Album,
  ExternalLink
} from 'lucide-react'
import { Decorations } from '@/components/Decorations'
import type { Song } from '@/types'

function RelatedSongRow({ song, onPlay, onAdd }: { song: Song; onPlay: () => void; onAdd: () => void }) {
  const darkMode = usePlayerStore((s) => s.darkMode)
  const isFavorite = usePlayerStore((s) => s.isFavorite(song.id, song.platform))
  const toggleFavorite = usePlayerStore((s) => s.toggleFavorite)

  return (
    <div className={clsx(
      'flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer',
      darkMode ? 'hover:bg-[#2a2a4a]/50' : 'hover:bg-white/60'
    )}
    onClick={onPlay}
    >
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
          onClick={(e) => { e.stopPropagation(); toggleFavorite(song) }}
          className={clsx(
            'p-1.5 rounded-full transition-all',
            isFavorite ? 'text-red-500' : darkMode ? 'text-zinc-500 hover:text-red-400' : 'text-zinc-400 hover:text-red-500'
          )}
        >
          <Heart className="h-4 w-4" fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onAdd() }}
          className={clsx(
            'p-1.5 rounded-full transition-all',
            darkMode ? 'text-zinc-500 hover:text-green-400' : 'text-zinc-400 hover:text-green-600'
          )}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default function SongDetail() {
  const { platform, id } = useParams<{ platform: string; id: string }>()
  const navigate = useNavigate()
  const darkMode = usePlayerStore((s) => s.darkMode)
  const playlist = usePlayerStore((s) => s.playlist)
  const playSong = usePlayerStore((s) => s.playSong)
  const toggleFavorite = usePlayerStore((s) => s.toggleFavorite)
  const addToPlayNext = usePlayerStore((s) => s.addToPlayNext)
  const isFavorite = usePlayerStore((s) => s.isFavorite)
  const addSongToPlaylist = usePlayerStore((s) => s.addSongToPlaylist)
  const savedPlaylists = usePlayerStore((s) => s.savedPlaylists)

  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [relatedSongs, setRelatedSongs] = useState<Song[]>([])
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false)

  useEffect(() => {
    const song = playlist.find((s) => s.id === Number(id) && s.platform === platform)
    if (song) {
      setCurrentSong(song)
      // Find related songs by same artist
      const artist = song.artists.split(/[/、,，]/)[0].trim()
      const related = playlist.filter(
        (s) => s.artists.includes(artist) && s.id !== song.id
      ).slice(0, 6)
      setRelatedSongs(related)
    } else {
      navigate('/')
    }
  }, [id, platform, playlist, navigate])

  const handlePlay = () => {
    if (!currentSong) return
    const index = playlist.findIndex((s) => s.id === currentSong.id)
    if (index >= 0) {
      playSong(index)
    }
  }

  const handleShare = () => {
    if (!currentSong) return
    const shareUrl = `${window.location.origin}/music-play/song/${currentSong.platform}/${currentSong.id}`
    navigator.clipboard.writeText(shareUrl)
    showToast('链接已复制到剪贴板', 'success')
  }

  const handleAddToPlaylist = (playlistId: string) => {
    if (!currentSong) return
    addSongToPlaylist(playlistId, currentSong)
    setShowAddToPlaylist(false)
    showToast(`已添加到歌单`, 'success')
  }

  if (!currentSong) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className={clsx(darkMode ? 'text-zinc-400' : 'text-zinc-500')}>歌曲不存在</p>
      </div>
    )
  }

  const formatDuration = (ms: number) => {
    if (!ms) return '--:--'
    const seconds = Math.floor(ms / 1000)
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen relative">
      <Decorations />
      <div className="relative z-10 max-w-md mx-auto px-4 py-6 space-y-6">
        <div className="glass-card p-6 text-center animate-scale-in">
          <div className="relative mb-6">
            {currentSong.picUrl ? (
              <div className="relative inline-block">
                <img
                  src={currentSong.picUrl}
                  alt={currentSong.name}
                  className="w-40 h-40 rounded-2xl object-cover shadow-xl animate-float"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            ) : (
              <div className={clsx(
                'w-40 h-40 rounded-2xl mx-auto flex items-center justify-center shadow-xl',
                darkMode ? 'bg-zinc-700' : 'bg-zinc-200'
              )}>
                <Music className={clsx('h-16 w-16', darkMode ? 'text-zinc-500' : 'text-zinc-300')} />
              </div>
            )}
          </div>
          <h1 className={clsx('text-xl font-bold mb-2', darkMode ? 'text-white' : 'text-zinc-800')}>
            {currentSong.name}
          </h1>
          <p className={clsx('text-sm mb-1', darkMode ? 'text-green-400' : 'text-green-600')}>
            {currentSong.artists}
          </p>
          <p className={clsx('text-xs', darkMode ? 'text-zinc-500' : 'text-zinc-400')}>
            {currentSong.album} · {currentSong.platform === 'netease' ? '网易云音乐' : 'QQ音乐'} · {formatDuration(currentSong.duration || 0)}
          </p>
        </div>

        <div className="glass-card p-4 animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handlePlay}
              className="flex-1 flex items-center justify-center gap-2 btn-primary"
            >
              <Play className="h-5 w-5" />
              <span>播放</span>
            </button>
            <button
              onClick={() => toggleFavorite(currentSong)}
              className={clsx(
                'p-3 rounded-full transition-all',
                isFavorite(currentSong.id, currentSong.platform)
                  ? 'text-red-500 scale-110'
                  : darkMode ? 'text-zinc-400 hover:text-red-400' : 'text-zinc-400 hover:text-red-500'
              )}
            >
              <Heart className="h-6 w-6" fill={isFavorite(currentSong.id, currentSong.platform) ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={() => addToPlayNext(currentSong)}
              className={clsx(
                'p-3 rounded-full transition-all',
                darkMode ? 'text-zinc-400 hover:text-green-400' : 'text-zinc-400 hover:text-green-600'
              )}
            >
              <Plus className="h-6 w-6" />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowAddToPlaylist(!showAddToPlaylist)}
                className={clsx(
                  'p-3 rounded-full transition-all',
                  darkMode ? 'text-zinc-400 hover:text-green-400' : 'text-zinc-400 hover:text-green-600'
                )}
              >
                <Album className="h-6 w-6" />
              </button>
              {showAddToPlaylist && (
                <div className={clsx(
                  'absolute top-full right-0 mt-1 w-40 rounded-xl overflow-hidden z-20',
                  darkMode ? 'bg-[#27273a]' : 'bg-white',
                  'border border-green-200/30 shadow-xl'
                )}>
                  {savedPlaylists.map((pl) => (
                    <button
                      key={pl.id}
                      onClick={() => handleAddToPlaylist(pl.id)}
                      className={clsx(
                        'w-full px-4 py-2 text-left text-sm transition-colors',
                        darkMode ? 'hover:bg-[#3a3a4a] text-zinc-300' : 'hover:bg-green-50 text-zinc-700'
                      )}
                    >
                      {pl.name}
                    </button>
                  ))}
                  {savedPlaylists.length === 0 && (
                    <p className={clsx('px-4 py-2 text-sm text-center', darkMode ? 'text-zinc-500' : 'text-zinc-400')}>
                      暂无歌单
                    </p>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={handleShare}
              className={clsx(
                'p-3 rounded-full transition-all',
                darkMode ? 'text-zinc-400 hover:text-green-400' : 'text-zinc-400 hover:text-green-600'
              )}
            >
              <Share2 className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="glass-card p-4 animate-scale-in" style={{ animationDelay: '0.2s' }}>
          <div className={clsx('flex items-center gap-2 mb-4', darkMode ? 'text-green-400' : 'text-green-600')}>
            <Disc className="h-5 w-5" />
            <h2 className="font-semibold">歌曲信息</h2>
          </div>
          <div className="space-y-3">
            <div className={clsx('flex items-center justify-between py-2', darkMode ? 'border-b border-[#2a2a4a]' : 'border-b border-green-200/50')}>
              <span className={clsx('text-sm', darkMode ? 'text-zinc-500' : 'text-zinc-500')}>歌曲名</span>
              <span className={clsx('text-sm', darkMode ? 'text-white' : 'text-zinc-800')}>{currentSong.name}</span>
            </div>
            <div className={clsx('flex items-center justify-between py-2', darkMode ? 'border-b border-[#2a2a4a]' : 'border-b border-green-200/50')}>
              <span className={clsx('text-sm', darkMode ? 'text-zinc-500' : 'text-zinc-500')}>歌手</span>
              <span className={clsx('text-sm', darkMode ? 'text-white' : 'text-zinc-800')}>{currentSong.artists}</span>
            </div>
            <div className={clsx('flex items-center justify-between py-2', darkMode ? 'border-b border-[#2a2a4a]' : 'border-b border-green-200/50')}>
              <span className={clsx('text-sm', darkMode ? 'text-zinc-500' : 'text-zinc-500')}>专辑</span>
              <span className={clsx('text-sm', darkMode ? 'text-white' : 'text-zinc-800')}>{currentSong.album}</span>
            </div>
            <div className={clsx('flex items-center justify-between py-2')}>
              <span className={clsx('text-sm', darkMode ? 'text-zinc-500' : 'text-zinc-500')}>时长</span>
              <span className={clsx('text-sm', darkMode ? 'text-white' : 'text-zinc-800')}>{formatDuration(currentSong.duration || 0)}</span>
            </div>
          </div>
        </div>

        {relatedSongs.length > 0 && (
          <div className="glass-card overflow-hidden animate-scale-in" style={{ animationDelay: '0.3s' }}>
            <div className={clsx('flex items-center gap-2 px-4 py-3 border-b border-green-200/20', darkMode ? 'text-green-400' : 'text-green-600')}>
              <Music className="h-5 w-5" />
              <h2 className="font-semibold">相关推荐</h2>
            </div>
            <div className="space-y-1">
              {relatedSongs.map((song) => (
                <RelatedSongRow
                  key={`${song.id}-${song.platform}`}
                  song={song}
                  onPlay={() => {
                    const index = playlist.findIndex((s) => s.id === song.id)
                    if (index >= 0) playSong(index)
                  }}
                  onAdd={() => addToPlayNext(song)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
