import { usePlayerStore } from '@/store/playerStore'
import { Loader2 } from 'lucide-react'

export default function SongInfo() {
  const currentSong = usePlayerStore((s) => s.currentSong)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const isLoading = usePlayerStore((s) => s.isLoading)
  const darkMode = usePlayerStore((s) => s.darkMode)

  return (
    <div className="px-8 pt-8 pb-4">
      {isLoading && (
        <div className="flex items-center gap-2 text-emerald-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">加载中...</span>
        </div>
      )}
      {currentSong ? (
        <div className="animate-fade-in">
          <h1
            className={`text-3xl font-bold tracking-tight ${darkMode ? 'text-zinc-100' : 'text-zinc-900'} transition-all duration-500 ${
              isPlaying && !isLoading ? 'text-shadow-glow' : ''
            }`}
          >
            {currentSong.name}
          </h1>
          <p className={`mt-2 text-base ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>{currentSong.artists}</p>
          {currentSong.album && currentSong.platform !== 'local' && (
            <p className="mt-1 text-sm text-zinc-400">专辑：{currentSong.album}</p>
          )}
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-300">等待播放</h1>
          <p className="mt-2 text-base text-zinc-400">从左侧搜索并选择歌曲</p>
        </>
      )}
    </div>
  )
}
