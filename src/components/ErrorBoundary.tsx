import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'
import { usePlayerStore } from '@/store/playerStore'
import { clsx } from 'clsx'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo)
  }

  componentDidUpdate() {
    if (this.state.hasError) {
      setTimeout(() => {
        this.setState({ hasError: false, error: null })
      }, 5000)
    }
  }

  render() {
    const { hasError, error } = this.state
    const darkMode = usePlayerStore.getState().darkMode

    if (hasError) {
      return (
        <div className={clsx(
          'min-h-screen flex flex-col items-center justify-center p-8',
          darkMode ? 'bg-[#1a1a2e]' : 'bg-gradient-to-b from-[#f4f8f2] to-[#FAF6F0]'
        )}>
          <div className={clsx(
            'p-6 rounded-full mb-6',
            darkMode ? 'bg-[#2a2a4a]' : 'bg-emerald-50'
          )}>
            <AlertCircle className={clsx('h-12 w-12', darkMode ? 'text-emerald-400' : 'text-emerald-500')} />
          </div>
          <h2 className={clsx('text-xl font-semibold mb-2', darkMode ? 'text-white' : 'text-emerald-800')}>
            页面出错了
          </h2>
          <p className={clsx('text-sm mb-6', darkMode ? 'text-zinc-400' : 'text-emerald-600/70')}>
            {error?.message || '未知错误'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className={clsx(
              'px-6 py-2 rounded-full transition-all',
              darkMode
                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
            )}
          >
            重试
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary