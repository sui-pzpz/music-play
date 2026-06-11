import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'

function isTokenValid(): boolean {
  try {
    const token = localStorage.getItem('auth_token')
    if (!token) return false
    const parts = token.split('.')
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]))
      if (payload.exp && payload.exp * 1000 > Date.now()) return true
      return false
    }
    return true
  } catch {
    return false
  }
}

export default function Splash() {
  const [countdown, setCountdown] = useState(3)
  const logoRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const hasNavigated = useRef(false)
  const gsapInitialized = useRef(false)

  const goToLogin = useCallback(() => {
    if (hasNavigated.current) return
    hasNavigated.current = true
    navigate('/login', { replace: true })
  }, [navigate])

  const goToHome = useCallback(() => {
    if (hasNavigated.current) return
    hasNavigated.current = true
    navigate('/home', { replace: true })
  }, [navigate])

  useEffect(() => {
    if (isTokenValid()) {
      goToHome()
      return
    }

    // 防止 StrictMode 下重复初始化 GSAP 动画
    if (gsapInitialized.current) return
    gsapInitialized.current = true

    if (logoRef.current) {
      gsap.to(logoRef.current, {
        keyframes: [
          { scale: 0.95, duration: 0.75 },
          { scale: 1.02, duration: 0.75 },
          { scale: 0.98, duration: 0.75 },
          { scale: 1, duration: 0.75 }
        ],
        repeat: -1,
        ease: 'sine.inOut'
      })
    }

    if (cardRef.current) {
      gsap.fromTo(cardRef.current,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.2)' }
      )
    }
  }, [goToHome])

  useEffect(() => {
    if (hasNavigated.current) return

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          goToLogin()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [goToLogin])

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden flex items-center justify-center"
      style={{ background: 'var(--theme-bg-gradient)' }}
    >
      <div ref={cardRef} className="glass-card p-10 w-full max-w-sm mx-4 text-center">
        <div className="mb-6" ref={logoRef}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" className="mx-auto" style={{ color: 'var(--theme-primary)' }}>
            <path d="M12 4V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="2" r="3" fill="currentColor" />
            <path d="M12 16C12 20 8 22 5 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 16C12 20 16 22 19 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--theme-text)' }}>音瓶</h1>
        <p className="mb-4" style={{ color: 'var(--theme-text-secondary)' }}>你的专属音乐能量瓶</p>
        <div className="text-sm" style={{ color: 'var(--theme-primary)', opacity: 0.7 }}>{countdown}秒后自动跳转</div>
      </div>
    </div>
  )
}
