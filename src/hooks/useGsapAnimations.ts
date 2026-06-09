import { useEffect } from 'react'
import gsap from 'gsap'

/**
 * 页面加载入场动效：仅针对主内容区内的卡片、文字渐显+微上浮
 * 严格限制在 <main> 内部，不影响导航栏、底部栏、迷你播放器
 */
export function useEntranceAnimation() {
  useEffect(() => {
    // 延迟执行，确保 DOM 已渲染
    const timer = setTimeout(() => {
      const mainEl = document.querySelector('main')
      if (!mainEl) return

      const ctx = gsap.context(() => {
        // 卡片入场 - 仅 main 内的 glass-card
        gsap.from('.glass-card', {
          opacity: 0,
          y: 16,
          duration: 0.5,
          stagger: 0.06,
          ease: 'power2.out',
          delay: 0.1,
        })

        // 标题入场 - 仅 main 内的 h2
        gsap.from('h2', {
          opacity: 0,
          y: 10,
          duration: 0.4,
          stagger: 0.05,
          ease: 'power2.out',
          delay: 0.05,
        })
      }, mainEl) // 限定 GSAP 作用域为 main 元素内部

      return () => ctx.revert()
    }, 50)

    return () => clearTimeout(timer)
  }, [])
}

/**
 * 交互反馈：hover 微缩放，click 轻按下
 * 使用事件委托，不修改任何原有事件处理器
 */
export function useInteractionFeedback() {
  useEffect(() => {
    // 按钮点击反馈 - 使用事件委托
    const handlePointerDown = (e: PointerEvent) => {
      const btn = (e.target as HTMLElement).closest('button')
      if (!btn || btn.disabled) return
      gsap.to(btn, {
        scale: 0.95,
        duration: 0.08,
        ease: 'power2.in',
      })
    }

    const handlePointerUp = (e: PointerEvent) => {
      const btn = (e.target as HTMLElement).closest('button')
      if (!btn || btn.disabled) return
      gsap.to(btn, {
        scale: 1,
        duration: 0.15,
        ease: 'power2.out',
      })
    }

    // glass-card hover 反馈 - 使用事件委托
    const handleMouseOver = (e: MouseEvent) => {
      const card = (e.target as HTMLElement).closest('.glass-card')
      if (!card) return
      gsap.to(card, {
        scale: 1.008,
        duration: 0.2,
        ease: 'power1.out',
      })
    }

    const handleMouseOut = (e: MouseEvent) => {
      const card = (e.target as HTMLElement).closest('.glass-card')
      if (!card) return
      gsap.to(card, {
        scale: 1,
        duration: 0.2,
        ease: 'power1.out',
      })
    }

    document.addEventListener('pointerdown', handlePointerDown, true)
    document.addEventListener('pointerup', handlePointerUp, true)
    document.addEventListener('mouseover', handleMouseOver, true)
    document.addEventListener('mouseout', handleMouseOut, true)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true)
      document.removeEventListener('pointerup', handlePointerUp, true)
      document.removeEventListener('mouseover', handleMouseOver, true)
      document.removeEventListener('mouseout', handleMouseOut, true)
    }
  }, [])
}

/**
 * 播放状态切换柔和动效
 */
export function usePlayStateAnimation(
  playButtonRef: React.RefObject<HTMLElement | null>,
  isPlaying: boolean
) {
  useEffect(() => {
    const el = playButtonRef.current
    if (!el) return
    gsap.fromTo(el,
      { scale: 0.9 },
      {
        scale: 1,
        duration: 0.3,
        ease: 'back.out(1.7)',
      }
    )
  }, [isPlaying, playButtonRef])
}
