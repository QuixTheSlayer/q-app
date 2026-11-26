import React from 'react'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode | ((error: Error, reset: () => void) => React.ReactNode)
  onError?: (error: Error, info: React.ErrorInfo) => void
  resetKey?: string | number
}

interface State {
  error: Error | null
}

class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, info)
    this.props.onError?.(error, info)
  }

  componentDidUpdate(prevProps: Props) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.reset()
    }
  }

  reset = () => this.setState({ error: null })

  render() {
    const { error } = this.state

    if (!error) return this.props.children

    const { fallback } = this.props

    if (typeof fallback === 'function') return fallback(error, this.reset)
    if (fallback) return fallback

    return (
      <div className="p-3 rounded-md border border-destructive bg-destructive/10 text-destructive text-[13px]">
        Something went wrong while rendering this.
      </div>
    )
  }
}

export default ErrorBoundary
