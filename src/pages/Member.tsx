import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayerStore } from '@/store/playerStore'
import { clsx } from 'clsx'
import { ArrowLeft, Crown, Check, Lock, ChevronDown, ChevronUp } from 'lucide-react'

const benefits = [
  { name: '无损音质', unlocked: false },
  { name: '专属皮肤', unlocked: false },
  { name: '歌词翻译', unlocked: false },
  { name: '下载特权', unlocked: false },
  { name: '跳过广告', unlocked: false },
]

const pricingPlans = [
  { id: 'month', name: '月卡', price: 15, unit: '月', gradient: 'from-emerald-400 to-teal-500' },
  { id: 'quarter', name: '季卡', price: 40, unit: '季', gradient: 'from-green-400 to-emerald-600', badge: '推荐' },
  { id: 'year', name: '年卡', price: 128, unit: '年', gradient: 'from-teal-400 to-cyan-600', badge: '最划算' },
]

const faqs = [
  { q: '会员可以退款吗？', a: '会员开通后不支持退款，请在开通前确认。' },
  { q: '会员权益什么时候生效？', a: '开通后立即生效，所有权益即可使用。' },
  { q: '到期后下载的歌曲还能听吗？', a: '到期后已下载的歌曲仍可播放，但无法继续下载新歌曲。' },
]

export default function Member() {
  const navigate = useNavigate()
  const darkMode = usePlayerStore((s) => s.darkMode)
  const [selectedPlan, setSelectedPlan] = useState('quarter')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  return (
    <div className="max-w-lg mx-auto px-4 pb-4 animate-fade-in">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className={clsx(
          'flex items-center gap-2 mb-4 text-sm transition-colors',
          darkMode ? 'text-zinc-400 hover:text-emerald-400' : 'text-emerald-600 hover:text-emerald-700'
        )}
      >
        <ArrowLeft className="h-4 w-4" />
        返回
      </button>

      {/* Current status */}
      <div className="glass-card p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className={clsx(
            'w-12 h-12 rounded-full flex items-center justify-center',
            darkMode ? 'bg-[#2a2a4a]' : 'bg-emerald-50'
          )}>
            <Crown className={clsx('h-6 w-6', darkMode ? 'text-zinc-500' : 'text-emerald-400')} />
          </div>
          <div>
            <h2 className={clsx('text-lg font-semibold', darkMode ? 'text-white' : 'text-emerald-800')}>免费用户</h2>
            <p className={clsx('text-xs', darkMode ? 'text-zinc-500' : 'text-emerald-500/70')}>开通会员享受更多权益</p>
          </div>
        </div>
      </div>

      {/* Benefits list */}
      <div className="glass-card p-3 mb-4">
        <h2 className={clsx('text-sm font-semibold mb-3', darkMode ? 'text-white' : 'text-emerald-800')}>会员权益</h2>
        <div className="space-y-2">
          {benefits.map((benefit) => (
            <div key={benefit.name} className="flex items-center gap-3 px-2 py-2">
              {benefit.unlocked ? (
                <Check className={clsx('h-4 w-4', darkMode ? 'text-emerald-400' : 'text-emerald-500')} />
              ) : (
                <Lock className={clsx('h-4 w-4', darkMode ? 'text-zinc-600' : 'text-emerald-300')} />
              )}
              <span className={clsx(
                'text-sm',
                benefit.unlocked
                  ? (darkMode ? 'text-zinc-200' : 'text-emerald-800')
                  : (darkMode ? 'text-zinc-500' : 'text-emerald-400/70')
              )}>
                {benefit.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing cards */}
      <div className="glass-card p-3 mb-4">
        <h2 className={clsx('text-sm font-semibold mb-3', darkMode ? 'text-white' : 'text-emerald-800')}>选择套餐</h2>
        <div className="grid grid-cols-3 gap-2">
          {pricingPlans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={clsx(
                'relative rounded-xl p-3 text-center transition-all border-2',
                selectedPlan === plan.id
                  ? (darkMode ? 'border-emerald-400' : 'border-emerald-500')
                  : (darkMode ? 'border-transparent' : 'border-transparent')
              )}
            >
              <div className={clsx(
                'absolute inset-0 rounded-xl bg-gradient-to-br opacity-20',
                plan.gradient
              )} />
              <div className="relative">
                {plan.badge && (
                  <span className={clsx(
                    'absolute -top-1 -right-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold',
                    darkMode ? 'bg-emerald-600/50 text-emerald-200' : 'bg-emerald-500 text-white'
                  )}>
                    {plan.badge}
                  </span>
                )}
                <p className={clsx('text-xs font-medium mb-1', darkMode ? 'text-zinc-300' : 'text-emerald-700')}>{plan.name}</p>
                <p className={clsx('text-lg font-bold', darkMode ? 'text-white' : 'text-emerald-800')}>
                  <span className="text-xs">¥</span>{plan.price}
                </p>
                <p className={clsx('text-[10px]', darkMode ? 'text-zinc-500' : 'text-emerald-400/70')}>/{plan.unit}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Subscribe button */}
      <button className={clsx(
        'w-full rounded-xl py-3 mb-4 text-sm font-bold flex items-center justify-center gap-2 transition-all',
        darkMode
          ? 'bg-emerald-600/40 text-emerald-300 hover:bg-emerald-600/60 border border-emerald-500/30'
          : 'bg-emerald-500 text-white hover:bg-emerald-600'
      )}>
        <Crown className="h-4 w-4" />
        立即开通
      </button>

      {/* FAQ */}
      <div className="glass-card p-3">
        <h2 className={clsx('text-sm font-semibold mb-3', darkMode ? 'text-white' : 'text-emerald-800')}>常见问题</h2>
        <div className="space-y-1">
          {faqs.map((faq, index) => (
            <div key={index}>
              <button
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                className={clsx(
                  'w-full flex items-center justify-between px-2 py-2 rounded-lg text-sm transition-colors',
                  darkMode ? 'hover:bg-[#3a3a5a] text-zinc-300' : 'hover:bg-green-50 text-emerald-700'
                )}
              >
                <span>{faq.q}</span>
                {expandedFaq === index ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {expandedFaq === index && (
                <p className={clsx('px-2 pb-2 text-xs', darkMode ? 'text-zinc-500' : 'text-emerald-500/70')}>
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
