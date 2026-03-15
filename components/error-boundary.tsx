"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
          <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            We apologize for the inconvenience. Please try refreshing the page or contact support if the problem
            persists.
          </p>
          <div className="flex gap-4">
            <Button onClick={() => window.location.reload()}>Refresh Page</Button>
            <Button variant="outline" onClick={() => this.setState({ hasError: false, error: null })}>
              Try Again
            </Button>
          </div>
          {this.state.error && process.env.NODE_ENV === "development" && (
            <div className="mt-8 p-4 bg-muted rounded-md text-left overflow-auto max-w-full">
              <p className="font-mono text-sm">{this.state.error.toString()}</p>
            </div>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
