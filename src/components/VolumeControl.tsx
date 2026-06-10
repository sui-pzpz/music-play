import { usePlayerStore } from '@/store/playerStore'
import { Volume2, Volume1, VolumeX } from 'lucide-react'
import { useState, useCallback, useRef } from 'react'
import { clsx } from 'clsx'

export default function VolumeControl() {
  const volume = usePlayerStore((s) => s.volume)
  const setVolume = usePlayerStore((s) => s.setVolume)
  const toggleMute = usePlayerStore((s) => s.toggleMute)
  const darkMode = usePlayerStore((s) => s.darkMode)
  const [showSlider, setShowSlider] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)

  const isMuted = volume === 0

  const VolumeIcon = isMuted ? VolumeX : volume < 0.5 ? Volume1 : Volume2

  const handleSliderClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const ratio = Math.max(0, Math.min(1, x / rect.width))
    setVolume(ratio)
  }, [setVolume])

  const handleSliderTouch = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.touches[0].clientX - rect.left
    const ratio = Math.max(0, Math.min(1, x / rect.width))
    setVolume(ratio)
  }, [setVolume])

  return (
    <div className="relative flex items-center gap-1">
      <button
        onClick={() => setShowSlider(!showSlider)}
        className={clsx('rounded-full p-2.5 text-zinc-400 transition-colors active:scale-90', darkMode ? 'hover:text-zinc-200' : 'hover:text-zinc-700')}
        aria-label={isMuted ? '取消静音' : '调节音量'}
      >
        <VolumeIcon className="h-4 w-4" />
      </button>

      {/* 手机端：点击音量图标弹出滑块 */}
      {showSlider && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowSlider(false)} />
          <div
            ref={sliderRef}
            className={clsx(
              'absolute bottom-full mb-2 z-20 w-40 rounded-xl border p-3 shadow-xl animate-scale-in',
              darkMode ? 'border-[#3a3a5a] bg-[#27273a]' : 'border-green-200 bg-white'
            )}
          >
            <div
              className="relative h-6 flex items-center cursor-pointer"
              onClick={handleSliderClick}
              onTouchMove={handleSliderTouch}
              onTouchStart={handleSliderTouch}
            >
              <div className={clsx('h-1.5 w-full rounded-full', darkMode ? 'bg-zinc-600' : 'bg-zinc-200')}>
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${volume * 100}%` }}
                />
              </div>
              <div
                className="absolute h-4 w-4 rounded-full bg-white border-2 border-emerald-500 shadow-sm -translate-x-1/2"
                style={{ left: `${volume * 100}%` }}
              />
            </div>
            <p className="text-center text-[10px] mt-1 text-zinc-400">{Math.round(volume * 100)}%</p>
          </div>
        </>
      )}

      {/* 桌面端：内联滑块 */}
      <div className="group relative w-24 hidden sm:block">
        <div className={clsx('h-1 rounded-full', darkMode ? 'bg-zinc-600' : 'bg-zinc-200')}>
          <div
            className="h-full rounded-full bg-zinc-400 transition-colors group-hover:bg-emerald-500"
            style={{ width: `${volume * 100}%` }}
          />
        </div>

        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          aria-label="音量"
        />
      </div>
    </div>
  )
}
