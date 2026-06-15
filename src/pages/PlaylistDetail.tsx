import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Music, User, Clock, Heart, Plus, Check } from 'lucide-react'
import { usePlayerStore } from '@/store/playerStore'
import { clsx } from 'clsx'
import { useState, useCallback } from 'react'

export default function PlaylistDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const darkMode = usePlayerStore((s) => s.darkMode)
  const addToPlayNext = usePlayerStore((s) => s.addToPlayNext)
  const toggleFavorite = usePlayerStore((s) => s.toggleFavorite)
  const favorites = usePlayerStore((s) => s.favorites)
  const [addedSongId, setAddedSongId] = useState<number | null>(null)

  const handleAddToPlayNext = useCallback((song: typeof playlist.songs[0]) => {
    addToPlayNext(song)
    setAddedSongId(song.id)
    setTimeout(() => setAddedSongId(null), 1000)
  }, [addToPlayNext])

  const playlist = {
    id: id || '1',
    name: '精选歌单',
    description: '精选热门歌曲合集',
    cover: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=music%20playlist%20cover%20green%20nature%20forest%20theme&image_size=square',
    songs: [
      { id: 1, name: '晴天', artists: '周杰伦', album: '叶惠美', picUrl: '', platform: 'netease' as const, duration: 269000 },
      { id: 2, name: '稻香', artists: '周杰伦', album: '魔杰座', picUrl: '', platform: 'netease' as const, duration: 223000 },
      { id: 3, name: '七里香', artists: '周杰伦', album: '七里香', picUrl: '', platform: 'netease' as const, duration: 299000 },
      { id: 4, name: '夜曲', artists: '周杰伦', album: '十一月的萧邦', picUrl: '', platform: 'netease' as const, duration: 263000 },
      { id: 5, name: '发如雪', artists: '周杰伦', album: '十一月的萧邦', picUrl: '', platform: 'netease' as const, duration: 299000 },
    ]
  }

  const isFav = (songId: number) => {
    return favorites.some(f => f.id === songId)
  }

  const formatTime = (ms: number) => {
    const mins = Math.floor(ms / 60000)
    const secs = Math.floor((ms % 60000) / 1000)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

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

      <div className="flex gap-4 mb-4">
        <div className={clsx(
          'w-24 h-24 rounded-xl overflow-hidden',
          darkMode ? 'bg-[#27273a]' : 'bg-green-100'
        )}>
          <img
            src={playlist.cover}
            alt={playlist.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <h1 className={clsx('text-lg font-semibold mb-1', darkMode ? 'text-white' : 'text-emerald-800')}>
            {playlist.name}
          </h1>
          <p className={clsx('text-xs mb-2', darkMode ? 'text-zinc-500' : 'text-emerald-500/70')}>
            {playlist.description}
          </p>
          <div className="flex items-center gap-3">
            <span className={clsx('text-xs', darkMode ? 'text-zinc-400' : 'text-emerald-600')}>
              <Music className="h-3 w-3 inline mr-1" />
              {playlist.songs.length}首
            </span>
            <span className={clsx('text-xs', darkMode ? 'text-zinc-400' : 'text-emerald-600')}>
              <User className="h-3 w-3 inline mr-1" />
              佚名
            </span>
          </div>
        </div>
      </div>

      <div className={clsx(
        'rounded-xl p-3',
        darkMode ? 'bg-[#27273a]' : 'bg-white/80'
      )}>
        <div className="space-y-1">
          {playlist.songs.map((song, index) => (
            <div
              key={song.id}
              className={clsx(
                'flex items-center gap-3 px-2 py-2 rounded-lg transition-colors',
                darkMode ? 'hover:bg-[#3a3a5a]' : 'hover:bg-green-50'
              )}
            >
              <span className={clsx('text-xs w-5 text-center', darkMode ? 'text-zinc-500' : 'text-emerald-400')}>
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className={clsx('truncate text-sm font-medium', darkMode ? 'text-zinc-200' : 'text-emerald-800')}>
                  {song.name}
                </p>
                <p className={clsx('truncate text-xs', darkMode ? 'text-zinc-500' : 'text-emerald-500/70')}>
                  {song.artists} - {song.album}
                </p>
              </div>
              <button
                onClick={() => toggleFavorite(song)}
                className={clsx(
                  'p-1.5 rounded-full transition-all',
                  isFav(song.id)
                    ? 'text-red-500'
                    : darkMode ? 'text-zinc-500 hover:text-red-400' : 'text-emerald-400/70 hover:text-red-500'
                )}
              >
                <Heart className={clsx('h-4 w-4', isFav(song.id) && 'fill-current')} />
              </button>
              <button
                onClick={() => handleAddToPlayNext(song)}
                className={clsx(
                  'p-1.5 rounded-full transition-all duration-300',
                  addedSongId === song.id
                    ? 'text-emerald-500 scale-110'
                    : darkMode ? 'text-zinc-500 hover:text-emerald-400' : 'text-emerald-400/70 hover:text-emerald-600'
                )}
              >
                {addedSongId === song.id ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </button>
              <span className={clsx('text-xs w-12 text-right', darkMode ? 'text-zinc-500' : 'text-emerald-400/70')}>
                <Clock className="h-3 w-3 inline mr-0.5" />
                {formatTime(song.duration)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
