import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayerStore } from '@/store/playerStore'
import { clsx } from 'clsx'
import { Music, ChevronRight, TrendingUp, Flame, Zap } from 'lucide-react'

const categories = ['流行', '摇滚', '民谣', '电子', '古典', 'R&B', '说唱', '爵士']

const hotAlbums = [
  { id: 1, name: '叶惠美', artist: '周杰伦', gradient: 'from-emerald-400 to-teal-600' },
  { id: 2, name: '范特西', artist: '周杰伦', gradient: 'from-green-400 to-emerald-600' },
  { id: 3, name: '八度空间', artist: '周杰伦', gradient: 'from-teal-400 to-cyan-600' },
  { id: 4, name: '七里香', artist: '周杰伦', gradient: 'from-lime-400 to-green-600' },
  { id: 5, name: '魔杰座', artist: '周杰伦', gradient: 'from-emerald-500 to-green-700' },
  { id: 6, name: '十一月的萧邦', artist: '周杰伦', gradient: 'from-green-500 to-teal-700' },
]

const newSongs = [
  { id: 1, name: '晴天', artist: '周杰伦' },
  { id: 2, name: '稻香', artist: '周杰伦' },
  { id: 3, name: '夜曲', artist: '周杰伦' },
  { id: 4, name: '七里香', artist: '周杰伦' },
  { id: 5, name: '发如雪', artist: '周杰伦' },
  { id: 6, name: '青花瓷', artist: '周杰伦' },
  { id: 7, name: '简单爱', artist: '周杰伦' },
  { id: 8, name: '告白气球', artist: '周杰伦' },
]

const rankCards = [
  { id: 'hot', name: '热歌榜', icon: Flame, color: 'from-red-400 to-orange-500' },
  { id: 'new', name: '新歌榜', icon: Zap, color: 'from-emerald-400 to-teal-500' },
  { id: 'rising', name: '飙升榜', icon: TrendingUp, color: 'from-blue-400 to-indigo-500' },
]

export default function Library() {
  const navigate = useNavigate()
  const darkMode = usePlayerStore((s) => s.darkMode)
  const [activeCategory, setActiveCategory] = useState('流行')

  return (
    <div className="max-w-lg mx-auto px-4 pb-4 animate-fade-in">
      {/* Page title */}
      <div className="flex items-center gap-2 mb-4">
        <Music className={clsx('h-6 w-6', darkMode ? 'text-emerald-400' : 'text-emerald-600')} />
        <h1 className={clsx('text-xl font-bold', darkMode ? 'text-white' : 'text-emerald-800')}>乐库</h1>
      </div>

      {/* Category tags */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={clsx(
              'whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all border',
              activeCategory === cat
                ? (darkMode ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/30' : 'bg-emerald-500 text-white border-emerald-500')
                : (darkMode ? 'text-zinc-400 border-zinc-700 hover:bg-[#2a2a4a]' : 'text-emerald-600 border-green-200 hover:bg-emerald-50')
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Hot Albums */}
      <div className="glass-card p-3 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className={clsx('text-sm font-semibold', darkMode ? 'text-white' : 'text-emerald-800')}>热门专辑</h2>
          <ChevronRight className={clsx('h-4 w-4', darkMode ? 'text-zinc-500' : 'text-emerald-400')} />
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {hotAlbums.map((album) => (
            <button
              key={album.id}
              onClick={() => navigate(`/album/${album.id}`)}
              className="flex-shrink-0 w-28"
            >
              <div className={clsx('w-28 h-28 rounded-xl bg-gradient-to-br flex items-center justify-center mb-1.5', album.gradient)}>
                <Music className="h-8 w-8 text-white/60" />
              </div>
              <p className={clsx('text-xs font-medium truncate', darkMode ? 'text-zinc-200' : 'text-emerald-800')}>{album.name}</p>
              <p className={clsx('text-[10px] truncate', darkMode ? 'text-zinc-500' : 'text-emerald-500/70')}>{album.artist}</p>
            </button>
          ))}
        </div>
      </div>

      {/* New Songs */}
      <div className="glass-card p-3 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className={clsx('text-sm font-semibold', darkMode ? 'text-white' : 'text-emerald-800')}>新歌速递</h2>
          <ChevronRight className={clsx('h-4 w-4', darkMode ? 'text-zinc-500' : 'text-emerald-400')} />
        </div>
        {newSongs.length === 0 ? (
          <div className={clsx('text-center py-8', darkMode ? 'text-zinc-500' : 'text-emerald-400/60')}>
            <Music className="h-10 w-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">暂无内容</p>
          </div>
        ) : (
          <div className="space-y-1">
            {newSongs.map((song, index) => (
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
                  <p className={clsx('truncate text-xs', darkMode ? 'text-zinc-500' : 'text-emerald-500/70')}>{song.artist}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rank Cards */}
      <div className="glass-card p-3">
        <h2 className={clsx('text-sm font-semibold mb-3', darkMode ? 'text-white' : 'text-emerald-800')}>排行榜</h2>
        <div className="grid grid-cols-3 gap-2">
          {rankCards.map((rank) => {
            const Icon = rank.icon
            return (
              <button
                key={rank.id}
                className={clsx(
                  'rounded-xl p-3 bg-gradient-to-br text-white text-center transition-transform hover:scale-105',
                  rank.color
                )}
              >
                <Icon className="h-6 w-6 mx-auto mb-1" />
                <p className="text-xs font-semibold">{rank.name}</p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
