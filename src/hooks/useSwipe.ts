import { useRef, useCallback } from 'react'

interface SwipeHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
}

export function useSwipe({ onSwipeLeft, onSwipeRight }: SwipeHandlers) {
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const touching = useRef(false)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    touching.current = true

    // Check if touch started on a scrollable element
    const target = e.target as HTMLElement
    const scrollableEl = target.closest('[style*="overflow"], .scrollbar-thin, .overflow-y-auto, .overflow-auto, [class*="overflow-y"]')
    if (scrollableEl && scrollableEl.scrollHeight > scrollableEl.clientHeight) {
      touching.current = false  // Don't track swipe for scrollable areas
    }
  }, [])

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touching.current) return
    touching.current = false

    const deltaX = e.changedTouches[0].clientX - touchStartX.current
    const deltaY = e.changedTouches[0].clientY - touchStartY.current

    // Only trigger if horizontal swipe is dominant and distance > 80px
    if (Math.abs(deltaX) > 80 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX > 0) {
        onSwipeRight?.()
      } else {
        onSwipeLeft?.()
      }
    }
  }, [onSwipeLeft, onSwipeRight])

  return { onTouchStart, onTouchEnd }
}
