import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { DecorationElements } from '@/components/DecorationElements'

type LoginMode = 'code' | 'password'

export default function Login() {
  const [loginMode, setLoginMode] = useState<LoginMode>('code')
  const [phone, setPhone] = useState('')
  const [verificationCode, setVerificationCode] = useState('123456')
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isChecked, setIsChecked] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  // 密码错误锁定逻辑
  const [failCount, setFailCount] = useState(0)
  const [lockSeconds, setLockSeconds] = useState(0)
  const [lockMessage, setLockMessage] = useState('')
  const lockTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const navigate = useNavigate()

  const goToHome = () => {
    navigate('/home', { replace: true })
  }

  // 锁定倒计时
  useEffect(() => {
    if (lockSeconds <= 0) {
      if (lockTimerRef.current) {
        clearInterval(lockTimerRef.current)
        lockTimerRef.current = null
      }
      return
    }
    lockTimerRef.current = setInterval(() => {
      setLockSeconds(prev => {
        if (prev <= 1) {
          setLockMessage('')
          setFailCount(0)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      if (lockTimerRef.current) clearInterval(lockTimerRef.current)
    }
  }, [lockSeconds > 0])

  const handlePasswordLogin = useCallback(() => {
    if (lockSeconds > 0) return
    // 模拟密码错误（无真实接口，演示锁定逻辑）
    const newFailCount = failCount + 1
    setFailCount(newFailCount)

    if (newFailCount >= 5 && newFailCount < 10) {
      // 第5次错误，锁定1分钟
      setLockSeconds(60)
      setLockMessage('密码错误次数过多，请1分钟后重试')
    } else if (newFailCount >= 10) {
      // 第10次错误，锁定10分钟
      setLockSeconds(600)
      setLockMessage('密码错误次数过多，请10分钟后重试')
    } else {
      setLockMessage(`密码错误，还剩${5 - newFailCount}次机会`)
    }
  }, [failCount, lockSeconds])

  const formatLockTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const inputClass = (field: string) =>
    `w-full px-4 py-3 rounded-xl border transition-all duration-300 bg-white/80 text-emerald-900 placeholder:text-emerald-300 ${
      focusedField === field
        ? 'border-emerald-400 shadow-[0_0_0_2px_rgba(115,153,104,0.2)]'
        : 'border-green-200/60 hover:border-green-200'
    }`

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #f4f8f2 0%, #faf6f0 30%, #f5f1eb 70%, #f0ede6 100%)' }}
    >
      <DecorationElements />

      <div className="flex flex-col items-center min-h-screen px-6 pt-20 pb-8">
        <div className="w-full max-w-sm flex-1 flex flex-col">
          {/* Logo */}
          <div className="flex flex-col items-center mb-10">
            <h1 className="text-2xl font-bold text-emerald-700 flex items-center justify-center gap-2">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-emerald-600">
                <path d="M12 4V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="2" r="3" fill="currentColor" />
                <path d="M12 16C12 20 8 22 5 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M12 16C12 20 16 22 19 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              音瓶
            </h1>
          </div>

          <div className="glass-card p-6">
            {/* 登录模式切换 */}
            <div className="flex mb-6 bg-emerald-50/60 rounded-xl p-1">
              <button
                onClick={() => setLoginMode('code')}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                  loginMode === 'code'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-emerald-400 hover:text-emerald-600'
                }`}
              >
                验证码登录
              </button>
              <button
                onClick={() => setLoginMode('password')}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                  loginMode === 'password'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-emerald-400 hover:text-emerald-600'
                }`}
              >
                密码登录
              </button>
            </div>

            {/* 验证码登录模式 */}
            {loginMode === 'code' && (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className={`flex items-center justify-center px-3 py-3 rounded-xl border transition-all duration-300 cursor-pointer ${
                      focusedField === 'phone'
                        ? 'border-emerald-400 shadow-[0_0_0_2px_rgba(115,153,104,0.2)]'
                        : 'border-green-200/60 hover:border-green-200'
                    }`}
                  >
                    <span className="text-emerald-700 text-sm font-medium">+86</span>
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" className="ml-1 text-emerald-500">
                      <path d="M6 7L11 1H1L6 7Z" fill="currentColor" />
                    </svg>
                  </div>

                  <div className="flex-1 relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="请输入手机号"
                      className={inputClass('phone')}
                    />
                    {phone && (
                      <button
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-emerald-100/50 transition-colors"
                        onClick={() => setPhone('')}
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-emerald-300">
                          <path d="M7 7L1 1M7 7L13 13M7 7L1 13M7 7L13 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      onFocus={() => setFocusedField('code')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="请输入验证码"
                      className={inputClass('code')}
                    />
                  </div>

                  <button className="px-4 py-3 rounded-xl border border-green-200 text-emerald-700 text-sm font-medium hover:bg-emerald-50 hover:border-emerald-400/50 transition-all duration-300 whitespace-nowrap">
                    获取验证码
                  </button>
                </div>
              </>
            )}

            {/* 密码登录模式 */}
            {loginMode === 'password' && (
              <>
                <div className="mb-4">
                  <input
                    type="text"
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    onFocus={() => setFocusedField('account')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="请输入手机号/账号"
                    className={inputClass('account')}
                  />
                </div>

                <div className="mb-4 relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="请输入密码"
                    className={`${inputClass('password')} pr-10`}
                  />
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-emerald-100/50 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-emerald-400">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.5" />
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-emerald-300">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* 锁定提示 */}
                {lockMessage && (
                  <div className={`mb-4 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 ${
                    lockSeconds > 0
                      ? 'bg-red-50 text-red-600 border border-red-200/60'
                      : 'bg-amber-50 text-amber-600 border border-amber-200/60'
                  }`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                      <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <span>
                      {lockSeconds > 0
                        ? `${lockMessage}（${formatLockTime(lockSeconds)}）`
                        : lockMessage}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-end mb-4 text-sm">
                  <span className="text-emerald-500 cursor-pointer hover:text-emerald-700 transition-colors">忘记密码？</span>
                </div>
              </>
            )}

            {/* 协议勾选 */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setIsChecked(!isChecked)}
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 cursor-pointer shrink-0 ${
                  isChecked
                    ? 'border-emerald-500 bg-emerald-500'
                    : 'border-green-200 hover:border-emerald-400'
                }`}
              >
                {isChecked && (
                  <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                    <path d="M10.5 0.5L4.5 6.5L1.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <span className="text-xs text-emerald-500">
                我已阅读并同意
                <span className="text-emerald-700 ml-0.5 cursor-pointer hover:underline">服务协议</span>
                和
                <span className="text-emerald-700 ml-0.5 cursor-pointer hover:underline">隐私政策</span>
              </span>
            </div>

            {/* 登录按钮 */}
            <button
              onClick={loginMode === 'password' ? handlePasswordLogin : undefined}
              disabled={loginMode === 'password' && lockSeconds > 0}
              className={`w-full py-3.5 rounded-xl text-white font-medium text-base transition-all duration-300 ${
                loginMode === 'password' && lockSeconds > 0
                  ? 'bg-emerald-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 hover:shadow-lg hover:shadow-emerald-500/25 active:scale-[0.98]'
              }`}
            >
              {loginMode === 'password' && lockSeconds > 0
                ? `锁定中 ${formatLockTime(lockSeconds)}`
                : '登录'}
            </button>
          </div>

          {/* 游客登入 */}
          <div className="mt-6">
            <button
              onClick={goToHome}
              className="w-full py-3.5 rounded-xl bg-emerald-100/60 text-emerald-700 font-medium text-base hover:bg-emerald-100 hover:shadow-md hover:shadow-emerald-500/15 active:scale-[0.98] transition-all duration-300"
            >
              游客登入
            </button>
          </div>


        </div>
      </div>
    </div>
  )
}
