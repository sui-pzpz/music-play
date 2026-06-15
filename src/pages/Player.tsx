import { useState, useCallback, useRef, useEffect } from 'react'
import SongInfo from '@/components/SongInfo'
import LyricsDisplay from '@/components/LyricsDisplay'
import VinylDisc from '@/components/VinylDisc'
import ProgressBar from '@/components/ProgressBar'
import ControlButtons, { MainPlaybackControls, SecondaryControls } from '@/components/ControlButtons'
import VolumeControl from '@/components/VolumeControl'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import { useSwipe } from '@/hooks/useSwipe'
import { usePlayerStore } from '@/store/playerStore'
import { Heart, Disc, AlignLeft, ChevronDown } from 'lucide-react'
import { clsx } from 'clsx'

function HeartBurst({ x, y, onDone }: { x: number; y: number; onDone: () => void }) {
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone
  useEffect(() => {
    const timer = setTimeout(() => onDoneRef.current(), 600)
    return () => clearTimeout(timer)
  }, [])
  return (
    <div
      className="pointer-events-none fixed z-50"
      style={{ left: x - 12, top: y - 12, animation: 'heartBurst 0.6s ease-out forwards' }}
    >
      <Heart className="h-6 w-6 text-red-500 animate-bounce" fill="currentColor" />
    </div>
  )
}

interface PlayerProps {
  onMinimize?: () => void
}

export default function Player({ onMinimize }: PlayerProps) {
  const { seek, setSeeking } = useAudioPlayer()
  const currentSong = usePlayerStore((s) => s.currentSong)
  const toggleFavorite = usePlayerStore((s) => s.toggleFavorite)
  const isFavorite = usePlayerStore((s) => s.isFavorite)
  const displayMode = usePlayerStore((s) => s.displayMode)
  const setDisplayMode = usePlayerStore((s) => s.setDisplayMode)
  const nextSong = usePlayerStore((s) => s.nextSong)
  const prevSong = usePlayerStore((s) => s.prevSong)
  const darkMode = usePlayerStore((s) => s.darkMode)
  const [bursts, setBursts] = useState<{ id: number; type: 'heart' | 'plus'; x: number; y: number }[]>([])
  const swipeHandlers = useSwipe({ onSwipeLeft: nextSong, onSwipeRight: prevSong })

  const isCurrentFav = currentSong ? isFavorite(currentSong.id, currentSong.platform) : false

  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    if (!currentSong) return
    toggleFavorite(currentSong)
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const id = Date.now()
    setBursts((prev) => [...prev, { id, type: 'heart', x: rect.left + rect.width / 2, y: rect.top }])
  }, [currentSong, toggleFavorite])

  const removeBurst = useCallback((id: number) => {
    setBursts((prev) => prev.filter((b) => b.id !== id))
  }, [])

  return (
    <div className={clsx('fixed inset-0 z-50 flex flex-col', darkMode ? 'bg-[#1a1a2e]' : 'bg-cream-50')}>
      {/* 特效层 */}
      {bursts.map((b) =>
        b.type === 'heart' ? (
          <HeartBurst key={b.id} x={b.x} y={b.y} onDone={() => removeBurst(b.id)} />
        ) : null
      )}

      {/* 顶部区域 */}
      <div className="flex items-start justify-end px-4 pt-4 sm:px-8 sm:pt-6">
        {displayMode === 'lyrics' && (
          <div className="flex-1">
            <SongInfo />
          </div>
        )}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setDisplayMode(displayMode === 'vinyl' ? 'lyrics' : 'vinyl')}
            className={clsx(
              'rounded-full p-2 transition-all',
              displayMode === 'lyrics' ? 'mt-2' : 'mt-0',
              darkMode ? 'text-zinc-400 hover:text-emerald-400 hover:bg-[#2a2a4a]' : 'text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50'
            )}
            title={displayMode === 'vinyl' ? '显示歌词' : '显示唱片'}
          >
            {displayMode === 'vinyl' ? <AlignLeft className="h-5 w-5" /> : <Disc className="h-5 w-5" />}
          </button>
          {onMinimize && (
            <button
              onClick={onMinimize}
              className={clsx(
                'rounded-full p-2 transition-all',
                darkMode ? 'text-zinc-400 hover:text-emerald-400 hover:bg-[#2a2a4a]' : 'text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50'
              )}
              title="最小化"
            >
              <ChevronDown className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 transition-opacity duration-300" {...swipeHandlers}>
        {displayMode === 'vinyl' ? <VinylDisc /> : <LyricsDisplay onSeek={seek} />}
      </div>

      <div className={clsx('border-t', darkMode ? 'border-[#2a2a4a] bg-[#1a1a2e]' : 'border-emerald-200 bg-cream-50')}>
        <div className="px-4 py-4">
          <ProgressBar onSeek={seek} onSetSeeking={setSeeking} />
        </div>

        {/* 手机端：两行布局 */}
        <div className="flex flex-col gap-2 px-4 pb-4 sm:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {currentSong && (
                <button
                  onClick={handleFavoriteClick}
                  className={clsx(
                    'rounded-full p-2.5 transition-all active:scale-90',
                    isCurrentFav ? 'text-red-500 scale-110' : 'text-zinc-300 hover:text-red-400'
                  )}
                  title={isCurrentFav ? '取消收藏' : '收藏'}
                >
                  <Heart className="h-5 w-5" fill={isCurrentFav ? 'currentColor' : 'none'} />
                </button>
              )}
              <VolumeControl />
            </div>
            <SecondaryControls />
          </div>
          <div className="flex justify-center">
            <MainPlaybackControls />
          </div>
        </div>

        {/* 桌面端：单行布局 */}
        <div className="hidden sm:flex items-center justify-between px-6 pb-5">
          <div className="w-28" />
          <ControlButtons />
          <div className="flex items-center gap-2 w-28 justify-end">
            {currentSong && (
              <button
                onClick={handleFavoriteClick}
                className={clsx(
                  'rounded-full p-1.5 transition-all',
                  isCurrentFav ? 'text-red-500 scale-110' : 'text-zinc-300 hover:text-red-400'
                )}
                title={isCurrentFav ? '取消收藏' : '收藏'}
              >
                <Heart className="h-5 w-5" fill={isCurrentFav ? 'currentColor' : 'none'} />
              </button>
            )}
            <VolumeControl />
          </div>
        </div>
      </div>
    </div>
  )
}
