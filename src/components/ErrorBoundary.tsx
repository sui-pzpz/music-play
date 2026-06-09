import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-screen items-center justify-center bg-green-50">
          <div className="text-center">
            <div className="mb-4 text-6xl">🎵</div>
            <h2 className="text-xl font-bold text-zinc-800">出了点问题</h2>
            <p className="mt-2 text-sm text-zinc-500">应用遇到了一个错误</p>
            <button
              onClick={() => {
                this.setState({ hasError: false })
                window.location.reload()
              }}
              className="mt-4 rounded-lg bg-orange-600 px-6 py-2 text-sm font-medium text-white hover:bg-orange-500 transition-colors"
            >
              重新加载
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
