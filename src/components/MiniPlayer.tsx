import { usePlayerStore } from '@/store/playerStore'
import { Play, Pause, SkipForward, Music } from 'lucide-react'
import { clsx } from 'clsx'
import { useRef } from 'react'

export default function MiniPlayer({ onExpand }: { onExpand: () => void }) {
  const currentSong = usePlayerStore((s) => s.currentSong)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const togglePlay = usePlayerStore((s) => s.togglePlay)
  const nextSong = usePlayerStore((s) => s.nextSong)
  const darkMode = usePlayerStore((s) => s.darkMode)
  const touchStartY = useRef(0)
  const touchStartX = useRef(0)

  if (!currentSong) return null

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaY = touchStartY.current - e.changedTouches[0].clientY
    const deltaX = Math.abs(e.changedTouches[0].clientX - touchStartX.current)
    if (deltaY > 50 && deltaY > deltaX) {
      onExpand()
    }
  }

  return (
    <div
      className={clsx(
        'fixed bottom-0 left-0 right-0 z-40 sm:hidden',
        'border-t shadow-lg backdrop-blur-md',
        darkMode ? 'bg-[#1a1a2e]/95 border-[#2a2a4a]' : 'bg-white/95 border-green-200'
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Swipe indicator */}
      <div className="flex justify-center pt-1">
        <div className={clsx('h-1 w-8 rounded-full', darkMode ? 'bg-zinc-600' : 'bg-zinc-300')} />
      </div>

      <div className="flex items-center gap-3 px-4 py-2">
        {/* Cover */}
        {currentSong.picUrl ? (
          <img src={currentSong.picUrl} alt="" className="h-9 w-9 rounded object-cover shadow-sm flex-shrink-0" />
        ) : (
          <div className={clsx('h-9 w-9 rounded flex items-center justify-center flex-shrink-0', darkMode ? 'bg-[#2a2a4a]' : 'bg-zinc-200')}>
            <Music className="h-4 w-4 text-zinc-400" />
          </div>
        )}

        {/* Song info */}
        <div className="min-w-0 flex-1" onClick={onExpand}>
          <p className={clsx('truncate text-sm font-medium', darkMode ? 'text-zinc-200' : 'text-zinc-800')}>{currentSong.name}</p>
          <p className={clsx('truncate text-xs', darkMode ? 'text-zinc-400' : 'text-zinc-500')}>{currentSong.artists}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={togglePlay}
            className={clsx(
              'rounded-full p-2 transition-all',
              darkMode ? 'hover:bg-[#2a2a4a]' : 'hover:bg-green-100'
            )}
            aria-label={isPlaying ? '暂停' : '播放'}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 text-emerald-600" fill="currentColor" />
            ) : (
              <Play className="h-5 w-5 text-emerald-600" fill="currentColor" />
            )}
          </button>
          <button
            onClick={nextSong}
            className={clsx(
              'rounded-full p-2 transition-all',
              darkMode ? 'hover:bg-[#2a2a4a]' : 'hover:bg-green-100'
            )}
            aria-label="下一曲"
          >
            <SkipForward className={clsx('h-4 w-4', darkMode ? 'text-zinc-300' : 'text-zinc-500')} fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  )
}
