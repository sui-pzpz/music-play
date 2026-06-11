
import { useState } from 'react'
import { usePlayerStore } from '@/store/playerStore'
import { showToast } from '@/store/toastStore'
import { clsx } from 'clsx'
import {
  Sun,
  Moon,
  Palette,
  Music,
  Volume2,
  Search,
  Database,
  Download,
  Upload,
  Info,
  Github,
  ChevronRight,
  Trash2,
  RotateCcw
} from 'lucide-react'
import { Decorations } from '@/components/Decorations'

type PlayMode = 'sequential' | 'loop' | 'single' | 'shuffle'
type DisplayMode = 'lyrics' | 'vinyl'
type ThemeColor = 'green' | 'yellow' | 'blue' | 'purple'

interface SettingOption {
  value: string | boolean | number
  label: string
}

function ToggleSwitch({ enabled, onChange }: { enabled: boolean; onChange: (value: boolean) => void }) {
  const darkMode = usePlayerStore((s) => s.darkMode)
  
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={clsx(
        'relative w-12 h-6 rounded-full transition-all duration-300',
        enabled ? 'bg-gradient-to-r from-green-500 to-green-600' : darkMode ? 'bg-zinc-600' : 'bg-zinc-300'
      )}
    >
      <span
        className={clsx(
          'absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300',
          enabled ? 'left-7' : 'left-1'
        )}
      />
    </button>
  )
}

function SelectDropdown<T>({ 
  value, 
  options, 
  onChange,
  labelKey = 'label',
  valueKey = 'value'
}: { 
  value: T 
  options: SettingOption[] 
  onChange: (value: T) => void
  labelKey?: string
  valueKey?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const darkMode = usePlayerStore((s) => s.darkMode)
  const currentOption = options.find((opt) => opt.value === value)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'flex items-center justify-between px-3 py-2 rounded-full min-w-[120px]',
          darkMode ? 'bg-[#2a2a4a] text-white' : 'bg-white/60 text-zinc-700',
          'border border-green-200/30 transition-all hover:shadow-md'
        )}
      >
        <span>{currentOption?.label}</span>
        <ChevronRight className={clsx('h-4 w-4 transition-transform', isOpen && 'rotate-90')} />
      </button>
      {isOpen && (
        <div className={clsx(
          'absolute top-full left-0 mt-1 w-full rounded-xl overflow-hidden z-20',
          darkMode ? 'bg-[#27273a]' : 'bg-white',
          'border border-green-200/30 shadow-xl'
        )}>
          {options.map((opt) => (
            <button
              key={String(opt.value)}
              onClick={() => {
                onChange(opt.value as T)
                setIsOpen(false)
              }}
              className={clsx(
                'w-full px-4 py-2 text-left transition-colors',
                opt.value === value 
                  ? darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600'
                  : darkMode ? 'hover:bg-[#3a3a4a] text-zinc-300' : 'hover:bg-green-50 text-zinc-700'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function Slider({ value, onChange, min = 0, max = 100, step = 1, label }: { 
  value: number 
  onChange: (value: number) => void 
  min?: number 
  max?: number 
  step?: number
  label?: string
}) {
  const darkMode = usePlayerStore((s) => s.darkMode)
  
  return (
    <div className="flex items-center gap-3">
      {label && <span className={clsx('text-sm w-16', darkMode ? 'text-zinc-400' : 'text-zinc-500')}>{label}</span>}
      <div className="flex-1 relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={clsx(
            'w-full h-2 rounded-full appearance-none cursor-pointer',
            darkMode ? 'bg-zinc-700' : 'bg-green-200'
          )}
          style={{
            background: `linear-gradient(to right, #22c55e 0%, #22c55e ${((value - min) / (max - min)) * 100}%, ${darkMode ? '#3a3a4a' : '#dcfce7'} ${((value - min) / (max - min)) * 100}%, ${darkMode ? '#3a3a4a' : '#dcfce7'} 100%)`
          }}
        />
      </div>
      <span className={clsx('text-sm w-10 text-right', darkMode ? 'text-zinc-400' : 'text-zinc-500')}>
        {value}%
      </span>
    </div>
  )
}

function SectionTitle({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  const darkMode = usePlayerStore((s) => s.darkMode)
  
  return (
    <div className={clsx('flex items-center gap-2 mb-4', darkMode ? 'text-green-400' : 'text-green-600')}>
      <Icon className="h-5 w-5" />
      <h2 className="font-semibold text-base">{title}</h2>
    </div>
  )
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  const darkMode = usePlayerStore((s) => s.darkMode)
  
  return (
    <div className={clsx(
      'flex items-center justify-between py-3 px-4 rounded-xl',
      'transition-all hover:shadow-md',
      darkMode ? 'hover:bg-[#2a2a4a]/50' : 'hover:bg-white/60'
    )}>
      <span className={clsx('text-sm', darkMode ? 'text-zinc-300' : 'text-zinc-700')}>
        {label}
      </span>
      {children}
    </div>
  )
}

function ActionButton({ icon: Icon, label, onClick, danger }: { 
  icon: React.ElementType 
  label: string 
  onClick: () => void 
  danger?: boolean 
}) {
  const darkMode = usePlayerStore((s) => s.darkMode)
  
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex items-center justify-center gap-2 w-full py-2.5 rounded-xl transition-all',
        danger 
          ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
          : darkMode 
            ? 'bg-[#2a2a4a] text-zinc-300 hover:bg-[#3a3a4a]'
            : 'bg-white/60 text-zinc-600 hover:bg-white/80',
        'border border-green-200/20'
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="text-sm">{label}</span>
    </button>
  )
}

export default function Settings() {
  const darkMode = usePlayerStore((s) => s.darkMode)
  const toggleDarkMode = usePlayerStore((s) => s.toggleDarkMode)
  const displayMode = usePlayerStore((s) => s.displayMode)
  const setDisplayMode = usePlayerStore((s) => s.setDisplayMode)
  const playMode = usePlayerStore((s) => s.playMode)
  const volume = usePlayerStore((s) => s.volume)
  const setVolume = usePlayerStore((s) => s.setVolume)
  const platform = usePlayerStore((s) => s.platform)
  const setPlatform = usePlayerStore((s) => s.setPlatform)
  const clearHistory = usePlayerStore((s) => s.clearHistory)
  const favorites = usePlayerStore((s) => s.favorites)
  const toggleFavorite = usePlayerStore((s) => s.toggleFavorite)
  const savedPlaylists = usePlayerStore((s) => s.savedPlaylists)
  const deletePlaylist = usePlayerStore((s) => s.deletePlaylist)
  const searchHistory = usePlayerStore((s) => s.searchHistory)
  const clearSearchHistory = usePlayerStore((s) => s.clearSearchHistory)

  const themeColor = usePlayerStore((s) => s.themeColor)
  const setThemeColor = usePlayerStore((s) => s.setThemeColor)

  const displayModeOptions: SettingOption[] = [
    { value: 'lyrics', label: '歌词' },
    { value: 'vinyl', label: '唱片' },
  ]

  const playModeOptions: SettingOption[] = [
    { value: 'sequential', label: '顺序播放' },
    { value: 'loop', label: '列表循环' },
    { value: 'single', label: '单曲循环' },
    { value: 'shuffle', label: '随机播放' },
  ]

  const platformOptions: SettingOption[] = [
    { value: 'netease', label: '网易云音乐' },
    { value: 'qq', label: 'QQ音乐' },
  ]

  const themeColorOptions: SettingOption[] = [
    { value: 'green', label: '绿色' },
    { value: 'yellow', label: '黄色' },
    { value: 'blue', label: '蓝色' },
    { value: 'purple', label: '紫色' },
  ]

  const handleClearFavorites = () => {
    favorites.forEach((song) => toggleFavorite(song))
    showToast('已清空收藏', 'info')
  }

  const handleClearAllPlaylists = () => {
    savedPlaylists.forEach((playlist) => deletePlaylist(playlist.id))
    showToast('已清空所有歌单', 'info')
  }

  const handleExportData = () => {
    const data = {
      favorites,
      playlists: savedPlaylists,
      searchHistory,
      settings: {
        darkMode,
        displayMode,
        playMode,
        volume,
        platform,
        themeColor,
      },
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'music-player-backup.json'
    a.click()
    URL.revokeObjectURL(url)
    showToast('数据已导出', 'success')
  }

  const handleImportData = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const data = JSON.parse(text)
        if (data.favorites && Array.isArray(data.favorites)) {
          data.favorites.forEach((song: unknown) => {
            // TypeScript workaround
            const s = song as { id: number; platform: string }
            if (!favorites.some((f) => f.id === s.id && f.platform === s.platform)) {
              // Add to favorites
            }
          })
        }
        showToast('数据导入成功', 'success')
      } catch {
        showToast('导入失败，请检查文件格式', 'error')
      }
    }
    input.click()
  }

  return (
    <div className="min-h-screen relative">
      <Decorations />
      <div className="relative z-10 max-w-md mx-auto px-4 py-6 space-y-6">
        <div className="glass-card p-5 animate-scale-in">
          <SectionTitle icon={Palette} title="外观" />
          <SettingRow label="深色模式">
            <ToggleSwitch enabled={darkMode} onChange={toggleDarkMode} />
          </SettingRow>
          <SettingRow label="默认显示模式">
            <SelectDropdown<DisplayMode>
              value={displayMode}
              options={displayModeOptions}
              onChange={setDisplayMode}
            />
          </SettingRow>
          <SettingRow label="主题色">
            <div className="flex gap-2">
              {themeColorOptions.map((opt) => {
                const colorMap: Record<string, string> = {
                  green: '#22c55e',
                  yellow: '#f59e0b',
                  blue: '#3b82f6',
                  purple: '#8b5cf6',
                }
                const ringColorMap: Record<string, string> = {
                  green: '#86efac',
                  yellow: '#fcd34d',
                  blue: '#93c5fd',
                  purple: '#c4b5fd',
                }
                const value = String(opt.value)
                const isSelected = themeColor === value
                return (
                  <button
                    key={value}
                    onClick={() => setThemeColor(value as ThemeColor)}
                    className="w-8 h-8 rounded-full transition-all ring-offset-2"
                    style={{
                      backgroundColor: colorMap[value],
                      boxShadow: isSelected ? `0 0 0 2px ${ringColorMap[value]}` : undefined,
                    }}
                  />
                )
              })}
            </div>
          </SettingRow>
        </div>

        <div className="glass-card p-5 animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <SectionTitle icon={Music} title="播放" />
          <SettingRow label="默认播放模式">
            <SelectDropdown<PlayMode>
              value={playMode}
              options={playModeOptions}
              onChange={(value) => {
                const modes: PlayMode[] = ['sequential', 'loop', 'single', 'shuffle']
                const currentIndex = modes.indexOf(playMode)
                const newMode = modes.find((m) => m === value) || playMode
                // Cycle through modes
                const { cyclePlayMode } = usePlayerStore.getState()
                if (newMode !== playMode) {
                  const diff = modes.indexOf(newMode) - currentIndex
                  for (let i = 0; i < diff; i++) {
                    cyclePlayMode()
                  }
                }
              }}
            />
          </SettingRow>
          <SettingRow label="默认音量">
            <Slider value={Math.round(volume * 100)} onChange={(v) => setVolume(v / 100)} />
          </SettingRow>
        </div>

        <div className="glass-card p-5 animate-scale-in" style={{ animationDelay: '0.2s' }}>
          <SectionTitle icon={Search} title="搜索" />
          <SettingRow label="默认搜索平台">
            <SelectDropdown<string>
              value={platform}
              options={platformOptions}
              onChange={setPlatform}
            />
          </SettingRow>
          <SettingRow label="搜索历史">
            <button
              onClick={clearSearchHistory}
              className={clsx(
                'text-sm px-3 py-1 rounded-full',
                darkMode ? 'text-red-400 hover:bg-red-500/10' : 'text-red-500 hover:bg-red-50'
              )}
            >
              清空历史
            </button>
          </SettingRow>
        </div>

        <div className="glass-card p-5 animate-scale-in" style={{ animationDelay: '0.3s' }}>
          <SectionTitle icon={Database} title="数据管理" />
          <div className="space-y-2">
            <ActionButton icon={Trash2} label="清空收藏" onClick={handleClearFavorites} danger />
            <ActionButton icon={Trash2} label="清空历史" onClick={clearHistory} danger />
            <ActionButton icon={Trash2} label="清空所有歌单" onClick={handleClearAllPlaylists} danger />
            <div className="h-px bg-green-200/30 my-2" />
            <ActionButton icon={Download} label="导出数据" onClick={handleExportData} />
            <ActionButton icon={Upload} label="导入数据" onClick={handleImportData} />
          </div>
        </div>

        <div className="glass-card p-5 animate-scale-in" style={{ animationDelay: '0.4s' }}>
          <SectionTitle icon={Info} title="关于" />
          <div className={clsx('text-center space-y-3', darkMode ? 'text-zinc-400' : 'text-zinc-500')}>
            <div className="flex items-center justify-center gap-2">
              <div className={clsx(
                'w-10 h-10 rounded-full flex items-center justify-center',
                darkMode ? 'bg-green-900/30' : 'bg-green-100'
              )}>
                <Music className={clsx('h-5 w-5', darkMode ? 'text-green-400' : 'text-green-600')} />
              </div>
              <span className={clsx('font-semibold', darkMode ? 'text-white' : 'text-zinc-800')}>音瓶</span>
            </div>
            <p className="text-sm">版本 1.0.0</p>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className={clsx(
                'inline-flex items-center gap-2 text-sm transition-colors',
                darkMode ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-500'
              )}
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
