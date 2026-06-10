import { useEffect, useRef, useCallback } from 'react'
import { usePlayerStore } from '@/store/playerStore'
import { clsx } from 'clsx'
import { Music, Loader2 } from 'lucide-react'

interface LyricsDisplayProps {
  onSeek: (time: number) => void
}

export default function LyricsDisplay({ onSeek }: LyricsDisplayProps) {
  const lyrics = usePlayerStore((s) => s.lyrics)
  const currentLyricIndex = usePlayerStore((s) => s.currentLyricIndex)
  const currentSongIndex = usePlayerStore((s) => s.currentSongIndex)
  const isLoading = usePlayerStore((s) => s.isLoading)
  const darkMode = usePlayerStore((s) => s.darkMode)
  const containerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const isUserScrolling = useRef(false)
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleUserScroll = useCallback(() => {
    isUserScrolling.current = true
    if (scrollTimer.current) clearTimeout(scrollTimer.current)
    scrollTimer.current = setTimeout(() => {
      isUserScrolling.current = false
    }, 3000)
  }, [])

  // Cleanup scrollTimer on unmount
  useEffect(() => {
    return () => {
      if (scrollTimer.current) clearTimeout(scrollTimer.current)
    }
  }, [])

  useEffect(() => {
    if (!containerRef.current || !innerRef.current || currentLyricIndex < 0) return
    if (isUserScrolling.current) return

    const container = containerRef.current
    const activeLine = innerRef.current.children[currentLyricIndex] as HTMLElement
    if (!activeLine) return

    const containerHeight = container.clientHeight
    const lineTop = activeLine.offsetTop
    const lineHeight = activeLine.clientHeight
    const scrollTarget = lineTop - containerHeight / 2 + lineHeight / 2

    container.scrollTo({
      top: scrollTarget,
      behavior: 'smooth',
    })
  }, [currentLyricIndex])

  // 切歌时重置用户滚动状态
  useEffect(() => {
    isUserScrolling.current = false
    if (scrollTimer.current) clearTimeout(scrollTimer.current)
  }, [currentSongIndex])

  if (currentSongIndex < 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-zinc-300">
          <Music className="mx-auto mb-3 h-12 w-12" />
          <p className="text-sm">搜索歌曲开始播放</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-zinc-400">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
          <p className="text-sm">歌词加载中...</p>
        </div>
      </div>
    )
  }

  if (lyrics.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-zinc-400">暂无歌词</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleUserScroll}
      onTouchMove={handleUserScroll}

      className="h-full overflow-y-auto px-8 py-6 scrollbar-thin"
    >
      <div ref={innerRef} className="space-y-4 pt-8 pb-8">
        {lyrics.map((line, index) => {
          const distance = Math.abs(index - currentLyricIndex)
          const isActive = index === currentLyricIndex
          const isNear = distance <= 1

          return (
            <p
              key={index}
              onClick={() => onSeek(line.time)}
              className={clsx(
                'text-center transition-all duration-500 ease-out leading-relaxed cursor-pointer',
                isActive
                  ? `text-2xl font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`
                  : isNear
                    ? `text-lg font-medium ${darkMode ? 'text-zinc-300' : 'text-zinc-700'} hover:text-emerald-500`
                    : distance <= 4
                      ? `text-base ${darkMode ? 'text-zinc-400' : 'text-zinc-500'} hover:text-emerald-500`
                      : `text-sm ${darkMode ? 'text-zinc-500' : 'text-zinc-400'} hover:text-emerald-500`
              )}
              style={{
                opacity: isActive ? 1 : Math.max(0.35, 1 - distance * 0.1),
                transform: isActive ? 'scale(1.02)' : 'scale(1)',
              }}
            >
              {line.text}
            </p>
          )
        })}
      </div>
    </div>
  )
}
