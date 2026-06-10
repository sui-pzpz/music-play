import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayerStore } from '@/store/playerStore'
import { clsx } from 'clsx'
import { ArrowLeft, Download as DownloadIcon, CheckCircle, Trash2, Music } from 'lucide-react'

const placeholderDownloads = [
  { id: 1, name: '晴天', artist: '周杰伦', size: '8.2MB', status: 'done' as const },
  { id: 2, name: '稻香', artist: '周杰伦', size: '7.5MB', status: 'done' as const },
  { id: 3, name: '夜曲', artist: '周杰伦', size: '9.1MB', status: 'done' as const },
  { id: 4, name: '七里香', artist: '周杰伦', size: '8.8MB', status: 'done' as const },
  { id: 5, name: '青花瓷', artist: '周杰伦', size: '7.9MB', status: 'done' as const },
]

export default function Download() {
  const navigate = useNavigate()
  const darkMode = usePlayerStore((s) => s.darkMode)
  const [downloads, setDownloads] = useState(placeholderDownloads)
  const [usedMB] = useState(128)
  const totalMB = 2048

  const usagePercent = (usedMB / totalMB) * 100

  const handleClearCache = () => {
    setDownloads([])
  }

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

      {/* Title */}
      <div className="flex items-center gap-2 mb-4">
        <DownloadIcon className={clsx('h-6 w-6', darkMode ? 'text-emerald-400' : 'text-emerald-600')} />
        <h1 className={clsx('text-xl font-bold', darkMode ? 'text-white' : 'text-emerald-800')}>下载管理</h1>
      </div>

      {/* Storage info */}
      <div className="glass-card p-3 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className={clsx('text-xs font-medium', darkMode ? 'text-zinc-300' : 'text-emerald-700')}>存储空间</span>
          <span className={clsx('text-xs', darkMode ? 'text-zinc-500' : 'text-emerald-500/70')}>
            已使用 {usedMB}MB / {totalMB >= 1024 ? `${(totalMB / 1024).toFixed(0)}GB` : `${totalMB}MB`}
          </span>
        </div>
        <div className={clsx('h-2 rounded-full overflow-hidden', darkMode ? 'bg-[#3a3a5a]' : 'bg-green-100')}>
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all"
            style={{ width: `${usagePercent}%` }}
          />
        </div>
      </div>

      {/* Downloaded songs */}
      <div className="glass-card p-3 mb-4">
        {downloads.length === 0 ? (
          <div className={clsx('text-center py-12', darkMode ? 'text-zinc-500' : 'text-emerald-400/60')}>
            <DownloadIcon className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">暂无下载内容</p>
            <p className="text-xs mt-1">下载的歌曲会显示在这里</p>
          </div>
        ) : (
          <div className="space-y-1">
            {downloads.map((song) => (
              <div
                key={song.id}
                className={clsx(
                  'flex items-center gap-3 px-2 py-2 rounded-lg transition-colors',
                  darkMode ? 'hover:bg-[#3a3a5a]' : 'hover:bg-green-50'
                )}
              >
                <div className={clsx(
                  'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                  darkMode ? 'bg-[#2a2a4a]' : 'bg-emerald-50'
                )}>
                  {song.status === 'done' ? (
                    <CheckCircle className={clsx('h-4 w-4', darkMode ? 'text-emerald-400' : 'text-emerald-500')} />
                  ) : (
                    <DownloadIcon className={clsx('h-4 w-4', darkMode ? 'text-zinc-500' : 'text-emerald-400')} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={clsx('truncate text-sm font-medium', darkMode ? 'text-zinc-200' : 'text-emerald-800')}>{song.name}</p>
                  <p className={clsx('truncate text-xs', darkMode ? 'text-zinc-500' : 'text-emerald-500/70')}>{song.artist}</p>
                </div>
                <span className={clsx('text-xs', darkMode ? 'text-zinc-500' : 'text-emerald-400/70')}>{song.size}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Clear cache button */}
      {downloads.length > 0 && (
        <button
          onClick={handleClearCache}
          className={clsx(
            'w-full rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-all',
            darkMode
              ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50 border border-red-800/30'
              : 'bg-red-50 text-red-500 hover:bg-red-100 border border-red-200'
          )}
        >
          <Trash2 className="h-4 w-4" />
          清空缓存
        </button>
      )}
    </div>
  )
}
