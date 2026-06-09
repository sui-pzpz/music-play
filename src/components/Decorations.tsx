import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { clsx } from 'clsx'

/* 森系蝴蝶 - GSAP动画：翅膀扇动 + 缓慢飘动 + 轻微摇摆 */
function Butterfly({ position, delay = 0 }: { position: 'top-left' | 'top-right'; delay?: number }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const leftWingRef = useRef<SVGGElement>(null)
  const rightWingRef = useRef<SVGGElement>(null)

  useEffect(() => {
    if (!containerRef.current || !leftWingRef.current || !rightWingRef.current) return

    const basePositions: Record<string, { left?: string; right?: string; top: string }> = {
      'top-left': { left: `${5 + Math.random() * 12}%`, top: `${6 + Math.random() * 10}%` },
      'top-right': { right: `${5 + Math.random() * 12}%`, top: `${6 + Math.random() * 10}%` },
    }
    gsap.set(containerRef.current, { ...basePositions[position], opacity: 0 })
    gsap.to(containerRef.current, { opacity: 0.55, duration: 1, delay })

    // 翅膀扇动
    const wingFlap = gsap.timeline({ repeat: -1, yoyo: true, delay })
    wingFlap
      .to(leftWingRef.current, { scaleX: 0.55, duration: 0.28, ease: 'power2.inOut', transformOrigin: 'center right' }, 0)
      .to(rightWingRef.current, { scaleX: 0.55, duration: 0.28, ease: 'power2.inOut', transformOrigin: 'center left' }, 0)
      .to(leftWingRef.current, { scaleX: 1, duration: 0.32, ease: 'power2.out', transformOrigin: 'center right' }, 0.28)
      .to(rightWingRef.current, { scaleX: 1, duration: 0.32, ease: 'power2.out', transformOrigin: 'center left' }, 0.28)

    // 缓慢飘动
    const floatX = 12 + Math.random() * 12
    const floatY = 8 + Math.random() * 8
    const floatDur = 10 + Math.random() * 6
    const floating = gsap.timeline({ repeat: -1, yoyo: true, delay: delay + 0.5 })
    floating
      .to(containerRef.current, { x: floatX, y: -floatY, duration: floatDur, ease: 'sine.inOut' })
      .to(containerRef.current, { x: -floatX * 0.7, y: floatY * 0.9, duration: floatDur, ease: 'sine.inOut' })

    // 轻微摇摆
    const sway = gsap.timeline({ repeat: -1, yoyo: true, delay: delay + 1 })
    sway.to(containerRef.current, { rotation: 10 + Math.random() * 6, duration: 4 + Math.random() * 3, ease: 'sine.inOut' })
    sway.to(containerRef.current, { rotation: -(8 + Math.random() * 6), duration: 4 + Math.random() * 3, ease: 'sine.inOut' })

    return () => {
      wingFlap.kill()
      floating.kill()
      sway.kill()
    }
  }, [position, delay])

  return (
    <div
      ref={containerRef}
      className="fixed pointer-events-none z-10"
      style={{ opacity: 0 }}
    >
      <svg width="46" height="46" viewBox="0 0 32 32" fill="none" className="text-emerald-400">
        {/* 左翅渐变 */}
        <g ref={leftWingRef}>
          <defs>
            <linearGradient id={`wing-gradient-left-${position}-${delay}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.7" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <path d="M16 14C12 10 6 8 4 12C2 16 6 20 10 20C12 20 14 18 16 16" fill={`url(#wing-gradient-left-${position}-${delay})`} />
          <path d="M10 13C9 11 7 10 5 12" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
          <path d="M12 15C11 14 9 13 8 15" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
        </g>
        {/* 右翅渐变 */}
        <g ref={rightWingRef}>
          <defs>
            <linearGradient id={`wing-gradient-right-${position}-${delay}`} x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.7" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <path d="M16 14C20 10 26 8 28 12C30 16 26 20 22 20C20 20 18 18 16 16" fill={`url(#wing-gradient-right-${position}-${delay})`} />
          <path d="M22 13C23 11 25 10 27 12" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
          <path d="M20 15C21 14 23 13 24 15" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
        </g>
        {/* 身体 */}
        <ellipse cx="16" cy="16" rx="1.2" ry="4" fill="currentColor" opacity="0.8" />
        {/* 身体高光 */}
        <ellipse cx="15.5" cy="15" rx="0.4" ry="1.5" fill="white" opacity="0.3" />
        {/* 触角 */}
        <path d="M16 12C14.5 8 12.5 5 11 4" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
        <path d="M16 12C17.5 8 19.5 5 21 4" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
        {/* 触角末端 */}
        <circle cx="11" cy="4" r="1" fill="currentColor" opacity="0.5" />
        <circle cx="21" cy="4" r="1" fill="currentColor" opacity="0.5" />
      </svg>
    </div>
  )
}

/* 树叶剪影 - GSAP动画：缓慢旋转 + 轻微浮动 */
function LeafSilhouette({ position }: { position: 'bottom-left' | 'bottom-right' }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const basePositions: Record<string, React.CSSProperties> = {
      'bottom-left': { bottom: '80px', left: '12px' },
      'bottom-right': { bottom: '80px', right: '12px' },
    }
    gsap.set(containerRef.current, basePositions[position])

    // 缓慢旋转
    const rotDur = 15 + Math.random() * 5
    const rotation = gsap.timeline({ repeat: -1 })
    rotation.to(containerRef.current, { rotation: 360, duration: rotDur, ease: 'none' })

    // 轻微浮动
    const floatY = 6 + Math.random() * 6
    const floatDur = 5 + Math.random() * 3
    const floating = gsap.timeline({ repeat: -1, yoyo: true })
    floating.to(containerRef.current, { y: -floatY, duration: floatDur, ease: 'sine.inOut' })

    return () => {
      rotation.kill()
      floating.kill()
    }
  }, [position])

  return (
    <div
      ref={containerRef}
      className="fixed pointer-events-none z-10"
      style={{ opacity: 0.55 }}
    >
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-emerald-500">
        <path d="M12 22C6 16 2 12 2 8c0-2.2 1.8-4 4-4 2 0 4 1 5 3 1-2 3-3 5-3 2.2 0 4 1.8 4 4 0 4-4 8-10 14z" />
        <path d="M12 2v20" />
        <path d="M8 8l4 4 4-4" />
      </svg>
    </div>
  )
}

function LeafCorner({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const basePositions: Record<string, React.CSSProperties> = {
      'top-left': { top: '0', left: '0' },
      'top-right': { top: '0', right: '0' },
      'bottom-left': { bottom: '0', left: '0' },
      'bottom-right': { bottom: '0', right: '0' },
    }
    gsap.set(containerRef.current, basePositions[position])

    const floatY = 4 + Math.random() * 4
    const floatDur = 6 + Math.random() * 3
    const floating = gsap.timeline({ repeat: -1, yoyo: true })
    
    if (position === 'top-left' || position === 'top-right') {
      floating.to(containerRef.current, { y: floatY, duration: floatDur, ease: 'sine.inOut' })
    } else {
      floating.to(containerRef.current, { y: -floatY, duration: floatDur, ease: 'sine.inOut' })
    }

    return () => { floating.kill() }
  }, [position])

  const rotateClass = {
    'top-left': 'rotate-0',
    'top-right': 'rotate-90',
    'bottom-left': '-rotate-90',
    'bottom-right': 'rotate-180',
  }

  return (
    <div
      ref={containerRef}
      className="fixed pointer-events-none z-10"
      style={{ opacity: 0.35 }}
    >
      <svg width="80" height="80" viewBox="0 0 60 60" fill="none" className={clsx('text-emerald-500', rotateClass[position])}>
        <path d="M0,0 Q15,10 30,0 Q45,-10 60,0 L60,20 Q45,30 30,20 Q15,30 0,20 Z" fill="currentColor" opacity="0.4" />
        <path d="M0,5 Q15,15 30,5 Q45,-5 60,5" stroke="currentColor" strokeWidth="1" opacity="0.6" />
        <path d="M0,12 Q15,22 30,12 Q45,2 60,12" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
        <path d="M30,0 L30,20" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      </svg>
    </div>
  )
}

export function Decorations() {
  return (
    <>
      {/* 左上角2只蝴蝶 - 依次出现 */}
      <Butterfly position="top-left" delay={0} />
      <Butterfly position="top-left" delay={1.5} />
      {/* 右上角1只蝴蝶 */}
      <Butterfly position="top-right" delay={0.8} />
      {/* 角落叶子装饰 */}
      <LeafCorner position="top-left" />
      <LeafCorner position="top-right" />
      <LeafCorner position="bottom-left" />
      <LeafCorner position="bottom-right" />
      {/* 底部角落树叶 */}
      <LeafSilhouette position="bottom-left" />
      <LeafSilhouette position="bottom-right" />
    </>
  )
}

export function FloatingBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div className="absolute inset-0 green-gradient-bg animate-breathing" />
      <div className="absolute top-0 left-0 w-full h-full">
        <svg className="absolute top-0 left-0 w-64 h-64 opacity-5" viewBox="0 0 200 200">
          <path d="M0,100 Q50,50 100,100 T200,100" fill="none" stroke="currentColor" strokeWidth="1" className="text-emerald-400" />
          <path d="M0,120 Q50,70 100,120 T200,120" fill="none" stroke="currentColor" strokeWidth="1" className="text-emerald-400" />
        </svg>
        <svg className="absolute bottom-0 right-0 w-80 h-80 opacity-5" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="1" className="text-emerald-400" />
          <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="1" className="text-emerald-400" />
          <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="1" className="text-emerald-400" />
        </svg>
      </div>
    </div>
  )
}
