import { useEffect, useRef } from 'react'
import gsap from 'gsap'

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
      <svg width="50" height="50" viewBox="0 0 36 36" fill="none" className="text-emerald-300">
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
          <svg width="24" height="32" viewBox="0 0 24 32" fill="none" className="text-emerald-400">
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
        <svg width="56" height="64" viewBox="0 0 56 64" fill="none" className="text-emerald-500">
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
          className="text-emerald-500 absolute -top-2 -right-8 opacity-70"
        >
          <ellipse cx="22" cy="30" rx="16" ry="19" fill="currentColor" opacity="0.85" />
          <ellipse cx="16" cy="23" rx="4" ry="5" fill="white" opacity="0.3" />
          <path d="M22 11C20 6 17 3 15 3C19 3 23 6 25 11" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      </div>
      <div className="absolute -bottom-4 -left-4 w-32 h-24 bg-emerald-200/20 rounded-full blur-xl" />
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

export function DecorationElements() {
  return (
    <>
      <Butterfly position="top-left" delay={0} />
      <Butterfly position="top-left" delay={2} />
      <FloatingLeaf />
      <AppleDecoration />
      <StarlightParticles />
    </>
  )
}