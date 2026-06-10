import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayerStore } from '@/store/playerStore'
import { clsx } from 'clsx'
import { ArrowLeft, X, Heart, Pause, Play } from 'lucide-react'

export default function FM() {
  const navigate = useNavigate()
  const darkMode = usePlayerStore((s) => s.darkMode)
  const [isPlaying, setIsPlaying] = useState(false)

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

      {/* Full-screen card */}
      <div className={clsx(
        'glass-card p-6 flex flex-col items-center justify-center min-h-[70vh]',
      )}>
        {/* Subtitle */}
        <p className={clsx('text-xs mb-6', darkMode ? 'text-zinc-500' : 'text-emerald-400/70')}>
          正在为你推荐
        </p>

        {/* Large album cover */}
        <div className={clsx(
          'w-56 h-56 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg',
        )}>
          <div className={clsx(
            'w-20 h-20 rounded-full flex items-center justify-center',
            darkMode ? 'bg-black/30' : 'bg-white/30'
          )}>
            <div className="w-6 h-6 rounded-full bg-white/50" />
          </div>
        </div>

        {/* Song info */}
        <h2 className={clsx('text-lg font-bold mb-1', darkMode ? 'text-white' : 'text-emerald-800')}>晴天</h2>
        <p className={clsx('text-sm mb-8', darkMode ? 'text-zinc-400' : 'text-emerald-500/70')}>周杰伦</p>

        {/* Control buttons */}
        <div className="flex items-center gap-8 mb-8">
          <button className={clsx(
            'w-12 h-12 rounded-full flex items-center justify-center transition-all',
            darkMode ? 'bg-[#2a2a4a] text-zinc-400 hover:text-red-400 hover:bg-[#3a2a2a]' : 'bg-red-50 text-red-400 hover:text-red-500'
          )}>
            <X className="h-6 w-6" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={clsx(
              'w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg',
              darkMode
                ? 'bg-emerald-600/40 text-emerald-300 hover:bg-emerald-600/60'
                : 'bg-emerald-500 text-white hover:bg-emerald-600'
            )}
          >
            {isPlaying ? <Pause className="h-7 w-7 fill-current" /> : <Play className="h-7 w-7 fill-current ml-1" />}
          </button>
          <button className={clsx(
            'w-12 h-12 rounded-full flex items-center justify-center transition-all',
            darkMode ? 'bg-[#2a2a4a] text-zinc-400 hover:text-pink-400 hover:bg-[#3a2a3a]' : 'bg-pink-50 text-pink-400 hover:text-pink-500'
          )}>
            <Heart className="h-6 w-6" />
          </button>
        </div>

        {/* Swipe hint */}
        <p className={clsx('text-xs', darkMode ? 'text-zinc-600' : 'text-emerald-300/60')}>
          ← 左右滑动切换 →
        </p>
      </div>
    </div>
  )
}
