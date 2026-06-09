import { useRef, useCallback } from 'react'

interface UseSwipeOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  threshold?: number
}

export function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 50 }: UseSwipeOptions) {
  const startX = useRef(0)
  const isSwiping = useRef(false)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    isSwiping.current = true
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSwiping.current) return
    const currentX = e.touches[0].clientX
    const diff = currentX - startX.current
    if (Math.abs(diff) > threshold) {
      if (diff > 0 && onSwipeRight) {
        onSwipeRight()
      } else if (diff < 0 && onSwipeLeft) {
        onSwipeLeft()
      }
      isSwiping.current = false
    }
  }, [threshold, onSwipeLeft, onSwipeRight])

  const handleTouchEnd = useCallback(() => {
    isSwiping.current = false
  }, [])

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  }
}