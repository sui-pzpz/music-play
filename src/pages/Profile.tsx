import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayerStore } from '@/store/playerStore'
import { SongRow, PlaylistTabContent } from '@/components/PlaylistPanel'
import { Heart, ListMusic, Clock, Trash2, User, LogOut } from 'lucide-react'
import { clsx } from 'clsx'

type ProfileTab = 'favorites' | 'playlists' | 'history'

export default function Profile() {
  const favorites = usePlayerStore((s) => s.favorites)
  const toggleFavorite = usePlayerStore((s) => s.toggleFavorite)
  const playFavorite = usePlayerStore((s) => s.playFavorite)
  const addToPlayNext = usePlayerStore((s) => s.addToPlayNext)
  const history = usePlayerStore((s) => s.history)
  const playHistory = usePlayerStore((s) => s.playHistory)
  const clearHistory = usePlayerStore((s) => s.clearHistory)
  const savedPlaylists = usePlayerStore((s) => s.savedPlaylists)
  const createPlaylist = usePlayerStore((s) => s.createPlaylist)
  const deletePlaylist = usePlayerStore((s) => s.deletePlaylist)
  const renamePlaylist = usePlayerStore((s) => s.renamePlaylist)
  const removeSongFromPlaylist = usePlayerStore((s) => s.removeSongFromPlaylist)
  const playPlaylist = usePlayerStore((s) => s.playPlaylist)
  const addPlaylistToPlayNext = usePlayerStore((s) => s.addPlaylistToPlayNext)
  const darkMode = usePlayerStore((s) => s.darkMode)

  const [activeTab, setActiveTab] = useState<ProfileTab>('favorites')
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const navigate = useNavigate()

  const isFav = (songId: number, platform?: string) => favorites.some((s) => s.id === songId && (platform === undefined || s.platform === platform))

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    navigate('/login', { replace: true })
  }

  const tabs: { key: ProfileTab; label: string; icon: typeof Heart; count: number }[] = [
    { key: 'favorites', label: '收藏', icon: Heart, count: favorites.length },
    { key: 'playlists', label: '歌单', icon: ListMusic, count: savedPlaylists.length },
    { key: 'history', label: '历史', icon: Clock, count: history.length },
  ]

  return (
    <div className="px-4 pb-4">
      {/* 个人信息区 - 米白底+淡绿柔阴影，深青绿文字 */}
      <div className="glass-card p-4 mb-4 animate-scale-in">
        <div className="flex items-center gap-3">
          <div className={clsx(
            'w-14 h-14 rounded-full flex items-center justify-center',
            darkMode ? 'bg-[#2a2a4a]' : 'bg-emerald-50'
          )}>
            <User className={clsx('h-7 w-7', darkMode ? 'text-emerald-400' : 'text-emerald-600')} />
          </div>
          <div className="flex-1">
            <h2 className={clsx('text-lg font-semibold', darkMode ? 'text-white' : 'text-emerald-800')}>我的音乐</h2>
            <p className="text-xs text-emerald-400/70 mt-0.5">
              {favorites.length} 首收藏 · {savedPlaylists.length} 个歌单 · {history.length} 首听过
            </p>
          </div>
          <button
            onClick={() => setShowLogoutModal(true)}
            className={clsx(
              'p-2 rounded-xl transition-all duration-300',
              darkMode
                ? 'hover:bg-[#2a2a4a] text-zinc-400 hover:text-red-400'
                : 'hover:bg-emerald-50 text-emerald-400 hover:text-red-500'
            )}
            title="退出登录"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* 退出登录确认弹窗 */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className={clsx(
            'rounded-2xl p-6 w-80 shadow-2xl',
            darkMode ? 'bg-[#1e1e3a]' : 'bg-white'
          )}>
            <div className="text-center mb-5">
              <div className={clsx(
                'w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center',
                darkMode ? 'bg-red-900/30' : 'bg-red-50'
              )}>
                <LogOut className={clsx('h-7 w-7', darkMode ? 'text-red-400' : 'text-red-500')} />
              </div>
              <h3 className={clsx('text-lg font-semibold mb-1', darkMode ? 'text-white' : 'text-emerald-800')}>
                退出登录
              </h3>
              <p className={clsx('text-sm', darkMode ? 'text-zinc-400' : 'text-emerald-500')}>
                确定要退出当前账号吗？
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className={clsx(
                  'flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-300',
                  darkMode
                    ? 'bg-[#2a2a4a] text-zinc-300 hover:bg-[#3a3a5a]'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                )}
              >
                取消
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-red-500 to-red-400 text-white hover:from-red-400 hover:to-red-300 hover:shadow-lg hover:shadow-red-500/25 active:scale-[0.98] transition-all duration-300"
              >
                退出
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 切换 - 米白底+浅绿边框，选中浅绿填充，浅绿图标 */}
      <div className="flex gap-1 mb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={clsx(
                'flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all flex-1 justify-center border',
                activeTab === tab.key
                  ? (darkMode ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200')
                  : (darkMode ? 'text-zinc-500 hover:bg-[#1e1e3a] hover:text-zinc-300 border-transparent' : 'text-emerald-500/70 hover:bg-emerald-50/50 hover:text-emerald-700 border-green-100')
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {tab.count > 0 && (
                <span className={clsx(
                  'ml-0.5 rounded-full px-1.5 text-[10px] font-bold',
                  activeTab === tab.key
                    ? (darkMode ? 'bg-emerald-800/50 text-emerald-300' : 'bg-emerald-100 text-emerald-700')
                    : (darkMode ? 'bg-[#3a3a5a] text-zinc-400' : 'bg-emerald-50 text-emerald-500')
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* 收藏 Tab - 米白底+淡绿柔阴影，浅绿灰占位，浅绿爱心 */}
      {activeTab === 'favorites' && (
        <div className="glass-card p-3 animate-fade-in">
          {favorites.length === 0 ? (
            <div className={clsx('text-center py-12', darkMode ? 'text-zinc-500' : 'text-emerald-400/60')}>
              <Heart className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">还没有收藏的歌曲</p>
              <p className="text-xs mt-1">搜索歌曲后点击 ♡ 收藏</p>
            </div>
          ) : (
            <div>
              <div className={clsx('flex items-center justify-between mb-2 px-2', darkMode ? 'text-zinc-400' : 'text-emerald-600/70')}>
                <p className="text-xs font-medium">共 {favorites.length} 首</p>
              </div>
              {favorites.map((song, index) => (
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
              ))}
            </div>
          )}
        </div>
      )}

      {/* 歌单 Tab */}
      {activeTab === 'playlists' && (
        <div className="glass-card p-3 animate-fade-in">
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
        </div>
      )}

      {/* 历史 Tab */}
      {activeTab === 'history' && (
        <div className="glass-card p-3 animate-fade-in">
          {history.length === 0 ? (
            <div className={clsx('text-center py-12', darkMode ? 'text-zinc-500' : 'text-emerald-400/60')}>
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">还没有播放记录</p>
              <p className="text-xs mt-1">播放歌曲后会自动记录</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2 px-2">
                <p className="text-xs text-emerald-400/70">共 {history.length} 首</p>
                <button
                  onClick={clearHistory}
                  className="flex items-center gap-1 text-xs text-emerald-400/70 hover:text-red-500 transition-colors"
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
            </div>
          )}
        </div>
      )}
    </div>
  )
}
