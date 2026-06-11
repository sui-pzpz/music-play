import { useState, useEffect } from 'react'
import { useLocation, Outlet, useNavigate } from 'react-router-dom'
import { Home, User, Settings, Moon, Sun, Music, Play, Pause, SkipForward, SkipBack, Heart, ArrowLeft, Music2 } from 'lucide-react'
import { usePlayerStore } from '@/store/playerStore'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import { useEntranceAnimation, useInteractionFeedback } from '@/hooks/useGsapAnimations'
import { clsx } from 'clsx'
import Player from '@/pages/Player'
import { Decorations } from './Decorations'

function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const darkMode = usePlayerStore((s) => s.darkMode)

  const tabs = [
    { path: '/home', icon: Home, label: '首页' },
    { path: '/home/profile', icon: User, label: '我的' },
  ]

  return (
    <div className={clsx(
      'flex items-center justify-around border-t',
      darkMode ? 'bg-[#1a1a2e]/95 border-[#2a2a4a]' : 'bg-white/80 border-emerald-200/40',
      'backdrop-blur-lg'
    )}>
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = location.pathname === tab.path
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={clsx(
              'relative flex flex-col items-center gap-0.5 py-2.5 px-8 transition-all duration-300',
              isActive
                ? (darkMode ? 'text-emerald-400' : 'text-emerald-600')
                : (darkMode ? 'text-zinc-500 hover:text-zinc-300' : 'text-emerald-400/60 hover:text-emerald-500')
            )}
          >
            {isActive && (
              <div className={clsx(
                'absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full',
                darkMode ? 'bg-emerald-400' : 'bg-emerald-500'
              )} />
            )}
            <div className={clsx(
              'relative',
              isActive && 'scale-110 transition-transform duration-300'
            )}>
              <Icon className={clsx('h-5 w-5')} />
              {isActive && (
                <div className={clsx(
                  'absolute inset-0 rounded-full',
                  darkMode ? 'bg-emerald-400/10' : 'bg-emerald-500/10',
                  'animate-pulse-glow'
                )} />
              )}
            </div>
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function GlobalMiniPlayer({ onExpand }: { onExpand: () => void }) {
  const currentSong = usePlayerStore((s) => s.currentSong)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const togglePlay = usePlayerStore((s) => s.togglePlay)
  const nextSong = usePlayerStore((s) => s.nextSong)
  const prevSong = usePlayerStore((s) => s.prevSong)
  const darkMode = usePlayerStore((s) => s.darkMode)
  const isFavorite = usePlayerStore((s) => s.isFavorite)
  const toggleFavorite = usePlayerStore((s) => s.toggleFavorite)

  if (!currentSong) return null

  const isFav = isFavorite(currentSong.id, currentSong.platform)

  return (
    <div
      onClick={onExpand}
      className={clsx(
        'flex items-center gap-3 px-3 py-2 border-t cursor-pointer transition-all',
        darkMode ? 'bg-[#16213e]/95 border-[#2a2a4a] hover:bg-[#1e2a4a]' : 'bg-cream-100/90 border-emerald-200/40 hover:bg-emerald-50/50',
        'backdrop-blur-md'
      )}
    >
      {/* 封面 */}
      {currentSong.picUrl ? (
        <img src={currentSong.picUrl} alt="" className="h-10 w-10 rounded-lg object-cover shadow-sm flex-shrink-0" />
      ) : (
        <div className={clsx('h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0', darkMode ? 'bg-[#2a2a4a]' : 'bg-emerald-50')}>
          <Music className={clsx('h-5 w-5', darkMode ? 'text-emerald-400' : 'text-emerald-500')} />
        </div>
      )}

      {/* 歌曲信息 */}
      <div className="min-w-0 flex-1">
        <p className={clsx('text-sm font-medium truncate', darkMode ? 'text-white' : 'text-emerald-900')}>{currentSong.name}</p>
        <p className="text-xs text-emerald-400/70 truncate">{currentSong.artists}</p>
      </div>

      {/* 控制按钮 */}
      <div className="flex items-center gap-0.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => toggleFavorite(currentSong)}
          className={clsx('p-1.5 rounded-full transition-all', isFav ? 'text-red-500' : 'text-emerald-300 hover:text-red-400')}
        >
          <Heart className="h-4 w-4" fill={isFav ? 'currentColor' : 'none'} />
        </button>
        <button
          onClick={prevSong}
          className={clsx('p-1.5 rounded-full transition-all', darkMode ? 'text-zinc-400 hover:text-emerald-400' : 'text-emerald-400/70 hover:text-emerald-600')}
        >
          <SkipBack className="h-4 w-4" fill="currentColor" />
        </button>
        <button
          onClick={togglePlay}
          className={clsx(
            'p-2 rounded-full transition-all',
            darkMode ? 'bg-[#2a2a4a] text-emerald-400 hover:bg-[#3a3a5a]' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
          )}
        >
          {isPlaying ? <Pause className="h-4 w-4" fill="currentColor" /> : <Play className="h-4 w-4" fill="currentColor" />}
        </button>
        <button
          onClick={nextSong}
          className={clsx('p-1.5 rounded-full transition-all', darkMode ? 'text-zinc-400 hover:text-emerald-400' : 'text-emerald-400/70 hover:text-emerald-600')}
        >
          <SkipForward className="h-4 w-4" fill="currentColor" />
        </button>
      </div>
    </div>
  )
}

export default function Layout() {
  const location = useLocation()
  const darkMode = usePlayerStore((s) => s.darkMode)
  const currentSong = usePlayerStore((s) => s.currentSong)
  const [showPlayer, setShowPlayer] = useState(false)

  // 始终挂载 useAudioPlayer，确保音频控制不随 Player 组件卸载而失效
  useAudioPlayer()

  // GSAP 入场动效 + 交互反馈
  useEntranceAnimation()
  useInteractionFeedback()

  // 初始化深色模式
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return
      const { togglePlay, nextSong, prevSong, volume, setVolume, toggleMute, displayMode, setDisplayMode } = usePlayerStore.getState()
      switch (e.code) {
        case 'Space':
          e.preventDefault()
          togglePlay()
          break
        case 'ArrowRight':
          if (!(e.target as HTMLElement).closest('[role="slider"]')) {
            e.preventDefault()
            nextSong()
          }
          break
        case 'ArrowLeft':
          if (!(e.target as HTMLElement).closest('[role="slider"]')) {
            e.preventDefault()
            prevSong()
          }
          break
        case 'ArrowUp':
          if (!(e.target as HTMLElement).closest('[role="slider"]') && !(e.target as HTMLElement).closest('input[type="range"]')) {
            e.preventDefault()
            setVolume(Math.min(1, volume + 0.1))
          }
          break
        case 'ArrowDown':
          if (!(e.target as HTMLElement).closest('[role="slider"]') && !(e.target as HTMLElement).closest('input[type="range"]')) {
            e.preventDefault()
            setVolume(Math.max(0, volume - 0.1))
          }
          break
        case 'KeyM':
          toggleMute()
          break
        case 'KeyL':
          setDisplayMode(displayMode === 'vinyl' ? 'lyrics' : 'vinyl')
          break
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // 初始化推荐
  useEffect(() => {
    const { initRecommend, restoreProgress } = usePlayerStore.getState()
    initRecommend().then(() => restoreProgress()).catch(() => restoreProgress())
  }, [])

  // 全屏播放器
  if (showPlayer) {
    return <Player onMinimize={() => setShowPlayer(false)} />
  }

  // 子页面（设置等）
  const isSubPage = location.pathname.startsWith('/home/settings') ||
    location.pathname.startsWith('/home/playlist/') ||
    location.pathname.startsWith('/home/song/')

  if (isSubPage) {
    return (
      <div className={clsx('min-h-screen relative', darkMode ? 'bg-[#1a1a2e]' : 'green-gradient-bg')}>
        <div className={clsx(
          'fixed inset-0 pointer-events-none overflow-hidden z-0',
          darkMode ? '' : 'green-gradient-bg animate-breathing'
        )} />
        <Decorations />
        {/* 顶部导航栏 */}
        <div className={clsx(
          'fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3',
          darkMode ? 'bg-[#1a1a2e]/95' : 'bg-cream-100/80',
          'backdrop-blur-md border-b',
          darkMode ? 'border-[#2a2a4a]' : 'border-emerald-200/40'
        )}>
          <SubPageTitle />
        </div>
        <main className="relative z-10 pt-[60px] pb-[140px] min-h-screen">
          <Outlet />
        </main>
        {/* 迷你播放器 + 底部导航 */}
        <div className="fixed bottom-0 left-0 right-0 z-40">
          <GlobalMiniPlayer onExpand={() => setShowPlayer(true)} />
          <BottomNav />
        </div>
      </div>
    )
  }

  // 主页和个人主页
  return (
    <div className={clsx('min-h-screen relative', darkMode ? 'bg-[#1a1a2e]' : 'green-gradient-bg')}>
      <div className={clsx(
        'fixed inset-0 pointer-events-none overflow-hidden z-0',
        darkMode ? '' : 'green-gradient-bg animate-breathing'
      )} />
      <Decorations />

      {/* 顶部栏 - 深青绿标题，浅绿图标 */}
      <div className={clsx(
        'fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3',
        darkMode ? 'bg-[#1a1a2e]/95' : 'bg-cream-100/80',
        'backdrop-blur-md border-b',
        darkMode ? 'border-[#2a2a4a]' : 'border-emerald-200/40'
      )}>
        <div className={clsx('flex items-center gap-1.5', darkMode ? 'text-white' : 'text-emerald-800')}>
          {location.pathname !== '/home/profile' && (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-emerald-600 shrink-0">
              <path d="M12 4V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="2" r="3" fill="currentColor" />
              <path d="M12 16C12 20 8 22 5 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M12 16C12 20 16 22 19 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
          <h1 className="text-lg font-semibold">
            {location.pathname === '/home/profile' ? '个人主页' : '音瓶'}
          </h1>
        </div>
        <div className="flex items-center gap-1">
          <TopBarActions />
        </div>
      </div>

      {/* 页面内容 */}
      <main className="relative z-10 pt-[56px] pb-[140px] min-h-screen overflow-y-auto">
        <Outlet />
      </main>

      {/* 迷你播放器 + 底部导航 */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <GlobalMiniPlayer onExpand={() => setShowPlayer(true)} />
        <BottomNav />
      </div>
    </div>
  )
}

function TopBarActions() {
  const navigate = useNavigate()
  const darkMode = usePlayerStore((s) => s.darkMode)
  const toggleDarkMode = usePlayerStore((s) => s.toggleDarkMode)

  // 设置、深色模式图标改为浅绿
  const btnClass = clsx(
    'rounded-full p-2 transition-all',
    darkMode ? 'text-zinc-400 hover:text-emerald-400 hover:bg-[#2a2a4a]' : 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50'
  )

  return (
    <>
      <button onClick={() => navigate('/home/settings')} className={btnClass} title="设置">
        <Settings className="h-5 w-5" />
      </button>
      <button onClick={toggleDarkMode} className={btnClass} title={darkMode ? '浅色模式' : '深色模式'}>
        {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>
    </>
  )
}

function SubPageTitle() {
  const navigate = useNavigate()
  const location = useLocation()
  const darkMode = usePlayerStore((s) => s.darkMode)

  const pageTitles: Record<string, string> = {
    '/home/settings': '设置',
  }

  const getTitle = () => {
    for (const [path, title] of Object.entries(pageTitles)) {
      if (location.pathname.startsWith(path)) return title
    }
    if (location.pathname.startsWith('/home/playlist/')) return '歌单详情'
    if (location.pathname.startsWith('/home/song/')) return '歌曲详情'
    return '音瓶'
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className={clsx('p-2 rounded-full transition-all', darkMode ? 'hover:bg-[#2a2a4a] text-emerald-400' : 'hover:bg-emerald-50 text-emerald-600')}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className={clsx('text-lg font-semibold', darkMode ? 'text-white' : 'text-emerald-800')}>{getTitle()}</h1>
      </div>
      <div className="w-16" />
    </>
  )
}
