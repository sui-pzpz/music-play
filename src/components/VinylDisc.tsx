import { useEffect, useRef } from 'react'
import { usePlayerStore } from '@/store/playerStore'
import { clsx } from 'clsx'
import { Music, Loader2 } from 'lucide-react'
import gsap from 'gsap'

export default function VinylDisc() {
  const currentSong = usePlayerStore((s) => s.currentSong)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const isLoading = usePlayerStore((s) => s.isLoading)
  const darkMode = usePlayerStore((s) => s.darkMode)

  const vinylRef = useRef<HTMLDivElement>(null)
  const vinylTweenRef = useRef<gsap.core.Tween | null>(null)

  useEffect(() => {
    const el = vinylRef.current
    if (!el) return
    const tween = gsap.to(el, {
      rotation: 360,
      duration: 8,
      repeat: -1,
      ease: 'none',
      paused: true,
    })
    vinylTweenRef.current = tween
    return () => { tween.kill() }
  }, [])

  useEffect(() => {
    const tween = vinylTweenRef.current
    if (!tween) return
    if (isPlaying && !isLoading) {
      tween.play()
    } else {
      tween.pause()
    }
  }, [isPlaying, isLoading])

  if (!currentSong) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className={`text-center ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
          <Music className="mx-auto mb-3 h-12 w-12" />
          <p className="text-sm">搜索歌曲开始播放</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 items-center justify-center px-8 py-6">
      <div className="relative animate-fade-in" key={currentSong?.id}>
        {/* 加载指示器 */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 rounded-full bg-black/30 px-6 py-4 backdrop-blur-sm">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
              <span className="text-xs text-white/80">加载中</span>
            </div>
          </div>
        )}

        {/* 唱片主体 */}
        <div
          className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 shadow-2xl shadow-black/30"
          ref={vinylRef}
          style={{
            willChange: 'transform',
          }}
        >
          {/* 唱片纹理 - 用 CSS 渐变替代 12 个 DOM 节点 */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `repeating-radial-gradient(
                circle at center,
                transparent 0px,
                transparent 8px,
                rgba(55,65,81,0.3) 8px,
                rgba(55,65,81,0.3) 9px
              )`,
            }}
          />

          {/* 唱片光泽效果 */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-transparent" />

          {/* 中心标签区域 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={clsx(
                'w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full',
                'bg-gradient-to-br from-emerald-500 to-emerald-600',
                'flex items-center justify-center',
                'shadow-inner shadow-emerald-700/50',
                'ring-4 ring-zinc-800',
                'transition-opacity duration-500'
              )}
            >
              {/* 专辑封面或默认图标 */}
              {currentSong.picUrl ? (
                <img
                  src={currentSong.picUrl}
                  alt={currentSong.name}
                  loading="lazy"
                  className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full object-cover shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-zinc-700 flex items-center justify-center">
                  <Music className="w-8 h-8 sm:w-10 sm:h-10 text-zinc-400" />
                </div>
              )}
            </div>
          </div>

          {/* 中心小圆孔 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-zinc-900 ring-1 ring-zinc-700" />
          </div>
        </div>

        {/* 唱片反光效果 */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)',
          }}
        />
      </div>

    </div>
  )
}
