import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Heart, Play, Pause, SkipBack, SkipForward, Volume2, Share2, MoreHorizontal } from 'lucide-react'
import { usePlayerStore } from '@/store/playerStore'
import { clsx } from 'clsx'
import { useState, useEffect } from 'react'

export default function SongDetail() {
  const { platform, id } = useParams()
  const navigate = useNavigate()
  const darkMode = usePlayerStore((s) => s.darkMode)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const togglePlay = usePlayerStore((s) => s.togglePlay)
  const nextSong = usePlayerStore((s) => s.nextSong)
  const prevSong = usePlayerStore((s) => s.prevSong)
  const toggleFavorite = usePlayerStore((s) => s.toggleFavorite)
  const favorites = usePlayerStore((s) => s.favorites)
  const currentSong = usePlayerStore((s) => s.currentSong)
  const currentTime = usePlayerStore((s) => s.currentTime)
  const duration = usePlayerStore((s) => s.duration)
  const volume = usePlayerStore((s) => s.volume)
  const setVolume = usePlayerStore((s) => s.setVolume)

  const [showVolumeSlider, setShowVolumeSlider] = useState(false)

  const song = currentSong || {
    id: parseInt(id || '1'),
    name: '晴天',
    artists: '周杰伦',
    album: '叶惠美',
    picUrl: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=music%20album%20cover%20sunny%20day%20blue%20sky%20clouds&image_size=square',
    platform: (platform || 'netease') as 'netease' | 'qq',
    duration: 269000,
  }

  const isFav = favorites.some(f => f.id === song.id && f.platform === song.platform)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60000)
    const secs = Math.floor((seconds % 60000) / 1000)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.volume-container')) {
        setShowVolumeSlider(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <div className="px-4 pb-4">
      <button
        onClick={() => navigate(-1)}
        className={clsx(
          'flex items-center gap-2 mb-4 text-sm transition-colors',
          darkMode ? 'text-zinc-400 hover:text-emerald-400' : 'text-emerald-600 hover:text-emerald-700'
        )}
      >
        <ArrowLeft className="h-4 w-4" />
        返回
      </button>

      <div className="flex flex-col items-center mb-6">
        <div className={clsx(
          'w-64 h-64 rounded-2xl overflow-hidden mb-4 shadow-2xl',
          darkMode ? 'shadow-zinc-800/50' : 'shadow-emerald-200/50'
        )}>
          <img src={song.picUrl} alt={song.name} className="w-full h-full object-cover" />
        </div>
        <h1 className={clsx('text-xl font-bold mb-1 text-center', darkMode ? 'text-white' : 'text-emerald-800')}>
          {song.name}
        </h1>
        <p className={clsx('text-sm text-center', darkMode ? 'text-zinc-400' : 'text-emerald-600')}>
          {song.artists} - {song.album}
        </p>
      </div>

      <div className="mb-4">
        <div className={clsx(
          'h-1 rounded-full cursor-pointer relative',
          darkMode ? 'bg-[#3a3a5a]' : 'bg-green-200/60'
        )}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const percent = (e.clientX - rect.left) / rect.width
            const newTime = percent * duration
            usePlayerStore.getState().setCurrentTime(newTime)
          }}
        >
          <div className={clsx('h-full rounded-full transition-all', darkMode ? 'bg-emerald-500' : 'bg-emerald-500')}
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className={clsx('text-xs', darkMode ? 'text-zinc-500' : 'text-emerald-500/70')}>
            {formatTime(currentTime)}
          </span>
          <span className={clsx('text-xs', darkMode ? 'text-zinc-500' : 'text-emerald-500/70')}>
            {formatTime(duration)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 mb-6">
        <button onClick={prevSong} className={clsx(
          'p-3 rounded-full transition-all',
          darkMode ? 'text-zinc-400 hover:text-emerald-400' : 'text-emerald-600 hover:text-emerald-700'
        )}>
          <SkipBack className="h-6 w-6" />
        </button>
        <button onClick={togglePlay} className={clsx(
          'p-5 rounded-full transition-all shadow-lg',
          darkMode ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-emerald-500 text-white hover:bg-emerald-400'
        )}>
          {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
        </button>
        <button onClick={nextSong} className={clsx(
          'p-3 rounded-full transition-all',
          darkMode ? 'text-zinc-400 hover:text-emerald-400' : 'text-emerald-600 hover:text-emerald-700'
        )}>
          <SkipForward className="h-6 w-6" />
        </button>
      </div>

      <div className="flex items-center justify-center gap-8">
        <button onClick={() => currentSong && toggleFavorite(currentSong)} className={clsx(
          'flex flex-col items-center gap-1 transition-all',
          isFav ? 'text-red-500' : darkMode ? 'text-zinc-400 hover:text-red-400' : 'text-emerald-600 hover:text-red-500'
        )}>
          <Heart className={clsx('h-5 w-5', isFav && 'fill-current')} />
          <span className="text-xs">喜欢</span>
        </button>
        <div className="relative volume-container">
          <button onClick={() => setShowVolumeSlider(!showVolumeSlider)} className={clsx(
            'flex flex-col items-center gap-1 transition-all',
            darkMode ? 'text-zinc-400 hover:text-emerald-400' : 'text-emerald-600 hover:text-emerald-700'
          )}>
            <Volume2 className="h-5 w-5" />
            <span className="text-xs">音量</span>
          </button>
          {showVolumeSlider && (
            <div className={clsx(
              'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-2 rounded-lg',
              darkMode ? 'bg-[#27273a]' : 'bg-white/90'
            )}>
              <input
                type="range" min="0" max="1" step="0.01" value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-24 h-1 rounded-full appearance-none cursor-pointer"
                style={{ background: darkMode ? '#3a3a5a' : '#d1fae5' }}
              />
            </div>
          )}
        </div>
        <button className={clsx(
          'flex flex-col items-center gap-1 transition-all',
          darkMode ? 'text-zinc-400 hover:text-emerald-400' : 'text-emerald-600 hover:text-emerald-700'
        )}>
          <Share2 className="h-5 w-5" />
          <span className="text-xs">分享</span>
        </button>
        <button className={clsx(
          'flex flex-col items-center gap-1 transition-all',
          darkMode ? 'text-zinc-400 hover:text-emerald-400' : 'text-emerald-600 hover:text-emerald-700'
        )}>
          <MoreHorizontal className="h-5 w-5" />
          <span className="text-xs">更多</span>
        </button>
      </div>
    </div>
  )
}
