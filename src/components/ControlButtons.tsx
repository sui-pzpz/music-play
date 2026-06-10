import { usePlayerStore, type PlayMode } from '@/store/playerStore'
import { Play, Pause, SkipBack, SkipForward, Repeat, Repeat1, Shuffle, ListMusic, Heart, Timer, X, ChevronUp, ChevronDown, PlayCircle } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { clsx } from 'clsx'

const playModeConfig: Record<PlayMode, { icon: typeof Repeat; label: string }> = {
  sequential: { icon: ListMusic, label: '顺序播放' },
  loop: { icon: Repeat, label: '列表循环' },
  single: { icon: Repeat1, label: '单曲循环' },
  shuffle: { icon: Shuffle, label: '随机播放' },
}

const timerOptions = [
  { label: '15分钟', value: 15 },
  { label: '30分钟', value: 30 },
  { label: '45分钟', value: 45 },
  { label: '60分钟', value: 60 },
  { label: '90分钟', value: 90 },
]

const formatTimer = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function useSleepTimer() {
  const sleepTimer = usePlayerStore((s) => s.sleepTimer)
  const tickSleepTimer = usePlayerStore((s) => s.tickSleepTimer)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const sleepTimerActive = useRef(false)

  useEffect(() => {
    if (sleepTimer > 0 && !sleepTimerActive.current) {
      sleepTimerActive.current = true
      timerRef.current = setInterval(() => {
        const current = usePlayerStore.getState().sleepTimer
        if (current <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          sleepTimerActive.current = false
        }
        tickSleepTimer()
      }, 1000)
    } else if (sleepTimer <= 0 && sleepTimerActive.current) {
      if (timerRef.current) clearInterval(timerRef.current)
      sleepTimerActive.current = false
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      sleepTimerActive.current = false
    }
  }, [sleepTimer, tickSleepTimer])

  return { sleepTimer }
}

export function MainPlaybackControls() {
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const togglePlay = usePlayerStore((s) => s.togglePlay)
  const nextSong = usePlayerStore((s) => s.nextSong)
  const prevSong = usePlayerStore((s) => s.prevSong)
  const darkMode = usePlayerStore((s) => s.darkMode)

  return (
    <div className="flex items-center gap-5">
      <button
        onClick={prevSong}
        className={`rounded-full p-2.5 text-zinc-400 transition-colors ${darkMode ? 'hover:text-zinc-200' : 'hover:text-zinc-800'} active:scale-90`}
        aria-label="上一曲"
      >
        <SkipBack className="h-5 w-5" fill="currentColor" />
      </button>

      <button
        onClick={togglePlay}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-500 hover:shadow-emerald-500/30 hover:scale-105 active:scale-95"
        aria-label={isPlaying ? '暂停' : '播放'}
      >
        {isPlaying ? (
          <Pause className="h-5 w-5" fill="currentColor" />
        ) : (
          <Play className="ml-0.5 h-5 w-5" fill="currentColor" />
        )}
      </button>

      <button
        onClick={nextSong}
        className={`rounded-full p-2.5 text-zinc-400 transition-colors ${darkMode ? 'hover:text-zinc-200' : 'hover:text-zinc-800'} active:scale-90`}
        aria-label="下一曲"
      >
        <SkipForward className="h-5 w-5" fill="currentColor" />
      </button>
    </div>
  )
}

export function SecondaryControls() {
  const playMode = usePlayerStore((s) => s.playMode)
  const cyclePlayMode = usePlayerStore((s) => s.cyclePlayMode)
  const playNextQueue = usePlayerStore((s) => s.playNextQueue)
  const clearPlayNext = usePlayerStore((s) => s.clearPlayNext)
  const addFavoritesToPlayNext = usePlayerStore((s) => s.addFavoritesToPlayNext)
  const favorites = usePlayerStore((s) => s.favorites)
  const sleepTimer = usePlayerStore((s) => s.sleepTimer)
  const setSleepTimer = usePlayerStore((s) => s.setSleepTimer)
  const darkMode = usePlayerStore((s) => s.darkMode)
  const [showQueue, setShowQueue] = useState(false)
  const [showTimer, setShowTimer] = useState(false)
  const ModeIcon = playModeConfig[playMode].icon

  return (
    <div className="flex items-center gap-3">
      {/* 播放模式 */}
      <button
        onClick={cyclePlayMode}
        className="relative rounded-full p-2.5 text-zinc-400 transition-colors hover:text-emerald-600 active:scale-90"
        aria-label={playModeConfig[playMode].label}
        title={playModeConfig[playMode].label}
      >
        <ModeIcon className="h-4 w-4" />
        {playMode === 'loop' && (
          <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-emerald-600" />
        )}
      </button>

      {/* 定时播放 */}
      <div className="relative">
        <button
          onClick={() => setShowTimer(!showTimer)}
          className={clsx('relative rounded-full p-2.5 transition-colors active:scale-90', sleepTimer > 0 ? 'text-emerald-600' : 'text-zinc-400 hover:text-emerald-600')}
          aria-label="定时播放"
          aria-expanded={showTimer}
          title={sleepTimer > 0 ? `剩余 ${formatTimer(sleepTimer)}` : '定时播放'}
        >
          <Timer className="h-4 w-4" />
          {sleepTimer > 0 && (
            <span className="absolute -right-1 -top-1 text-[9px] font-bold text-emerald-600 whitespace-nowrap">
              {formatTimer(sleepTimer)}
            </span>
          )}
        </button>

        {showTimer && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowTimer(false)} />
            <div className={clsx('absolute bottom-full right-0 z-20 mb-2 w-48 rounded-xl border p-3 shadow-xl animate-scale-in', darkMode ? 'border-[#3a3a5a] bg-[#27273a]' : 'border-green-200 bg-white')}>
              <div className={clsx('flex items-center justify-between pb-2 mb-2 border-b', darkMode ? 'border-[#3a3a5a]' : 'border-zinc-100')}>
                <span className={clsx('text-sm font-medium', darkMode ? 'text-zinc-300' : 'text-zinc-700')}>定时停止</span>
                {sleepTimer > 0 && (
                  <button
                    onClick={() => { setSleepTimer(0); setShowTimer(false) }}
                    className="text-xs text-red-500 hover:text-red-600"
                  >
                    取消定时
                  </button>
                )}
              </div>
              {sleepTimer > 0 ? (
                <div className="py-2 text-center">
                  <p className="text-2xl font-bold text-emerald-600">{formatTimer(sleepTimer)}</p>
                  <p className="text-xs text-zinc-400 mt-1">后自动暂停</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {timerOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setSleepTimer(opt.value); setShowTimer(false) }}
                      className={clsx('w-full rounded-lg px-3 py-2 text-left text-sm transition-colors', darkMode ? 'text-zinc-300 hover:bg-[#1e3a2a] hover:text-emerald-400' : 'text-zinc-600 hover:bg-green-50 hover:text-emerald-600')}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* 待播队列 */}
      <div className="relative">
        <button
          onClick={() => setShowQueue(!showQueue)}
          className="relative rounded-full p-2.5 text-zinc-400 transition-colors hover:text-emerald-600 active:scale-90"
          aria-label="待播队列"
          aria-expanded={showQueue}
          title="待播队列"
        >
          <ListMusic className="h-4 w-4" />
          {playNextQueue.length > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
              {playNextQueue.length}
            </span>
          )}
        </button>

        {showQueue && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowQueue(false)} />
            <div className={clsx('absolute bottom-full right-0 z-20 mb-2 w-64 rounded-xl border p-3 shadow-xl animate-scale-in', darkMode ? 'border-[#3a3a5a] bg-[#27273a]' : 'border-green-200 bg-white')}>
              <div className={clsx('flex items-center justify-between pb-2 mb-2 border-b', darkMode ? 'border-[#3a3a5a]' : 'border-zinc-100')}>
                <span className={clsx('text-sm font-medium', darkMode ? 'text-zinc-300' : 'text-zinc-700')}>待播队列</span>
                <div className="flex items-center gap-2">
                  {favorites.length > 0 && (
                    <button
                      onClick={addFavoritesToPlayNext}
                      className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700"
                      title="将收藏歌曲全部加入待播"
                    >
                      <Heart className="h-3 w-3" fill="currentColor" />
                      收藏全加入
                    </button>
                  )}
                  {playNextQueue.length > 0 && (
                    <button
                      onClick={clearPlayNext}
                      className="text-xs text-zinc-400 hover:text-red-500"
                    >
                      清空
                    </button>
                  )}
                </div>
              </div>
              {playNextQueue.length === 0 ? (
                <p className="py-4 text-center text-xs text-zinc-400">队列为空，在搜索结果中添加</p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-1 scrollbar-thin">
                  {playNextQueue.map((song, i) => (
                    <div
                      key={`${song.id}-${i}`}
                      className={clsx('flex items-center gap-1 rounded-lg px-2 py-1.5 text-left group animate-slide-up', darkMode ? 'hover:bg-[#1e3a2a]' : 'hover:bg-green-50')}
                    >
                      <button
                        onClick={() => usePlayerStore.getState().playFromQueue(i)}
                        className="flex-shrink-0 text-zinc-300 hover:text-emerald-600 transition-colors"
                        title="播放此歌"
                      >
                        <PlayCircle className="h-4 w-4" />
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className={clsx('truncate text-xs font-medium', darkMode ? 'text-zinc-300' : 'text-zinc-700')}>{song.name}</p>
                        <p className="truncate text-[10px] text-zinc-400">{song.artists}</p>
                      </div>
                      <button
                        onClick={() => usePlayerStore.getState().moveInPlayNext(i, i - 1)}
                        disabled={i === 0}
                        className={clsx(
                          'flex-shrink-0 text-zinc-300 hover:text-emerald-600 transition-colors disabled:invisible'
                        )}
                        title="上移"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => usePlayerStore.getState().moveInPlayNext(i, i + 1)}
                        disabled={i === playNextQueue.length - 1}
                        className={clsx(
                          'flex-shrink-0 text-zinc-300 hover:text-emerald-600 transition-colors disabled:invisible'
                        )}
                        title="下移"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => usePlayerStore.getState().removeFromPlayNext(i)}
                        className="flex-shrink-0 text-zinc-300 hover:text-red-500 transition-colors"
                        title="移除"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function ControlButtons() {
  return (
    <div className="flex items-center gap-3">
      <SecondaryControls />
      <MainPlaybackControls />
    </div>
  )
}
