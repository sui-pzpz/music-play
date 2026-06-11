import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { usePlayerStore } from '@/store/playerStore'

export function Butterfly({ position, delay = 0 }: { position: 'top-left'; delay?: number }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const leftWingRef = useRef<SVGGElement>(null)
  const rightWingRef = useRef<SVGGElement>(null)

  useEffect(() => {
    if (!containerRef.current || !leftWingRef.current || !rightWingRef.current) return

    const basePositions: Record<string, { left?: string; right?: string; top: string }> = {
      'top-left': { left: `${5 + Math.random() * 10}%`, top: `${8 + Math.random() * 10}%` },
    }
    gsap.set(containerRef.current, { ...basePositions[position], opacity: 0 })
    gsap.to(containerRef.current, { opacity: 0.45, duration: 1.5, delay })

    const wingFlap = gsap.timeline({ repeat: -1, yoyo: true, delay })
    wingFlap
      .to(leftWingRef.current, { scaleX: 0.55, duration: 0.3, ease: 'power2.inOut', transformOrigin: 'center right' }, 0)
      .to(rightWingRef.current, { scaleX: 0.55, duration: 0.3, ease: 'power2.inOut', transformOrigin: 'center left' }, 0)
      .to(leftWingRef.current, { scaleX: 1, duration: 0.35, ease: 'power2.out', transformOrigin: 'center right' }, 0.3)
      .to(rightWingRef.current, { scaleX: 1, duration: 0.35, ease: 'power2.out', transformOrigin: 'center left' }, 0.3)

    const floatX = 12 + Math.random() * 8
    const floatY = 8 + Math.random() * 6
    const floatDur = 10 + Math.random() * 6
    const floating = gsap.timeline({ repeat: -1, yoyo: true, delay: delay + 0.8 })
    floating
      .to(containerRef.current, { x: floatX, y: -floatY, duration: floatDur, ease: 'sine.inOut' })
      .to(containerRef.current, { x: -floatX * 0.5, y: floatY * 0.6, duration: floatDur * 0.8, ease: 'sine.inOut' })

    const sway = gsap.timeline({ repeat: -1, yoyo: true, delay: delay + 1.2 })
    sway.to(containerRef.current, { rotation: 6 + Math.random() * 4, duration: 6 + Math.random() * 2, ease: 'sine.inOut' })
    sway.to(containerRef.current, { rotation: -(5 + Math.random() * 3), duration: 5 + Math.random() * 2, ease: 'sine.inOut' })

    return () => {
      wingFlap.kill()
      floating.kill()
      sway.kill()
    }
  }, [position, delay])

  return (
    <div ref={containerRef} className="fixed pointer-events-none z-10" style={{ opacity: 0 }}>
      <svg width="50" height="50" viewBox="0 0 36 36" fill="none" style={{ color: 'var(--theme-primary-light)' }}>
        <g ref={leftWingRef}>
          <path d="M18 15C13 10 6 8 3 12C1 16 6 21 11 21C13 21 15 19 18 17" fill="currentColor" opacity="0.7" />
          <path d="M11 14C9 11 6 10 4 12" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
        </g>
        <g ref={rightWingRef}>
          <path d="M18 15C23 10 30 8 33 12C35 16 30 21 25 21C23 21 21 19 18 17" fill="currentColor" opacity="0.7" />
          <path d="M25 14C27 11 30 10 32 12" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
        </g>
        <ellipse cx="18" cy="17" rx="1.2" ry="4" fill="currentColor" opacity="0.8" />
        <path d="M18 13C16 8 13 4 11 2.5" stroke="currentColor" strokeWidth="0.6" opacity="0.6" />
        <path d="M18 13C20 8 23 4 25 2.5" stroke="currentColor" strokeWidth="0.6" opacity="0.6" />
      </svg>
    </div>
  )
}

export function FloatingLeaf() {
  const containerRef = useRef<HTMLDivElement>(null)
  const leavesRef = useRef<HTMLDivElement[]>([])
  const timelinesRef = useRef<(gsap.core.Timeline | gsap.core.Tween)[]>([])

  useEffect(() => {
    if (!containerRef.current) return

    const leaves = leavesRef.current
    leaves.forEach((leaf, index) => {
      gsap.set(leaf, { 
        opacity: 0,
        x: `${Math.random() * 100}%`,
        y: -20,
        rotation: Math.random() * 360
      })

      const duration = 8 + Math.random() * 10

      const fadein = gsap.to(leaf, {
        opacity: 0.4,
        duration: 1,
        delay: index * 0.5
      })
      timelinesRef.current.push(fadein)

      const fall = gsap.timeline({ repeat: -1, delay: index * 0.5 })
      fall
        .to(leaf, {
          y: '110vh',
          x: `+=${(Math.random() - 0.5) * 100}`,
          rotation: `+=${Math.random() * 720}`,
          duration,
          ease: 'linear'
        })
        .to(leaf, {
          opacity: 0,
          duration: 1
        }, `-=1`)
        .to(leaf, {
          y: -20,
          x: `${Math.random() * 100}%`,
          opacity: 0.4,
          rotation: Math.random() * 360,
          duration: 0
        })
      timelinesRef.current.push(fall)
    })

    return () => {
      timelinesRef.current.forEach(tl => tl.kill())
      timelinesRef.current = []
    }
  }, [])

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none overflow-hidden z-[5]">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          ref={(el) => { if (el) leavesRef.current[i] = el }}
          className="absolute"
          style={{ top: '-20px' }}
        >
          <svg width="24" height="32" viewBox="0 0 24 32" fill="none" style={{ color: 'var(--theme-primary)' }}>
            <path
              d="M12 30C6 24 2 18 2 12C2 6 8 2 12 2C16 2 22 6 22 12C22 18 18 24 12 30Z"
              fill="currentColor"
              opacity="0.5"
            />
            <path d="M12 2V28" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
            <path d="M12 8C9 10 7 12 7 14" stroke="currentColor" strokeWidth="0.6" opacity="0.4" />
            <path d="M12 14C15 16 17 18 17 20" stroke="currentColor" strokeWidth="0.6" opacity="0.4" />
          </svg>
        </div>
      ))}
    </div>
  )
}

export function AppleDecoration() {
  return (
    <div className="fixed bottom-8 right-4 pointer-events-none z-10">
      <div className="relative">
        <svg width="56" height="64" viewBox="0 0 56 64" fill="none" style={{ color: 'var(--theme-primary)' }}>
          <ellipse cx="28" cy="38" rx="20" ry="24" fill="currentColor" opacity="0.85" />
          <ellipse cx="20" cy="30" rx="5" ry="6" fill="white" opacity="0.3" />
          <path d="M28 14C26 8 22 4 20 4C24 4 28 8 30 14" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M18 6C20 2 26 2 28 6" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.7" />
        </svg>
        <svg 
          width="44" 
          height="50" 
          viewBox="0 0 44 50" 
          fill="none" 
          className="absolute -top-2 -right-8 opacity-70"
          style={{ color: 'var(--theme-primary)' }}
        >
          <ellipse cx="22" cy="30" rx="16" ry="19" fill="currentColor" opacity="0.85" />
          <ellipse cx="16" cy="23" rx="4" ry="5" fill="white" opacity="0.3" />
          <path d="M22 11C20 6 17 3 15 3C19 3 23 6 25 11" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      </div>
      <div className="absolute -bottom-4 -left-4 w-32 h-24 rounded-full blur-xl" style={{ backgroundColor: 'rgba(var(--theme-primary-rgb), 0.2)' }} />
    </div>
  )
}

export function StarlightParticles() {
  const containerRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<HTMLDivElement[]>([])
  const timelinesRef = useRef<(gsap.core.Timeline | gsap.core.Tween)[]>([])

  useEffect(() => {
    if (!containerRef.current) return

    const particles = particlesRef.current
    particles.forEach((particle, index) => {
      gsap.set(particle, {
        opacity: 0,
        x: `${Math.random() * 100}%`,
        y: `${Math.random() * 100}%`,
        scale: 0.3 + Math.random() * 0.5
      })

      const glow = gsap.timeline({ repeat: -1, delay: index * 0.8 })
      glow
        .to(particle, { opacity: 0.8, duration: 1.5 })
        .to(particle, { opacity: 0.2, duration: 2 })
        .to(particle, { opacity: 0.6, duration: 1.5 })
        .to(particle, { opacity: 0.1, duration: 2 })
      timelinesRef.current.push(glow)
    })

    return () => {
      timelinesRef.current.forEach(tl => tl.kill())
      timelinesRef.current = []
    }
  }, [])

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none overflow-hidden z-[5]">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          ref={(el) => { if (el) particlesRef.current[i] = el }}
          className="absolute rounded-full bg-white shadow-[0_0_6px_2px_rgba(255,255,255,0.6)]"
          style={{ width: '3px', height: '3px' }}
        />
      ))}
    </div>
  )
}

export function OceanWaves() {
  return (
    <div className="fixed bottom-0 left-0 right-0 pointer-events-none z-[5] overflow-hidden">
      <svg className="w-full" viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ opacity: 0.3 }}>
        <path d="M0,60 C240,20 480,100 720,60 C960,20 1200,100 1440,60 L1440,120 L0,120 Z" fill="white">
          <animate attributeName="d" dur="8s" repeatCount="indefinite" values="
            M0,60 C240,20 480,100 720,60 C960,20 1200,100 1440,60 L1440,120 L0,120 Z;
            M0,80 C240,40 480,80 720,40 C960,80 1200,40 1440,80 L1440,120 L0,120 Z;
            M0,60 C240,20 480,100 720,60 C960,20 1200,100 1440,60 L1440,120 L0,120 Z
          " />
        </path>
      </svg>
      <svg className="w-full" viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ opacity: 0.2, marginTop: '-30px' }}>
        <path d="M0,80 C240,40 480,80 720,40 C960,80 1200,40 1440,80 L1440,120 L0,120 Z" fill="white">
          <animate attributeName="d" dur="6s" repeatCount="indefinite" values="
            M0,80 C240,40 480,80 720,40 C960,80 1200,40 1440,80 L1440,120 L0,120 Z;
            M0,60 C240,100 480,40 720,80 C960,40 1200,100 1440,60 L1440,120 L0,120 Z;
            M0,80 C240,40 480,80 720,40 C960,80 1200,40 1440,80 L1440,120 L0,120 Z
          " />
        </path>
      </svg>
    </div>
  )
}

export function ChickDecoration() {
  return (
    <div className="fixed bottom-6 right-6 pointer-events-none z-10 animate-float-slow">
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
        {/* 身体 */}
        <ellipse cx="40" cy="50" rx="22" ry="20" fill="#8B6914" opacity="0.85" />
        {/* 头部 */}
        <circle cx="40" cy="30" r="16" fill="#A07818" opacity="0.9" />
        {/* 眼睛 */}
        <circle cx="34" cy="27" r="2.5" fill="#3a2a0a" />
        <circle cx="46" cy="27" r="2.5" fill="#3a2a0a" />
        <circle cx="35" cy="26" r="0.8" fill="white" />
        <circle cx="47" cy="26" r="0.8" fill="white" />
        {/* 嘴巴 */}
        <path d="M37,33 L40,37 L43,33" fill="#E8A317" stroke="#C4880F" strokeWidth="0.5" />
        {/* 翅膀 */}
        <ellipse cx="22" cy="48" rx="8" ry="12" fill="#7A5C10" opacity="0.7" transform="rotate(-15, 22, 48)" />
        <ellipse cx="58" cy="48" rx="8" ry="12" fill="#7A5C10" opacity="0.7" transform="rotate(15, 58, 48)" />
        {/* 脚 */}
        <path d="M33,68 L30,76 M33,68 L33,76 M33,68 L36,76" stroke="#C4880F" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M47,68 L44,76 M47,68 L47,76 M47,68 L50,76" stroke="#C4880F" strokeWidth="1.5" strokeLinecap="round" />
        {/* 头顶小毛 */}
        <path d="M40,14 L38,8 M40,14 L42,9 M40,14 L40,7" stroke="#C4880F" strokeWidth="1" strokeLinecap="round" />
      </svg>
    </div>
  )
}

export function LavenderDecoration() {
  return (
    <div className="fixed bottom-6 right-6 pointer-events-none z-10 animate-float-slow">
      <svg width="60" height="80" viewBox="0 0 60 80" fill="none">
        {/* 茎 */}
        <path d="M30,80 L30,35" stroke="white" strokeWidth="1.5" opacity="0.6" />
        <path d="M30,60 Q20,55 15,50" stroke="white" strokeWidth="1" opacity="0.4" fill="none" />
        <path d="M30,50 Q40,45 45,40" stroke="white" strokeWidth="1" opacity="0.4" fill="none" />
        {/* 花穗 - 多层花瓣 */}
        {[0, 6, 12, 18, 24, 30].map((offset, i) => (
          <g key={i} transform={`translate(30, ${35 - offset})`}>
            <ellipse cx="-4" cy="0" rx="4" ry="3" fill="white" opacity={0.7 - i * 0.05} />
            <ellipse cx="4" cy="0" rx="4" ry="3" fill="white" opacity={0.7 - i * 0.05} />
            <ellipse cx="0" cy="-2" rx="3" ry="2.5" fill="white" opacity={0.6 - i * 0.05} />
          </g>
        ))}
        {/* 叶子 */}
        <path d="M15,50 Q10,45 15,40" stroke="white" strokeWidth="0.8" fill="white" fillOpacity="0.2" />
        <path d="M45,40 Q50,35 45,30" stroke="white" strokeWidth="0.8" fill="white" fillOpacity="0.2" />
      </svg>
    </div>
  )
}

export function DecorationElements() {
  const themeColor = usePlayerStore((s) => s.themeColor)
  const darkMode = usePlayerStore((s) => s.darkMode)

  return (
    <>
      {themeColor === 'green' && !darkMode && (
        <>
          <Butterfly position="top-left" delay={0} />
          <Butterfly position="top-left" delay={2} />
          <FloatingLeaf />
          <AppleDecoration />
        </>
      )}
      {themeColor === 'blue' && !darkMode && <OceanWaves />}
      {themeColor === 'yellow' && !darkMode && <ChickDecoration />}
      {themeColor === 'purple' && !darkMode && <LavenderDecoration />}
      <StarlightParticles />
    </>
  )
}