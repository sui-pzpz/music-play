import { useToastStore } from '@/store/toastStore'
import { X } from 'lucide-react'
import { clsx } from 'clsx'
import { usePlayerStore } from '@/store/playerStore'

const typeStyles = {
  info: { light: 'bg-blue-50 border-blue-200 text-blue-700', dark: 'bg-[#1e2a3a] border-[#2a3a5a] text-blue-300' },
  success: { light: 'bg-green-50 border-green-200 text-green-700', dark: 'bg-[#1e3a2a] border-[#2a4a3a] text-green-300' },
  error: { light: 'bg-red-50 border-red-200 text-red-700', dark: 'bg-[#3a1a1a] border-[#4a2a2a] text-red-300' },
  warning: { light: 'bg-emerald-50 border-emerald-200 text-emerald-700', dark: 'bg-[#3a2a1a] border-[#4a3a2a] text-emerald-300' },
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore()
  const darkMode = usePlayerStore((s) => s.darkMode)

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={clsx(
            'pointer-events-auto flex items-center gap-2 rounded-lg border px-4 py-3 text-sm shadow-lg',
            'animate-[toastIn_0.3s_ease-out]',
            darkMode ? typeStyles[toast.type].dark : typeStyles[toast.type].light
          )}
        >
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 rounded-full p-0.5 opacity-60 hover:opacity-100 transition-opacity"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
