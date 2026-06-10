import { useParams, useNavigate } from 'react-router-dom'
import { usePlayerStore } from '@/store/playerStore'
import { clsx } from 'clsx'
import { ArrowLeft, Music, Play, Clock } from 'lucide-react'

const placeholderAlbum = {
  name: '叶惠美',
  artist: '周杰伦',
  year: '2003',
  songCount: 11,
  songs: [
    { id: 1, name: '东风破', duration: 312000 },
    { id: 2, name: '晴天', duration: 269000 },
    { id: 3, name: '三年二班', duration: 258000 },
    { id: 4, name: '以父之名', duration: 342000 },
    { id: 5, name: '懦夫', duration: 256000 },
    { id: 6, name: '她的睫毛', duration: 274000 },
    { id: 7, name: '爱情悬崖', duration: 289000 },
    { id: 8, name: '梯田', duration: 243000 },
  ],
}

export default function AlbumDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const darkMode = usePlayerStore((s) => s.darkMode)

  const album = { ...placeholderAlbum, id: id || '1' }

  const formatTime = (ms: number) => {
    const mins = Math.floor(ms / 60000)
    const secs = Math.floor((ms % 60000) / 1000)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="max-w-lg mx-auto px-4 pb-4 animate-fade-in">
      {/* Back button */}
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

      {/* Album header */}
      <div className="glass-card p-4 mb-4">
        <div className="flex gap-4">
          <div className={clsx(
            'w-28 h-28 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-600 flex-shrink-0',
          )}>
            <Music className="h-12 w-12 text-white/60" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className={clsx('text-lg font-bold mb-1', darkMode ? 'text-white' : 'text-emerald-800')}>{album.name}</h1>
            <p className={clsx('text-sm mb-1', darkMode ? 'text-zinc-300' : 'text-emerald-700')}>{album.artist}</p>
            <p className={clsx('text-xs', darkMode ? 'text-zinc-500' : 'text-emerald-500/70')}>
              {album.year} · {album.songCount}首
            </p>
          </div>
        </div>
      </div>

      {/* Play all button */}
      <button className={clsx(
        'w-full rounded-xl py-2.5 mb-4 text-sm font-semibold flex items-center justify-center gap-2 transition-all',
        darkMode
          ? 'bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/40 border border-emerald-500/30'
          : 'bg-emerald-500 text-white hover:bg-emerald-600'
      )}>
        <Play className="h-4 w-4 fill-current" />
        播放全部
      </button>

      {/* Song list */}
      <div className="glass-card p-3">
        <h2 className={clsx('text-sm font-semibold mb-3', darkMode ? 'text-white' : 'text-emerald-800')}>歌曲列表</h2>
        <div className="space-y-1">
          {album.songs.map((song, index) => (
            <div
              key={song.id}
              className={clsx(
                'flex items-center gap-3 px-2 py-2 rounded-lg transition-colors',
                darkMode ? 'hover:bg-[#3a3a5a]' : 'hover:bg-green-50'
              )}
            >
              <span className={clsx('text-xs w-5 text-center font-medium', darkMode ? 'text-zinc-500' : 'text-emerald-400')}>
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className={clsx('truncate text-sm font-medium', darkMode ? 'text-zinc-200' : 'text-emerald-800')}>{song.name}</p>
                <p className={clsx('truncate text-xs', darkMode ? 'text-zinc-500' : 'text-emerald-500/70')}>{album.artist}</p>
              </div>
              <span className={clsx('text-xs', darkMode ? 'text-zinc-500' : 'text-emerald-400/70')}>
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
