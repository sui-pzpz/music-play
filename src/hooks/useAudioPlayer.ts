import { useEffect, useRef, useCallback } from 'react'
import { usePlayerStore, setCancelableTimeout } from '@/store/playerStore'
import { showToast } from '@/store/toastStore'

// 播放版本号，用于忽略旧的 play() Promise reject
let playVersion = 0

// 模块级单例 Audio 元素，不随组件卸载而销毁
let sharedAudio: HTMLAudioElement | null = null

// 模块级记录上一次的 audioUrl，防止组件重挂载时误判为新 URL 导致重新播放
let prevAudioUrl = ''

// 直接设置音频音量（供 store 调用，不依赖 React 组件生命周期）
export function setAudioVolume(vol: number) {
  if (sharedAudio) {
    sharedAudio.volume = Math.max(0, Math.min(1, vol))
  }
}

// 直接控制音频播放/暂停
export function toggleAudioPlay(playing: boolean) {
  if (!sharedAudio) return
  if (playing) {
    const myVersion = ++playVersion
    sharedAudio.play().catch((err) => {
      if (err.name === 'AbortError' || playVersion !== myVersion) return
      usePlayerStore.setState({ isPlaying: false, isLoading: false })
    })
  } else {
    sharedAudio.pause()
  }
}

export function useAudioPlayer() {
  const isSeekingRef = useRef(false)
  const seekTargetRef = useRef<number | null>(null)
  const pendingSeekRef = useRef<number | null>(null)
  const seekTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 精确 selector，避免订阅整个 store
  const audioUrl = usePlayerStore((s) => s.audioUrl)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const volume = usePlayerStore((s) => s.volume)
  const setCurrentTime = usePlayerStore((s) => s.setCurrentTime)
  const setDuration = usePlayerStore((s) => s.setDuration)
  const nextSong = usePlayerStore((s) => s.nextSong)

  useEffect(() => {
    if (!sharedAudio) {
      sharedAudio = new Audio()
      sharedAudio.preload = 'auto'
    }
    const audio = sharedAudio

    const handleTimeUpdate = () => {
      if (!isSeekingRef.current) {
        setCurrentTime(audio.currentTime)
      } else if (seekTargetRef.current !== null) {
        const diff = Math.abs(audio.currentTime - seekTargetRef.current)
        if (diff < 0.5) {
          isSeekingRef.current = false
          seekTargetRef.current = null
          if (seekTimeoutRef.current) { clearTimeout(seekTimeoutRef.current); seekTimeoutRef.current = null }
          setCurrentTime(audio.currentTime)
        }
      }
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
      // 恢复进度：如果有待恢复的 seek 目标，在 metadata 加载后应用
      if (pendingSeekRef.current !== null) {
        audio.currentTime = pendingSeekRef.current
        setCurrentTime(pendingSeekRef.current)
        pendingSeekRef.current = null
      }
    }

    const handleEnded = () => {
      nextSong()
    }

    const handleWaiting = () => {
      usePlayerStore.setState({ isLoading: true })
    }

    const handlePlaying = () => {
      usePlayerStore.setState({ isLoading: false })
    }

    const handleError = () => {
      const { isLoading, isPlaying, audioUrl, _skipCount } = usePlayerStore.getState()
      if (!audioUrl) return
      if (isLoading || isPlaying) {
        const newSkipCount = _skipCount + 1
        usePlayerStore.setState({ isLoading: false, isPlaying: false, _skipCount: newSkipCount })
        if (newSkipCount >= 5) {
          showToast('连续多首无法播放，已停止', 'warning')
          usePlayerStore.setState({ _skipCount: 0 })
          return
        }
        showToast('音频加载失败，自动跳过', 'warning')
        setCancelableTimeout(() => {
          usePlayerStore.getState().nextSong()
        }, 500)
      }
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('waiting', handleWaiting)
    audio.addEventListener('playing', handlePlaying)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('waiting', handleWaiting)
      audio.removeEventListener('playing', handlePlaying)
      audio.removeEventListener('error', handleError)
      // 不暂停/清空音频，保持播放状态
    }
  }, [setCurrentTime, setDuration, nextSong])

  // Consolidated effect: handle audioUrl changes and isPlaying toggles together
  useEffect(() => {
    const audio = sharedAudio
    if (!audio) return

    // 始终同步音量
    audio.volume = volume

    if (audioUrl && audioUrl !== prevAudioUrl) {
      // New URL - load and optionally play
      prevAudioUrl = audioUrl
      audio.pause()
      // 检查 store 中是否有待恢复的进度
      const { _restoreSeekTarget } = usePlayerStore.getState()
      if (_restoreSeekTarget !== null && _restoreSeekTarget > 0) {
        pendingSeekRef.current = _restoreSeekTarget
        usePlayerStore.setState({ _restoreSeekTarget: null })
      } else {
        audio.currentTime = 0
      }
      audio.src = audioUrl
      if (isPlaying) {
        const myVersion = ++playVersion
        audio.play().catch((err) => {
          // 忽略因新 play() 或 src 变化导致的 AbortError
          if (err.name === 'AbortError' || playVersion !== myVersion) return
          usePlayerStore.setState({ isPlaying: false, isLoading: false })
        })
      }
    } else if (!audioUrl && prevAudioUrl) {
      // URL cleared - stop playback
      audio.pause()
      audio.currentTime = 0
      audio.src = ''
      prevAudioUrl = ''
    } else if (audio.src && prevAudioUrl && audioUrl) {
      // No URL change, just play/pause toggle
      if (isPlaying) {
        const myVersion = ++playVersion
        audio.play().catch((err) => {
          if (err.name === 'AbortError' || playVersion !== myVersion) return
          usePlayerStore.setState({ isPlaying: false, isLoading: false })
        })
      } else {
        audio.pause()
      }
    }
  }, [audioUrl, isPlaying, volume])

  const seek = useCallback((time: number) => {
    const audio = sharedAudio
    if (!audio) return
    isSeekingRef.current = true
    seekTargetRef.current = time
    audio.currentTime = time
    setCurrentTime(time)
    // 安全兜底：3 秒后自动重置 isSeekingRef，防止进度条冻结
    if (seekTimeoutRef.current) clearTimeout(seekTimeoutRef.current)
    seekTimeoutRef.current = setTimeout(() => {
      isSeekingRef.current = false
      seekTargetRef.current = null
      seekTimeoutRef.current = null
    }, 3000)
  }, [setCurrentTime])

  const setSeeking = useCallback((seeking: boolean) => {
    isSeekingRef.current = seeking
    if (!seeking) {
      seekTargetRef.current = null
      if (seekTimeoutRef.current) { clearTimeout(seekTimeoutRef.current); seekTimeoutRef.current = null }
    }
  }, [])

  return { seek, setSeeking }
}
