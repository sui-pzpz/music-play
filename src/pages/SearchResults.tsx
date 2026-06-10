import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { usePlayerStore } from '@/store/playerStore'
import { clsx } from 'clsx'
import { ArrowLeft, Search, Music, Users, Disc, ListMusic } from 'lucide-react'

type SearchTab = 'songs' | 'artists' | 'albums' | 'playlists'

const tabs: { key: SearchTab; label: string; icon: typeof Music }[] = [
  { key: 'songs', label: '歌曲', icon: Music },
  { key: 'artists', label: '歌手', icon: Users },
  { key: 'albums', label: '专辑', icon: Disc },
  { key: 'playlists', label: '歌单', icon: ListMusic },
]

const placeholderResults = {
  songs: [
    { id: 1, name: '晴天', artist: '周杰伦', album: '叶惠美' },
    { id: 2, name: '稻香', artist: '周杰伦', album: '魔杰座' },
    { id: 3, name: '夜曲', artist: '周杰伦', album: '十一月的萧邦' },
    { id: 4, name: '七里香', artist: '周杰伦', album: '七里香' },
    { id: 5, name: '青花瓷', artist: '周杰伦', album: '我很忙' },
  ],
  artists: [
    { id: 1, name: '周杰伦', fans: '1200万' },
    { id: 2, name: '林俊杰', fans: '980万' },
    { id: 3, name: '陈奕迅', fans: '860万' },
  ],
  albums: [
    { id: 1, name: '叶惠美', artist: '周杰伦', year: '2003' },
    { id: 2, name: '范特西', artist: '周杰伦', year: '2001' },
    { id: 3, name: '七里香', artist: '周杰伦', year: '2004' },
  ],
  playlists: [
    { id: 1, name: '华语经典', count: 86 },
    { id: 2, name: '治愈系', count: 45 },
    { id: 3, name: '运动节奏', count: 32 },
  ],
}

export default function SearchResults() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const darkMode = usePlayerStore((s) => s.darkMode)
  const search = usePlayerStore((s) => s.search)

  const query = searchParams.get('q') || ''
  const [inputValue, setInputValue] = useState(query)
  const [activeTab, setActiveTab] = useState<SearchTab>('songs')

  const handleSearch = () => {
    if (inputValue.trim()) {
      search(inputValue)
    }
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

      {/* Search bar */}
      <div className={clsx(
        'flex items-center gap-2 rounded-xl px-3 py-2 mb-4 border',
        darkMode ? 'bg-[#27273a] border-zinc-700' : 'bg-white/80 border-green-200'
      )}>
        <Search className={clsx('h-4 w-4 flex-shrink-0', darkMode ? 'text-zinc-500' : 'text-emerald-400')} />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="搜索歌曲、歌手、专辑"
          className={clsx(
            'flex-1 bg-transparent outline-none text-sm',
            darkMode ? 'text-white placeholder-zinc-600' : 'text-emerald-800 placeholder-emerald-300'
          )}
        />
      </div>

      {/* Tab filter */}
      <div className="flex gap-1 mb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={clsx(
                'flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all border flex-1 justify-center',
                activeTab === tab.key
                  ? (darkMode ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200')
                  : (darkMode ? 'text-zinc-500 hover:bg-[#1e1e3a] hover:text-zinc-300 border-transparent' : 'text-emerald-500/70 hover:bg-emerald-50/50 hover:text-emerald-700 border-green-100')
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Results */}
      <div className="glass-card p-3">
        {!query ? (
          <div className={clsx('text-center py-12', darkMode ? 'text-zinc-500' : 'text-emerald-400/60')}>
            <Search className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">输入关键词搜索</p>
          </div>
        ) : activeTab === 'songs' ? (
          placeholderResults.songs.length === 0 ? (
            <div className={clsx('text-center py-12', darkMode ? 'text-zinc-500' : 'text-emerald-400/60')}>
              <Music className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">未找到相关结果</p>
            </div>
          ) : (
            <div className="space-y-1">
              {placeholderResults.songs.map((song, index) => (
                <div
                  key={song.id}
                  className={clsx(
                    'flex items-center gap-3 px-2 py-2 rounded-lg transition-colors',
                    darkMode ? 'hover:bg-[#3a3a5a]' : 'hover:bg-green-50'
                  )}
                >
                  <span className={clsx('text-xs w-5 text-center font-medium', darkMode ? 'text-zinc-500' : 'text-emerald-400')}>{index + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className={clsx('truncate text-sm font-medium', darkMode ? 'text-zinc-200' : 'text-emerald-800')}>{song.name}</p>
                    <p className={clsx('truncate text-xs', darkMode ? 'text-zinc-500' : 'text-emerald-500/70')}>{song.artist} - {song.album}</p>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : activeTab === 'artists' ? (
          placeholderResults.artists.length === 0 ? (
            <div className={clsx('text-center py-12', darkMode ? 'text-zinc-500' : 'text-emerald-400/60')}>
              <Users className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">未找到相关结果</p>
            </div>
          ) : (
            <div className="space-y-1">
              {placeholderResults.artists.map((artist) => (
                <button
                  key={artist.id}
                  onClick={() => navigate(`/artist/${artist.id}`)}
                  className={clsx(
                    'w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-colors',
                    darkMode ? 'hover:bg-[#3a3a5a]' : 'hover:bg-green-50'
                  )}
                >
                  <div className={clsx(
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    darkMode ? 'bg-[#2a2a4a]' : 'bg-emerald-50'
                  )}>
                    <Users className={clsx('h-5 w-5', darkMode ? 'text-emerald-400' : 'text-emerald-500')} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={clsx('text-sm font-medium', darkMode ? 'text-zinc-200' : 'text-emerald-800')}>{artist.name}</p>
                    <p className={clsx('text-xs', darkMode ? 'text-zinc-500' : 'text-emerald-500/70')}>{artist.fans} 粉丝</p>
                  </div>
                </button>
              ))}
            </div>
          )
        ) : activeTab === 'albums' ? (
          placeholderResults.albums.length === 0 ? (
            <div className={clsx('text-center py-12', darkMode ? 'text-zinc-500' : 'text-emerald-400/60')}>
              <Disc className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">未找到相关结果</p>
            </div>
          ) : (
            <div className="space-y-1">
              {placeholderResults.albums.map((album) => (
                <button
                  key={album.id}
                  onClick={() => navigate(`/album/${album.id}`)}
                  className={clsx(
                    'w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-colors',
                    darkMode ? 'hover:bg-[#3a3a5a]' : 'hover:bg-green-50'
                  )}
                >
                  <div className={clsx(
                    'w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-600',
                  )}>
                    <Disc className="h-5 w-5 text-white/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={clsx('text-sm font-medium', darkMode ? 'text-zinc-200' : 'text-emerald-800')}>{album.name}</p>
                    <p className={clsx('text-xs', darkMode ? 'text-zinc-500' : 'text-emerald-500/70')}>{album.artist} · {album.year}</p>
                  </div>
                </button>
              ))}
            </div>
          )
        ) : (
          placeholderResults.playlists.length === 0 ? (
            <div className={clsx('text-center py-12', darkMode ? 'text-zinc-500' : 'text-emerald-400/60')}>
              <ListMusic className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">未找到相关结果</p>
            </div>
          ) : (
            <div className="space-y-1">
              {placeholderResults.playlists.map((pl) => (
                <div
                  key={pl.id}
                  className={clsx(
                    'flex items-center gap-3 px-2 py-2 rounded-lg transition-colors',
                    darkMode ? 'hover:bg-[#3a3a5a]' : 'hover:bg-green-50'
                  )}
                >
                  <div className={clsx(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    darkMode ? 'bg-[#2a2a4a]' : 'bg-emerald-50'
                  )}>
                    <ListMusic className={clsx('h-5 w-5', darkMode ? 'text-emerald-400' : 'text-emerald-500')} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={clsx('text-sm font-medium', darkMode ? 'text-zinc-200' : 'text-emerald-800')}>{pl.name}</p>
                    <p className={clsx('text-xs', darkMode ? 'text-zinc-500' : 'text-emerald-500/70')}>{pl.count} 首</p>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}
