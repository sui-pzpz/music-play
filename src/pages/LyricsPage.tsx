import { useNavigate } from 'react-router-dom'
import { usePlayerStore } from '@/store/playerStore'
import { clsx } from 'clsx'
import { X } from 'lucide-react'

const placeholderLyrics = [
  { time: 0, text: '♪ 前奏 ♪' },
  { time: 5, text: '故事的小黄花' },
  { time: 10, text: '从出生那年就飘着' },
  { time: 15, text: '童年的荡秋千' },
  { time: 20, text: '随记忆一直晃到现在' },
  { time: 25, text: 'Re So So Si Do Si La' },
  { time: 30, text: 'So La Si Si Si Si La Si La So' },
  { time: 35, text: '吹着前奏望着天空' },
  { time: 40, text: '我想起花瓣试着掉落' },
  { time: 45, text: '为你翘课的那一天' },
  { time: 50, text: '花落的那一天' },
  { time: 55, text: '教室的那一间' },
  { time: 60, text: '我怎么看不见' },
  { time: 65, text: '消失的下雨天' },
  { time: 70, text: '我好想再淋一遍' },
  { time: 75, text: '没想到失去的勇气我还留着' },
  { time: 80, text: '好想再问一遍' },
  { time: 85, text: '你会等待还是离开' },
  { time: 90, text: '刮风这天我试过握着你手' },
  { time: 95, text: '但偏偏雨渐渐大到我看你不见' },
  { time: 100, text: '还要多久我才能在你身边' },
  { time: 105, text: '等到放晴的那天也许我会比较好一点' },
  { time: 110, text: '从前从前有个人爱你很久' },
  { time: 115, text: '但偏偏风渐渐把距离吹得好远' },
  { time: 120, text: '好不容易又能再多爱一天' },
  { time: 125, text: '但故事的最后你好像还是说了拜拜' },
]

export default function LyricsPage() {
  const navigate = useNavigate()
  const darkMode = usePlayerStore((s) => s.darkMode)
  const currentLine = 10 // placeholder: highlight "吹着前奏望着天空"

  return (
    <div className={clsx(
      'fixed inset-0 z-50 flex flex-col',
      darkMode ? 'bg-black/95' : 'bg-emerald-900/95'
    )}>
      {/* Close button */}
      <div className="flex justify-end p-4">
        <button
          onClick={() => navigate(-1)}
          className={clsx(
            'w-8 h-8 rounded-full flex items-center justify-center transition-all',
            darkMode ? 'bg-white/10 text-white/70 hover:bg-white/20' : 'bg-white/10 text-white/70 hover:bg-white/20'
          )}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Lyrics area */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 overflow-y-auto">
        <div className="w-full max-w-md space-y-4 py-20">
          {placeholderLyrics.map((line, index) => (
            <p
              key={index}
              className={clsx(
                'text-center transition-all duration-500',
                index === currentLine
                  ? 'text-emerald-400 text-xl font-bold scale-105'
                  : index < currentLine
                    ? 'text-white/30 text-sm'
                    : 'text-white/50 text-base'
              )}
            >
              {line.text}
            </p>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-6 pb-8">
        <div className="w-full h-1 rounded-full bg-white/20 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-400 transition-all"
            style={{ width: `${(currentLine / placeholderLyrics.length) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-white/40">1:15</span>
          <span className="text-xs text-white/40">4:29</span>
        </div>
      </div>
    </div>
  )
}
