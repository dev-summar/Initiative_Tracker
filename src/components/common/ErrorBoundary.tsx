import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallbackTitle?: string
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('UI crash:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-6 py-12 text-center">
          <h2 className="text-lg font-semibold text-ink">
            {this.props.fallbackTitle ?? 'Something went wrong'}
          </h2>
          <p className="max-w-md text-sm text-ink-muted">{this.state.error.message}</p>
          <button
            type="button"
            onClick={() => this.setState({ error: null })}
            className="mt-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
