import { useEffect, useRef } from 'react'
import { usePlayerStore } from '@/store/playerStore'
import { clsx } from 'clsx'
import gsap from 'gsap'

function Butterfly({ position, delay = 0 }: { position: 'top-left' | 'top-right'; delay?: number }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const leftWingRef = useRef<SVGGElement>(null)
  const rightWingRef = useRef<SVGGElement>(null)
  const darkMode = usePlayerStore((s) => s.darkMode)

  useEffect(() => {
    if (!containerRef.current || !leftWingRef.current || !rightWingRef.current) return

    const basePositions: Record<string, { left?: string; right?: string; top: string }> = {
      'top-left': { left: `${8 + Math.random() * 8}%`, top: `${10 + Math.random() * 12}%` },
      'top-right': { right: `${8 + Math.random() * 8}%`, top: `${10 + Math.random() * 12}%` },
    }
    gsap.set(containerRef.current, { ...basePositions[position], opacity: 0 })
    gsap.to(containerRef.current, { opacity: 0.55, duration: 1.5, delay })

    const wingFlap = gsap.timeline({ repeat: -1, yoyo: true, delay })
    wingFlap
      .to(leftWingRef.current, { scaleX: 0.55, duration: 0.3, ease: 'power2.inOut', transformOrigin: 'center right' }, 0)
      .to(rightWingRef.current, { scaleX: 0.55, duration: 0.3, ease: 'power2.inOut', transformOrigin: 'center left' }, 0)
      .to(leftWingRef.current, { scaleX: 1, duration: 0.35, ease: 'power2.out', transformOrigin: 'center right' }, 0.3)
      .to(rightWingRef.current, { scaleX: 1, duration: 0.35, ease: 'power2.out', transformOrigin: 'center left' }, 0.3)

    const floatX = 10 + Math.random() * 10
    const floatY = 6 + Math.random() * 6
    const floatDur = 12 + Math.random() * 8
    const floating = gsap.timeline({ repeat: -1, yoyo: true, delay: delay + 0.8 })
    floating
      .to(containerRef.current, { x: floatX, y: -floatY, duration: floatDur, ease: 'sine.inOut' })
      .to(containerRef.current, { x: -floatX * 0.6, y: floatY * 0.7, duration: floatDur, ease: 'sine.inOut' })

    const sway = gsap.timeline({ repeat: -1, yoyo: true, delay: delay + 1.2 })
    sway.to(containerRef.current, { rotation: 8 + Math.random() * 4, duration: 5 + Math.random() * 3, ease: 'sine.inOut' })
    sway.to(containerRef.current, { rotation: -(6 + Math.random() * 4), duration: 5 + Math.random() * 3, ease: 'sine.inOut' })

    return () => {
      wingFlap.kill()
      floating.kill()
      sway.kill()
    }
  }, [position, delay])

  return (
    <div ref={containerRef} className="fixed pointer-events-none z-10" style={{ opacity: 0 }}>
      <svg width="42" height="42" viewBox="0 0 30 30" fill="none" className={darkMode ? 'text-emerald-500' : 'text-emerald-400'}>
        <g ref={leftWingRef}>
          <path d="M15 13C11 9 5 7 3 11C1 15 5 19 9 19C11 19 13 17 15 15" fill="currentColor" opacity="0.6" />
          <path d="M9 12C8 10 6 9 4 11" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
        </g>
        <g ref={rightWingRef}>
          <path d="M15 13C19 9 25 7 27 11C29 15 25 19 21 19C19 19 17 17 15 15" fill="currentColor" opacity="0.6" />
          <path d="M21 12C22 10 24 9 26 11" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
        </g>
        <ellipse cx="15" cy="15" rx="1" ry="3.5" fill="currentColor" opacity="0.7" />
        <path d="M15 11C13.5 7 11.5 4 10 3" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
        <path d="M15 11C16.5 7 18.5 4 20 3" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
      </svg>
    </div>
  )
}

function Leaf({ position }: { position: 'bottom-left' | 'bottom-right' }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const darkMode = usePlayerStore((s) => s.darkMode)

  useEffect(() => {
    if (!containerRef.current) return

    const basePositions: Record<string, React.CSSProperties> = {
      'bottom-left': { bottom: '100px', left: '15px' },
      'bottom-right': { bottom: '100px', right: '15px' },
    }
    gsap.set(containerRef.current, { ...basePositions[position], opacity: 0 })
    gsap.to(containerRef.current, { opacity: 0.5, duration: 1.5, delay: 0.5 })

    const rotDur = 20 + Math.random() * 10
    const rotation = gsap.timeline({ repeat: -1 })
    rotation.to(containerRef.current, { rotation: 360, duration: rotDur, ease: 'none' })

    const floatY = 5 + Math.random() * 5
    const floatDur = 8 + Math.random() * 4
    const floating = gsap.timeline({ repeat: -1, yoyo: true, delay: 1 })
    floating.to(containerRef.current, { y: -floatY, duration: floatDur, ease: 'sine.inOut' })

    return () => {
      rotation.kill()
      floating.kill()
    }
  }, [position])

  const rotation = position === 'bottom-left' ? 0 : 180

  return (
    <div ref={containerRef} className="fixed pointer-events-none z-10" style={{ opacity: 0 }}>
      <svg 
        width="50" 
        height="50" 
        viewBox="0 0 32 32" 
        fill="none" 
        className={darkMode ? 'text-emerald-600' : 'text-emerald-500'}
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <path 
          d="M16 30C8 24 4 20 4 16C4 12 8 8 16 8C24 8 28 12 28 16C28 20 24 24 16 30Z" 
          fill="currentColor" 
          opacity="0.4" 
        />
        <path d="M16 6V26" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        <path d="M16 10C12 12 10 14 10 16" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
        <path d="M16 14C20 16 22 18 22 20" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
        <path d="M16 18C12 20 10 22 10 24" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
      </svg>
    </div>
  )
}

function LeafCorner({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const darkMode = usePlayerStore((s) => s.darkMode)

  useEffect(() => {
    if (!containerRef.current) return

    const basePositions: Record<string, React.CSSProperties> = {
      'top-left': { top: '0', left: '0' },
      'top-right': { top: '0', right: '0' },
      'bottom-left': { bottom: '0', left: '0' },
      'bottom-right': { bottom: '0', right: '0' },
    }
    gsap.set(containerRef.current, { ...basePositions[position], opacity: 0 })
    gsap.to(containerRef.current, { opacity: 0.3, duration: 2, delay: 1 })

    const floatY = 3 + Math.random() * 3
    const floatDur = 10 + Math.random() * 5
    const floating = gsap.timeline({ repeat: -1, yoyo: true, delay: 1.5 })
    
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
    <div ref={containerRef} className="fixed pointer-events-none z-10" style={{ opacity: 0 }}>
      <svg width="70" height="70" viewBox="0 0 50 50" fill="none" className={clsx(darkMode ? 'text-emerald-600' : 'text-emerald-500', rotateClass[position])}>
        <path d="M0,0 Q12,8 25,0 Q38,-8 50,0 L50,16 Q38,24 25,16 Q12,24 0,16 Z" fill="currentColor" opacity="0.3" />
        <path d="M0,4 Q12,14 25,4 Q38,-6 50,4" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
        <path d="M0,10 Q12,20 25,10 Q38,0 50,10" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
      </svg>
    </div>
  )
}

export function Decorations() {
  const darkMode = usePlayerStore((s) => s.darkMode)

  return (
    <>
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className={clsx(
            'absolute rounded-full blur-3xl',
            darkMode ? 'bg-emerald-900/20' : 'bg-emerald-200/30'
          )}
          style={{ width: '400px', height: '400px', top: '-100px', right: '-100px' }}
        />
        <div
          className={clsx(
            'absolute rounded-full blur-3xl',
            darkMode ? 'bg-purple-900/15' : 'bg-purple-100/30'
          )}
          style={{ width: '300px', height: '300px', bottom: '-50px', left: '-50px' }}
        />
        <div
          className={clsx(
            'absolute rounded-full blur-2xl',
            darkMode ? 'bg-blue-900/10' : 'bg-blue-100/20'
          )}
          style={{ width: '250px', height: '250px', top: '40%', left: '10%' }}
        />
      </div>

      {/* 蝴蝶装饰 */}
      <Butterfly position="top-left" delay={0} />
      <Butterfly position="top-left" delay={1.8} />
      <Butterfly position="top-right" delay={1} />

      {/* 树叶装饰 */}
      <Leaf position="bottom-left" />
      <Leaf position="bottom-right" />

      {/* 角落叶子装饰 */}
      <LeafCorner position="top-left" />
      <LeafCorner position="top-right" />
      <LeafCorner position="bottom-left" />
      <LeafCorner position="bottom-right" />
    </>
  )
}

export function FloatingBackground() {
  return null
}
