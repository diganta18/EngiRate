import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Film, Home } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by EngiRate ErrorBoundary:', error, errorInfo)
    this.setState({ error, errorInfo })
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF8F5] text-[#141414] flex items-center justify-center p-4">
          <div className="paper-card w-full max-w-lg bg-white p-8 rounded-sm shadow-xl border border-[#E6E2DA] space-y-5 text-center">
            {/* Clapper / Reel Icon */}
            <div className="w-12 h-12 rounded-full bg-red-100 border border-red-200 text-red-700 flex items-center justify-center mx-auto">
              <Film className="w-6 h-6 animate-pulse" />
            </div>

            <div className="space-y-1.5">
              <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-sm inline-block">
                Technical Difficulties • Reel Snapped
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#141414]">
                A Runtime Exception Occurred
              </h2>
              <p className="text-xs font-mono text-[#666660] max-w-sm mx-auto">
                The projectionist encountered an unhandled state. The syllabus remains unyielding.
              </p>
            </div>

            {/* Error Message Monospace Box */}
            {this.state.error && (
              <div className="p-3 bg-neutral-900 text-neutral-200 font-mono text-[11px] text-left rounded-sm overflow-x-auto max-h-36 border border-neutral-800">
                <span className="text-red-400 font-bold block mb-1">
                  {this.state.error.name}: {this.state.error.message}
                </span>
                {this.state.errorInfo?.componentStack && (
                  <pre className="text-neutral-500 text-[10px] leading-tight mt-1 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack.slice(0, 300)}...
                  </pre>
                )}
              </div>
            )}

            {/* Recovery Actions */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="px-4 py-2 bg-[#0A0A0A] hover:bg-neutral-800 text-[#FAF8F5] text-xs font-mono font-semibold rounded-sm flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Reel</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="px-4 py-2 bg-white hover:bg-neutral-50 text-[#141414] border border-[#E6E2DA] text-xs font-mono rounded-sm flex items-center gap-1.5 transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to Catalog</span>
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
