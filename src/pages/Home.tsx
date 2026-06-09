import { useState, useCallback, useRef, useEffect } from 'react'
import { usePlayerStore } from '@/store/playerStore'
import { SongRow, CollapsibleSection } from '@/components/PlaylistPanel'
import { Search, Loader2, Sparkles, Compass, RefreshCw, History, X, Music, FolderOpen, ImageIcon } from 'lucide-react'
import { clsx } from 'clsx'
import type { MusicPlatform } from '@/types'


export default function Home() {
  const search = usePlayerStore((s) => s.search)
  const isSearching = usePlayerStore((s) => s.isSearching)
  const setSearchKeyword = usePlayerStore((s) => s.setSearchKeyword)
  const platform = usePlayerStore((s) => s.platform)
  const setPlatform = usePlayerStore((s) => s.setPlatform)
  const playlist = usePlayerStore((s) => s.playlist)
  const currentSongIndex = usePlayerStore((s) => s.currentSongIndex)
  const playSong = usePlayerStore((s) => s.playSong)
  const addToPlayNext = usePlayerStore((s) => s.addToPlayNext)
  const toggleFavorite = usePlayerStore((s) => s.toggleFavorite)
  const favorites = usePlayerStore((s) => s.favorites)
  const history = usePlayerStore((s) => s.history)
  const searchHistory = usePlayerStore((s) => s.searchHistory)
  const clearSearchHistory = usePlayerStore((s) => s.clearSearchHistory)
  const removeSearchHistoryItem = usePlayerStore((s) => s.removeSearchHistoryItem)
  const smartRecommend = usePlayerStore((s) => s.smartRecommend)
  const smartRecommendLoading = usePlayerStore((s) => s.smartRecommendLoading)
  const loadSmartRecommend = usePlayerStore((s) => s.loadSmartRecommend)
  const playSmartRecommend = usePlayerStore((s) => s.playSmartRecommend)
  const isRoaming = usePlayerStore((s) => s.isRoaming)
  const roamSongs = usePlayerStore((s) => s.roamSongs)
  const roamLoading = usePlayerStore((s) => s.roamLoading)
  const toggleRoaming = usePlayerStore((s) => s.toggleRoaming)
  const loadRoamSongs = usePlayerStore((s) => s.loadRoamSongs)
  const playRoamSong = usePlayerStore((s) => s.playRoamSong)
  const removeRoamSong = usePlayerStore((s) => s.removeRoamSong)
  const _roamPlayIndex = usePlayerStore((s) => s._roamPlayIndex)
  const darkMode = usePlayerStore((s) => s.darkMode)
  const addLocalSongs = usePlayerStore((s) => s.addLocalSongs)
  const ocrLoading = usePlayerStore((s) => s.ocrLoading)
  const ocrProgress = usePlayerStore((s) => s.ocrProgress)
  const ocrSongs = usePlayerStore((s) => s.ocrSongs)
  const recognizeAndSearch = usePlayerStore((s) => s.recognizeAndSearch)
  const addOcrSongsToPlaylist = usePlayerStore((s) => s.addOcrSongsToPlaylist)
  const clearOcrSongs = usePlayerStore((s) => s.clearOcrSongs)

  const [inputValue, setInputValue] = useState('')
  const [searchInputFocused, setSearchInputFocused] = useState(false)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})
  const [showOcrResult, setShowOcrResult] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const ocrInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (smartRecommend.length === 0 && (favorites.length > 0 || history.length > 0)) {
      loadSmartRecommend()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = useCallback(() => {
    if (!inputValue.trim()) return
    setSearchKeyword(inputValue)
    search(inputValue)
  }, [inputValue, setSearchKeyword, search])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }, [handleSearch])

  const handlePlatformChange = useCallback((p: MusicPlatform) => {
    setPlatform(p)
    if (inputValue.trim()) {
      setSearchKeyword(inputValue)
      search(inputValue)
    }
  }, [inputValue, setPlatform, setSearchKeyword, search])

  const searchKeyword = usePlayerStore((s) => s.searchKeyword)

  const isFav = (songId: number, p?: string) => favorites.some((s) => s.id === songId && (p === undefined || s.platform === p))
  const toggleSection = (key: string) => setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }))

  const playOcrSong = useCallback((index: number) => {
    const song = ocrSongs[index]
    if (!song) return
    const { playlist: pl, currentSongIndex: csi } = usePlayerStore.getState()
    const existingIndex = pl.findIndex((s) => s.id === song.id && s.platform === song.platform)
    if (existingIndex >= 0) {
      usePlayerStore.getState().playSong(existingIndex)
    } else {
      let newPlaylist: typeof pl
      let adjustedIndex = csi
      if (pl.length >= 200) {
        const removeIndex = csi === 0 ? 1 : 0
        newPlaylist = [...pl.slice(0, removeIndex), ...pl.slice(removeIndex + 1), song]
        adjustedIndex = csi > removeIndex ? csi - 1 : csi
      } else {
        newPlaylist = [...pl, song]
      }
      usePlayerStore.setState({ playlist: newPlaylist, currentSongIndex: adjustedIndex })
      usePlayerStore.getState().playSong(newPlaylist.length - 1)
    }
  }, [ocrSongs])

  return (
    <div className="px-4 pb-4">
      {/* 搜索区 */}
      <div className="mb-4">
          {/* 平台切换 - 米白底色+浅绿边框，选中浅绿填充 */}
          <div className="flex gap-1 mb-2">
            <button
              onClick={() => handlePlatformChange('netease')}
              className={clsx(
                'rounded-lg px-2.5 py-1 text-xs font-medium transition-all border',
                platform === 'netease'
                  ? (darkMode ? 'bg-emerald-600/80 text-white border-emerald-500' : 'bg-emerald-500 text-white border-emerald-400')
                  : (darkMode ? 'bg-[#27273a] text-zinc-400 border-[#3a3a5a] hover:bg-[#3a3a5a]' : 'bg-white/80 text-emerald-700 border-green-200 hover:bg-green-50')
              )}
            >
              网易云
            </button>
            <button
              onClick={() => handlePlatformChange('qq')}
              className={clsx(
                'rounded-lg px-2.5 py-1 text-xs font-medium transition-all border',
                platform === 'qq'
                  ? (darkMode ? 'bg-emerald-600/80 text-white border-emerald-500' : 'bg-emerald-500 text-white border-emerald-400')
                  : (darkMode ? 'bg-[#27273a] text-zinc-400 border-[#3a3a5a] hover:bg-[#3a3a5a]' : 'bg-white/80 text-emerald-700 border-green-200 hover:bg-green-50')
              )}
            >
              QQ音乐
            </button>
          </div>

        {/* 搜索框 - 米白底+浅绿边框，深绿放大镜，浅绿搜索按钮 */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className={clsx(
                'absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-all duration-300',
                searchInputFocused 
                  ? 'text-emerald-500 scale-110' 
                  : 'text-emerald-600/60'
              )} />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setSearchInputFocused(true)}
              onBlur={() => setTimeout(() => setSearchInputFocused(false), 150)}
              onKeyDown={handleKeyDown}
              placeholder={`在${platform === 'netease' ? '网易云音乐' : 'QQ音乐'}搜索...`}
              className={clsx(
                'w-full rounded-xl py-2.5 pl-9 pr-3 text-sm outline-none transition-all duration-300',
                darkMode
                  ? 'bg-[#27273a]/80 text-zinc-200 border border-[#3a3a5a] placeholder:text-zinc-500 focus:border-emerald-500/50 focus:shadow-[0_0_0_3px_rgba(115,153,104,0.1)]'
                  : 'bg-white/80 text-emerald-900 border border-green-200/60 placeholder:text-emerald-300 focus:border-emerald-400/60 focus:shadow-[0_0_0_3px_rgba(115,153,104,0.1)]'
              )}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className={clsx(
              'flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 disabled:opacity-50',
              darkMode 
                ? 'bg-emerald-600/80 text-white hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/20' 
                : 'bg-gradient-to-br from-emerald-500 to-emerald-400 text-white hover:from-emerald-400 hover:to-emerald-300 hover:shadow-lg hover:shadow-emerald-500/25'
            )}
          >
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </button>
        </div>

        {/* 搜索历史 */}
        {searchInputFocused && !inputValue.trim() && searchHistory.length > 0 && (
          <div className={clsx(
            'mt-2 rounded-xl p-3 animate-fade-in',
            darkMode ? 'bg-[#27273a]' : 'bg-white/80'
          )}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <History className="h-3.5 w-3.5 text-emerald-500/60" />
                <p className={clsx('text-xs font-medium', darkMode ? 'text-zinc-400' : 'text-emerald-600/70')}>搜索历史</p>
              </div>
              <button
                onMouseDown={(e) => { e.preventDefault(); clearSearchHistory() }}
                className={clsx(
                  'text-xs font-medium transition-colors',
                  darkMode ? 'text-zinc-500 hover:text-zinc-300' : 'text-emerald-400 hover:text-emerald-600'
                )}
              >
                清空
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {searchHistory.map((keyword) => (
                <div
                  key={keyword}
                  className={clsx(
                    'group flex items-center gap-1 rounded-full px-2.5 py-1 transition-colors',
                    darkMode ? 'bg-[#1e1e3a] hover:bg-[#3a3a5a]' : 'bg-green-50/80 hover:bg-green-100'
                  )}
                >
                  <button
                    onMouseDown={(e) => { e.preventDefault(); setInputValue(keyword); setSearchKeyword(keyword); search(keyword) }}
                    className={clsx('text-xs truncate max-w-[120px]', darkMode ? 'text-zinc-300' : 'text-emerald-700')}
                  >
                    {keyword}
                  </button>
                  <button
                    onMouseDown={(e) => { e.preventDefault(); removeSearchHistoryItem(keyword) }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400 hover:text-emerald-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 工具按钮 - 米白底+浅绿边框，深绿文字 */}
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className={clsx(
              'flex-1 flex items-center justify-center gap-1 rounded-xl py-2 text-xs font-medium border transition-all',
              darkMode ? 'bg-[#27273a] text-zinc-400 border-[#3a3a5a] hover:bg-[#3a3a5a]' : 'bg-white/80 text-emerald-700 border-green-200 hover:bg-green-50'
            )}
          >
            <FolderOpen className="h-3.5 w-3.5" />
            导入本地
          </button>
          <button
            onClick={() => ocrInputRef.current?.click()}
            disabled={ocrLoading}
            className={clsx(
              'flex-1 flex items-center justify-center gap-1 rounded-xl py-2 text-xs font-medium border transition-all disabled:opacity-50',
              darkMode ? 'bg-[#27273a] text-zinc-400 border-[#3a3a5a] hover:bg-[#3a3a5a]' : 'bg-white/80 text-emerald-700 border-green-200 hover:bg-green-50'
            )}
          >
            {ocrLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageIcon className="h-3.5 w-3.5" />}
            {ocrLoading ? (ocrProgress || '识别中') : '图片识别歌单'}
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          multiple
          onChange={(e) => {
            const files = e.target.files
            if (files && files.length > 0) {
              addLocalSongs(Array.from(files))
              e.target.value = ''
            }
          }}
          className="hidden"
        />
        <input
          ref={ocrInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              const reader = new FileReader()
              reader.onload = (ev) => {
                const result = ev.target?.result as string
                const base64 = result.split(',')[1]
                if (base64) {
                  recognizeAndSearch(base64, file.type || 'image/jpeg')
                  setShowOcrResult(true)
                }
              }
              reader.readAsDataURL(file)
              e.target.value = ''
            }
          }}
          className="hidden"
        />

        {/* OCR 识别结果 */}
        {ocrSongs.length > 0 && showOcrResult && (
          <div className={clsx('mt-2 rounded-xl border p-3 animate-slide-up', darkMode ? 'border-[#3a3a5a] bg-[#1e1e3a]/50' : 'border-green-200 bg-green-50/50')}>
            <div className="flex items-center justify-between mb-2">
              <p className={clsx('text-xs font-medium', darkMode ? 'text-emerald-400' : 'text-emerald-700')}>识别到 {ocrSongs.length} 首歌</p>
              <button onClick={() => { clearOcrSongs(); setShowOcrResult(false) }} className={clsx('hover:text-emerald-600', darkMode ? 'text-zinc-500' : 'text-emerald-400')}>
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="max-h-32 overflow-y-auto space-y-1 scrollbar-thin">
              {ocrSongs.map((song, i) => (
                <div
                  key={`${song.id}-${i}`}
                  onClick={() => playOcrSong(i)}
                  className={clsx('flex items-center gap-2 rounded-lg px-2 py-1 cursor-pointer', darkMode ? 'hover:bg-[#3a3a5a]' : 'hover:bg-green-100/50')}
                >
                  <span className="text-[10px] text-emerald-400 w-4 text-center">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className={clsx('truncate text-xs font-medium', darkMode ? 'text-zinc-300' : 'text-emerald-800')}>{song.name}</p>
                    <p className="truncate text-[10px] text-emerald-400/70">{song.artists}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => { addOcrSongsToPlaylist(); setShowOcrResult(false) }}
              className="mt-2 w-full rounded-lg bg-emerald-500 py-1.5 text-xs font-medium text-white hover:bg-emerald-400 transition-colors"
            >
              全部加入待播队列
            </button>
          </div>
        )}
      </div>

      {/* 搜索结果 - 仅在有搜索关键词时显示 */}
      {playlist.length > 0 && searchKeyword && (
        <div className="glass-card p-3 mb-4 animate-fade-in">
          <div className={clsx('flex items-center justify-between mb-2', darkMode ? 'text-zinc-400' : 'text-emerald-600/70')}>
            <p className="text-xs font-medium">搜索结果 · {playlist.length}首</p>
            <button
              onClick={() => { usePlayerStore.setState({ searchKeyword: '', playlist: [] }); setInputValue('') }}
              className="text-xs hover:text-emerald-500 transition-colors flex items-center gap-1"
            >
              <X className="h-3 w-3" />清除搜索
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto scrollbar-thin">
            {playlist.map((song, index) => (
              <SongRow
                key={`${song.platform}-${song.mid || song.id}`}
                song={song}
                index={index}
                isActive={currentSongIndex === index}
                onPlay={() => playSong(index)}
                onFavorite={() => toggleFavorite(song)}
                onAddNext={() => addToPlayNext(song)}
                onAddToPlaylist={() => {}}
                isFav={isFav(song.id, song.platform)}
                platformTag
                darkMode={darkMode}
              />
            ))}
          </div>
        </div>
      )}

      {/* 猜你喜欢 - 深青绿标题，去掉紫色 */}
      <div className="glass-card p-4 mb-4 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 opacity-20">
            <svg width="60" height="60" viewBox="0 0 40 40" fill="none" className="text-emerald-500">
              <path d="M0,20 Q10,10 20,20 Q30,30 40,20" stroke="currentColor" strokeWidth="0.8" />
              <path d="M0,25 Q10,15 20,25 Q30,35 40,25" stroke="currentColor" strokeWidth="0.6" />
            </svg>
          </div>
          <div className="absolute top-2 right-2 opacity-15">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" className="text-emerald-500">
              <path d="M12 22C6 16 2 12 2 8c0-2.2 1.8-4 4-4 2 0 4 1 5 3 1-2 3-3 5-3 2.2 0 4 1.8 4 4 0 4-4 8-10 14z" />
            </svg>
          </div>
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className={clsx('flex items-center gap-2', darkMode ? 'text-emerald-400' : 'text-emerald-700')}>
              <Sparkles className="h-5 w-5" />
              <h2 className="font-semibold">猜你喜欢</h2>
              {smartRecommend.length > 0 && (
                <span className="text-xs text-emerald-400/70">{smartRecommend.length}首</span>
              )}
            </div>
            {(favorites.length > 0 || history.length > 0) && (
              <button
                onClick={() => { usePlayerStore.setState({ smartRecommend: [] }); loadSmartRecommend() }}
                disabled={smartRecommendLoading}
                className="flex items-center gap-1 text-xs text-emerald-400/70 hover:text-emerald-600 disabled:opacity-50"
              >
                <RefreshCw className={clsx('h-3.5 w-3.5', smartRecommendLoading && 'animate-spin')} />
                换一批
              </button>
            )}
          </div>
        {favorites.length === 0 && history.length === 0 ? (
          <div className={clsx('text-center py-8', darkMode ? 'text-zinc-500' : 'text-emerald-400/60')}>
            <Music className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">收藏或播放歌曲后即可推荐</p>
          </div>
        ) : smartRecommendLoading && smartRecommend.length === 0 ? (
          <div className={clsx('flex items-center justify-center py-6', darkMode ? 'text-zinc-500' : 'text-emerald-400/60')}>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-xs">正在发现新音乐...</span>
          </div>
        ) : smartRecommend.length === 0 ? (
          <div className={clsx('text-center py-6', darkMode ? 'text-zinc-500' : 'text-emerald-400/60')}>
            <p className="text-xs">暂无推荐，点击换一批试试</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {smartRecommend.map((song, index) => (
              <SongRow
                key={`sr-${song.platform}-${song.mid || song.id}`}
                song={song}
                index={index}
                onPlay={() => playSmartRecommend(index)}
                onFavorite={() => toggleFavorite(song)}
                onAddNext={() => addToPlayNext(song)}
                onAddToPlaylist={() => {}}
                isFav={isFav(song.id, song.platform)}
                compact
                darkMode={darkMode}
              />
            ))}
          </div>
        )}
      </div>

      {/* 音乐漫游 - 深青绿标题，去掉蓝色/橙色 */}
      <div className="glass-card p-4 relative overflow-hidden">
        <div className="absolute bottom-0 right-0 opacity-20">
          <svg width="60" height="60" viewBox="0 0 40 40" fill="none" className="text-emerald-500">
            <path d="M40,20 Q30,10 20,20 Q10,30 0,20" stroke="currentColor" strokeWidth="0.8" />
            <path d="M40,25 Q30,15 20,25 Q10,35 0,25" stroke="currentColor" strokeWidth="0.6" />
          </svg>
        </div>
        <div className="absolute bottom-2 left-2 opacity-15">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" className="text-emerald-500">
            <path d="M12 22C6 16 2 12 2 8c0-2.2 1.8-4 4-4 2 0 4 1 5 3 1-2 3-3 5-3 2.2 0 4 1.8 4 4 0 4-4 8-10 14z" />
          </svg>
        </div>
        <div className="flex items-center justify-between mb-3 relative z-10">
          <div className={clsx('flex items-center gap-2', darkMode ? 'text-emerald-400' : 'text-emerald-700')}>
            <Compass className={clsx('h-5 w-5', isRoaming && 'animate-spin')} />
            <h2 className="font-semibold">音乐漫游</h2>
            {isRoaming && roamSongs.length > 0 && (
              <span className="text-xs text-emerald-400/70">{roamSongs.length}首</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isRoaming && (
              <button
                onClick={() => { usePlayerStore.setState({ roamSongs: [] }); loadRoamSongs() }}
                disabled={roamLoading}
                className="flex items-center gap-1 text-xs text-emerald-400/70 hover:text-emerald-600 disabled:opacity-50"
              >
                <RefreshCw className={clsx('h-3.5 w-3.5', roamLoading && 'animate-spin')} />
                换一批
              </button>
            )}
            <button
              onClick={toggleRoaming}
              disabled={favorites.length === 0 && history.length === 0}
              className={clsx(
                'text-xs px-4 py-1.5 rounded-full font-medium transition-all disabled:opacity-40',
                isRoaming
                  ? (darkMode ? 'bg-emerald-900/50 text-emerald-300 hover:bg-emerald-800/50' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200')
                  : (darkMode ? 'bg-[#1e2a3a] text-emerald-400 hover:bg-[#2a3a4a]' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100')
              )}
            >
              {isRoaming ? '停止漫游' : '开始漫游'}
            </button>
          </div>
        </div>
        {favorites.length === 0 && history.length === 0 ? (
          <div className={clsx('text-center py-8', darkMode ? 'text-zinc-500' : 'text-emerald-400/60')}>
            <Compass className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">收藏或播放歌曲后即可漫游</p>
          </div>
        ) : roamLoading && roamSongs.length === 0 ? (
          <div className={clsx('flex items-center justify-center py-6', darkMode ? 'text-zinc-500' : 'text-emerald-400/60')}>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-xs">正在发现新音乐...</span>
          </div>
        ) : roamSongs.length === 0 ? (
          <div className={clsx('text-center py-6', darkMode ? 'text-zinc-500' : 'text-emerald-400/60')}>
            <p className="text-xs">点击"开始漫游"探索新音乐</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {roamSongs.map((song, index) => (
              <SongRow
                key={`roam-${song.platform}-${song.mid || song.id}`}
                song={song}
                index={index}
                isActive={isRoaming && index === _roamPlayIndex}
                onPlay={() => playRoamSong(index)}
                onFavorite={() => toggleFavorite(song)}
                onAddNext={() => addToPlayNext(song)}
                onAddToPlaylist={() => {}}
                isFav={isFav(song.id, song.platform)}
                onDelete={() => removeRoamSong(index)}
                compact
                darkMode={darkMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
