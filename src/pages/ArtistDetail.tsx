import { useParams, useNavigate } from 'react-router-dom'
import { usePlayerStore } from '@/store/playerStore'
import { clsx } from 'clsx'
import { ArrowLeft, Music, Users, Heart, Plus } from 'lucide-react'

const placeholderArtist = {
  name: '周杰伦',
  fans: 1200000,
  hotSongs: [
    { id: 1, name: '晴天', album: '叶惠美' },
    { id: 2, name: '稻香', album: '魔杰座' },
    { id: 3, name: '夜曲', album: '十一月的萧邦' },
    { id: 4, name: '七里香', album: '七里香' },
    { id: 5, name: '青花瓷', album: '我很忙' },
  ],
  albums: [
    { id: 1, name: '叶惠美', gradient: 'from-emerald-400 to-teal-600' },
    { id: 2, name: '范特西', gradient: 'from-green-400 to-emerald-600' },
    { id: 3, name: '七里香', gradient: 'from-teal-400 to-cyan-600' },
    { id: 4, name: '魔杰座', gradient: 'from-lime-400 to-green-600' },
  ],
}

export default function ArtistDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const darkMode = usePlayerStore((s) => s.darkMode)

  const artist = { ...placeholderArtist, id: id || '1' }

  const formatFans = (count: number) => {
    if (count >= 10000) return `${(count / 10000).toFixed(0)}万`
    return count.toString()
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

      {/* Artist header */}
      <div className="glass-card p-4 mb-4">
        <div className="flex items-center gap-4">
          <div className={clsx(
            'w-20 h-20 rounded-full flex items-center justify-center',
            darkMode ? 'bg-[#2a2a4a]' : 'bg-emerald-50'
          )}>
            <Users className={clsx('h-10 w-10', darkMode ? 'text-emerald-400' : 'text-emerald-600')} />
          </div>
          <div>
            <h1 className={clsx('text-xl font-bold', darkMode ? 'text-white' : 'text-emerald-800')}>{artist.name}</h1>
            <p className={clsx('text-xs mt-1', darkMode ? 'text-zinc-500' : 'text-emerald-500/70')}>
              <Users className="h-3 w-3 inline mr-1" />
              {formatFans(artist.fans)} 粉丝
            </p>
          </div>
        </div>
      </div>

      {/* Hot Songs */}
      <div className="glass-card p-3 mb-4">
        <h2 className={clsx('text-sm font-semibold mb-3', darkMode ? 'text-white' : 'text-emerald-800')}>热门歌曲</h2>
        <div className="space-y-1">
          {artist.hotSongs.map((song, index) => (
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
                <p className={clsx('truncate text-xs', darkMode ? 'text-zinc-500' : 'text-emerald-500/70')}>{song.album}</p>
              </div>
              <button className={clsx(
                'p-1.5 rounded-full transition-all',
                darkMode ? 'text-zinc-500 hover:text-red-400' : 'text-emerald-400/70 hover:text-red-500'
              )}>
                <Heart className="h-4 w-4" />
              </button>
              <button className={clsx(
                'p-1.5 rounded-full transition-all',
                darkMode ? 'text-zinc-500 hover:text-emerald-400' : 'text-emerald-400/70 hover:text-emerald-600'
              )}>
                <Plus className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Albums */}
      <div className="glass-card p-3">
        <h2 className={clsx('text-sm font-semibold mb-3', darkMode ? 'text-white' : 'text-emerald-800')}>专辑</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {artist.albums.map((album) => (
            <button
              key={album.id}
              onClick={() => navigate(`/album/${album.id}`)}
              className="flex-shrink-0 w-28"
            >
              <div className={clsx('w-28 h-28 rounded-xl bg-gradient-to-br flex items-center justify-center mb-1.5', album.gradient)}>
                <Music className="h-8 w-8 text-white/60" />
              </div>
              <p className={clsx('text-xs font-medium truncate', darkMode ? 'text-zinc-200' : 'text-emerald-800')}>{album.name}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
