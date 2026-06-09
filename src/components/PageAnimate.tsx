import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export function AnimateOnMount({ 
  children, 
  delay = 0, 
  type = 'fadeUp' 
}: { 
  children: React.ReactNode 
  delay?: number
  type?: 'fadeUp' | 'fadeDown' | 'scaleIn' | 'fadeIn'
}) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const tl = gsap.timeline()
    
    switch (type) {
      case 'fadeUp':
        tl.from(containerRef.current, {
          opacity: 0,
          y: 20,
          duration: 0.6,
          delay: delay,
          ease: 'power2.out'
        })
        break
      case 'fadeDown':
        tl.from(containerRef.current, {
          opacity: 0,
          y: -20,
          duration: 0.6,
          delay: delay,
          ease: 'power2.out'
        })
        break
      case 'scaleIn':
        tl.from(containerRef.current, {
          opacity: 0,
          scale: 0.95,
          duration: 0.5,
          delay: delay,
          ease: 'power2.out'
        })
        break
      case 'fadeIn':
        tl.from(containerRef.current, {
          opacity: 0,
          duration: 0.8,
          delay: delay,
          ease: 'power2.out'
        })
        break
    }

    return () => { tl.kill() }
  }, [delay, type])

  return <div ref={containerRef}>{children}</div>
}

export function AnimateButton({ 
  children, 
  onClick, 
  className = '',
  disabled = false
}: { 
  children: React.ReactNode 
  onClick?: () => void
  className?: string
  disabled?: boolean
}) {
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!buttonRef.current) return

    const handleMouseEnter = () => {
      gsap.to(buttonRef.current, { 
        scale: 1.02, 
        duration: 0.2, 
        ease: 'power2.out' 
      })
    }

    const handleMouseLeave = () => {
      gsap.to(buttonRef.current, { 
        scale: 1, 
        duration: 0.2, 
        ease: 'power2.out' 
      })
    }

    const handleMouseDown = () => {
      gsap.to(buttonRef.current, { 
        scale: 0.97, 
        duration: 0.15, 
        ease: 'power2.in' 
      })
    }

    const handleMouseUp = () => {
      gsap.to(buttonRef.current, { 
        scale: 1.01, 
        duration: 0.15, 
        ease: 'power2.out' 
      })
    }

    const btn = buttonRef.current
    btn.addEventListener('mouseenter', handleMouseEnter)
    btn.addEventListener('mouseleave', handleMouseLeave)
    btn.addEventListener('mousedown', handleMouseDown)
    btn.addEventListener('mouseup', handleMouseUp)

    return () => {
      btn.removeEventListener('mouseenter', handleMouseEnter)
      btn.removeEventListener('mouseleave', handleMouseLeave)
      btn.removeEventListener('mousedown', handleMouseDown)
      btn.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  )
}

export function AnimateListItem({ 
  children, 
  onClick, 
  className = ''
}: { 
  children: React.ReactNode 
  onClick?: () => void
  className?: string
}) {
  const itemRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!itemRef.current) return

    const handleMouseEnter = () => {
      gsap.to(itemRef.current, { 
        scale: 1.01, 
        duration: 0.25, 
        ease: 'power2.out' 
      })
    }

    const handleMouseLeave = () => {
      gsap.to(itemRef.current, { 
        scale: 1, 
        duration: 0.25, 
        ease: 'power2.out' 
      })
    }

    const handleMouseDown = () => {
      gsap.to(itemRef.current, { 
        scale: 0.99, 
        duration: 0.1, 
        ease: 'power2.in' 
      })
    }

    const handleMouseUp = () => {
      gsap.to(itemRef.current, { 
        scale: 1, 
        duration: 0.15, 
        ease: 'power2.out' 
      })
    }

    const item = itemRef.current
    item.addEventListener('mouseenter', handleMouseEnter)
    item.addEventListener('mouseleave', handleMouseLeave)
    item.addEventListener('mousedown', handleMouseDown)
    item.addEventListener('mouseup', handleMouseUp)

    return () => {
      item.removeEventListener('mouseenter', handleMouseEnter)
      item.removeEventListener('mouseleave', handleMouseLeave)
      item.removeEventListener('mousedown', handleMouseDown)
      item.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  return (
    <div
      ref={itemRef}
      onClick={onClick}
      className={className}
    >
      {children}
    </div>
  )
}


