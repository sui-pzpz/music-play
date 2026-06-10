import { usePlayerStore } from '@/store/playerStore'
import { useCallback, useRef, useEffect, useState } from 'react'
import { clsx } from 'clsx'
import gsap from 'gsap'

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00'
  const min = Math.floor(seconds / 60)
  const sec = Math.floor(seconds % 60)
  return `${min}:${sec.toString().padStart(2, '0')}`
}

interface ProgressBarProps {
  onSeek: (time: number) => void
  onSetSeeking: (seeking: boolean) => void
}

export default function ProgressBar({ onSeek, onSetSeeking }: ProgressBarProps) {
  const currentTime = usePlayerStore((s) => s.currentTime)
  const duration = usePlayerStore((s) => s.duration)
  const isLoading = usePlayerStore((s) => s.isLoading)
  const darkMode = usePlayerStore((s) => s.darkMode)
  const [isDragging, setIsDragging] = useState(false)
  const [dragTime, setDragTime] = useState(0)
  const dragTimeRef = useRef(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const tweenRef = useRef<gsap.core.Tween | null>(null)

  const calcTimeFromX = useCallback(
    (clientX: number) => {
      const track = trackRef.current
      if (!track || duration <= 0) return 0
      const rect = track.getBoundingClientRect()
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      return ratio * duration
    },
    [duration]
  )

  const calcPercentFromX = useCallback(
    (clientX: number) => {
      const track = trackRef.current
      if (!track) return 0
      const rect = track.getBoundingClientRect()
      return Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
    },
    []
  )

  const [hoverPercent, setHoverPercent] = useState(-1)
  const [hoverTime, setHoverTime] = useState(0)

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      setIsDragging(true)
      onSetSeeking(true)
      e.currentTarget.setPointerCapture(e.pointerId)
      const time = calcTimeFromX(e.clientX)
      setDragTime(time)
      dragTimeRef.current = time
    },
    [calcTimeFromX, onSetSeeking]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (isDragging) {
        const time = calcTimeFromX(e.clientX)
        setDragTime(time)
        dragTimeRef.current = time
      } else if (duration > 0) {
        // 仅非拖拽时更新悬浮预览
        const percent = calcPercentFromX(e.clientX)
        setHoverPercent(percent)
        setHoverTime(calcTimeFromX(e.clientX))
      }
    },
    [isDragging, calcTimeFromX, calcPercentFromX, duration]
  )

  const handlePointerUp = useCallback(() => {
    if (isDragging) {
      onSeek(dragTimeRef.current)
      setIsDragging(false)
      onSetSeeking(false)
    }
  }, [isDragging, onSeek, onSetSeeking])

  const handlePointerLeave = useCallback(() => {
    setHoverPercent(-1)
  }, [])

  // 键盘操作
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const step = 5 // 5 秒步进
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        const newTime = Math.min((isDragging ? dragTime : currentTime) + step, duration)
        if (isDragging) {
          setDragTime(newTime)
        } else {
          onSeek(newTime)
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        const newTime = Math.max((isDragging ? dragTime : currentTime) - step, 0)
        if (isDragging) {
          setDragTime(newTime)
        } else {
          onSeek(newTime)
        }
      }
    },
    [currentTime, duration, isDragging, dragTime, onSeek]
  )

  useEffect(() => {
    return () => {
      onSetSeeking(false)
    }
  }, [onSetSeeking])

  const displayTime = isDragging ? dragTime : currentTime
  const progress = duration > 0 ? (displayTime / duration) * 100 : 0

  // 初始化 scaleX
  useEffect(() => {
    const el = progressRef.current
    if (!el) return
    gsap.set(el, { scaleX: 0 })
  }, [])

  // GSAP 平滑过渡动画
  useEffect(() => {
    const el = progressRef.current
    if (!el) return
    if (isDragging) {
      // 拖拽时直接设置，无动画
      gsap.set(el, { scaleX: Math.min(1, progress / 100) })
    } else {
      // GSAP 平滑过渡
      tweenRef.current = gsap.to(el, {
        scaleX: Math.min(1, progress / 100),
        duration: 0.3,
        ease: 'power2.out',
        overwrite: true,
      })
    }
  }, [progress, isDragging])

  return (
    <div className="flex items-center gap-3 px-8">
      <span className="w-10 text-right text-xs tabular-nums text-zinc-400">
        {formatTime(displayTime)}
      </span>

      <div
        ref={trackRef}
        className="group relative flex-1 cursor-pointer py-2 touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onKeyDown={handleKeyDown}
        role="slider"
        aria-label="播放进度"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={displayTime}
        aria-valuetext={formatTime(displayTime)}
        tabIndex={0}
      >
        <div className={clsx('relative h-1.5 rounded-full overflow-hidden', darkMode ? 'bg-zinc-700' : 'bg-zinc-200')}>
          {isLoading && (
            <div className="absolute h-1.5 rounded-full bg-emerald-300/50 animate-pulse" style={{ width: '30%' }} />
          )}
          <div
            ref={progressRef}
            className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 origin-left"
          />
        </div>

        {/* 拖拽手柄 */}
        <div
          className="pointer-events-none absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-600 shadow-md shadow-emerald-600/30 transition-opacity group-hover:opacity-100"
          style={{
            left: `${Math.min(100, progress)}%`,
            opacity: isDragging ? 1 : undefined,
          }}
        />

        {/* 悬浮时间预览气泡 */}
        {hoverPercent >= 0 && !isDragging && duration > 0 && (
          <div
            className="pointer-events-none absolute -top-8 -translate-x-1/2 rounded bg-emerald-800 px-2 py-1 text-[10px] text-white shadow-lg"
            style={{ left: `${hoverPercent}%` }}
          >
            {formatTime(hoverTime)}
            <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-emerald-800" />
          </div>
        )}
      </div>

      <span className="w-10 text-xs tabular-nums text-zinc-400">
        {formatTime(duration)}
      </span>
    </div>
  )
}
