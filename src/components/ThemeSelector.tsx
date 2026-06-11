import { useState } from 'react'
import { usePlayerStore } from '@/store/playerStore'
import type { ThemeColor } from '@/store/playerStore'
import { clsx } from 'clsx'
import { Palette } from 'lucide-react'

const THEMES: { key: ThemeColor; label: string; color: string; ring: string }[] = [
  { key: 'green', label: '原生绿', color: 'bg-emerald-500', ring: 'ring-emerald-300' },
  { key: 'blue', label: '晴空海洋', color: 'bg-sky-500', ring: 'ring-sky-300' },
  { key: 'yellow', label: '暖阳萌趣', color: 'bg-amber-500', ring: 'ring-amber-300' },
  { key: 'purple', label: '柔雾香芋紫', color: 'bg-violet-500', ring: 'ring-violet-300' },
]

export function ThemeSelector() {
  const themeColor = usePlayerStore((s) => s.themeColor)
  const setThemeColor = usePlayerStore((s) => s.setThemeColor)
  const darkMode = usePlayerStore((s) => s.darkMode)
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={clsx(
          'flex items-center justify-center rounded-full p-2 transition-all duration-300',
          darkMode ? 'hover:bg-[#3a3a5a] text-zinc-400' : 'hover:bg-white/60 text-zinc-500'
        )}
        title="切换主题"
      >
        <Palette className="h-4 w-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className={clsx(
            'absolute right-0 top-full z-50 mt-2 min-w-[160px] rounded-xl p-3 shadow-lg border animate-fade-in',
            darkMode ? 'bg-[#27273a] border-[#3a3a5a]' : 'bg-white border-green-200/60'
          )}>
            <p className={clsx('text-xs font-medium mb-2', darkMode ? 'text-zinc-400' : 'text-zinc-500')}>
              选择主题
            </p>
            <div className="space-y-1">
              {THEMES.map((theme) => (
                <button
                  key={theme.key}
                  onClick={() => { setThemeColor(theme.key); setOpen(false) }}
                  className={clsx(
                    'flex items-center gap-2.5 w-full rounded-lg px-2.5 py-2 text-sm transition-all',
                    themeColor === theme.key
                      ? (darkMode ? 'bg-[#3a3a5a]' : 'bg-green-50')
                      : (darkMode ? 'hover:bg-[#3a3a5a]' : 'hover:bg-green-50/50')
                  )}
                >
                  <span className={clsx(
                    'inline-block h-5 w-5 rounded-full border-2 transition-all',
                    theme.color,
                    themeColor === theme.key ? 'scale-110 border-white shadow-md' : 'border-transparent'
                  )} />
                  <span className={clsx(
                    'font-medium',
                    themeColor === theme.key
                      ? (darkMode ? 'text-white' : 'text-zinc-800')
                      : (darkMode ? 'text-zinc-400' : 'text-zinc-600')
                  )}>
                    {theme.label}
                  </span>
                  {themeColor === theme.key && (
                    <svg className="h-4 w-4 ml-auto" style={{ color: 'var(--theme-primary)' }} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
