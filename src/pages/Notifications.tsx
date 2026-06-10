import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayerStore } from '@/store/playerStore'
import { clsx } from 'clsx'
import { ArrowLeft, Bell, CheckCheck, Settings, User, Heart } from 'lucide-react'

type NotificationTab = 'all' | 'system' | 'member' | 'social'

const tabs: { key: NotificationTab; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'system', label: '系统' },
  { key: 'member', label: '会员' },
  { key: 'social', label: '互动' },
]

const placeholderNotifications = [
  { id: 1, type: 'system' as const, title: '系统更新', content: '新版本已发布，快来体验新功能', time: '2分钟前', read: false },
  { id: 2, type: 'member' as const, title: '会员优惠', content: '限时特惠，年卡会员立减30元', time: '1小时前', read: false },
  { id: 3, type: 'social' as const, title: '新粉丝', content: '用户小明关注了你', time: '3小时前', read: true },
  { id: 4, type: 'system' as const, title: '安全提醒', content: '检测到新设备登录，请确认是否为本人操作', time: '昨天', read: true },
  { id: 5, type: 'social' as const, title: '评论回复', content: '用户小红回复了你的评论', time: '2天前', read: true },
]

const typeIcons = {
  system: Settings,
  member: User,
  social: Heart,
}

export default function Notifications() {
  const navigate = useNavigate()
  const darkMode = usePlayerStore((s) => s.darkMode)
  const [activeTab, setActiveTab] = useState<NotificationTab>('all')
  const [notifications, setNotifications] = useState(placeholderNotifications)

  const filtered = activeTab === 'all'
    ? notifications
    : notifications.filter((n) => n.type === activeTab)

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

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

      {/* Title */}
      <div className="flex items-center gap-2 mb-4">
        <Bell className={clsx('h-6 w-6', darkMode ? 'text-emerald-400' : 'text-emerald-600')} />
        <h1 className={clsx('text-xl font-bold', darkMode ? 'text-white' : 'text-emerald-800')}>通知中心</h1>
      </div>

      {/* Tab filter */}
      <div className="flex gap-1 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={clsx(
              'flex-1 rounded-xl px-3 py-2 text-sm font-medium transition-all border',
              activeTab === tab.key
                ? (darkMode ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200')
                : (darkMode ? 'text-zinc-500 hover:bg-[#1e1e3a] hover:text-zinc-300 border-transparent' : 'text-emerald-500/70 hover:bg-emerald-50/50 hover:text-emerald-700 border-green-100')
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification list */}
      <div className="glass-card p-3 mb-4">
        {filtered.length === 0 ? (
          <div className={clsx('text-center py-12', darkMode ? 'text-zinc-500' : 'text-emerald-400/60')}>
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">暂无通知</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filtered.map((notification) => {
              const Icon = typeIcons[notification.type]
              return (
                <div
                  key={notification.id}
                  className={clsx(
                    'flex items-start gap-3 px-2 py-3 rounded-lg transition-colors relative',
                    darkMode ? 'hover:bg-[#3a3a5a]' : 'hover:bg-green-50'
                  )}
                >
                  <div className={clsx(
                    'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                    darkMode ? 'bg-[#2a2a4a]' : 'bg-emerald-50'
                  )}>
                    <Icon className={clsx('h-4 w-4', darkMode ? 'text-emerald-400' : 'text-emerald-500')} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={clsx('text-sm font-medium', darkMode ? 'text-zinc-200' : 'text-emerald-800')}>{notification.title}</p>
                      {!notification.read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className={clsx('text-xs mt-0.5', darkMode ? 'text-zinc-500' : 'text-emerald-500/70')}>{notification.content}</p>
                    <p className={clsx('text-[10px] mt-1', darkMode ? 'text-zinc-600' : 'text-emerald-400/50')}>{notification.time}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Mark all read */}
      {notifications.some((n) => !n.read) && (
        <button
          onClick={markAllRead}
          className={clsx(
            'w-full rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-all',
            darkMode
              ? 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/20'
              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
          )}
        >
          <CheckCheck className="h-4 w-4" />
          全部标记已读
        </button>
      )}
    </div>
  )
}
