// src/Components/ErrorBoundary.tsx
import React, { Component, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

// Wrapper component to use navigate hook in class component
const ErrorBoundaryWithNavigate: React.FC<Props> = props => {
  const navigate = useNavigate()
  return <ErrorBoundary {...props} navigate={navigate} />
}

interface ErrorBoundaryProps extends Props {
  navigate?: (path: string) => void
}

class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    // Redirect to home on error
    if (this.props.navigate) {
      this.props.navigate('/')
    }
  }

  componentDidUpdate(_prevProps: ErrorBoundaryProps, prevState: State) {
    // Redirect when error state changes to true
    if (this.state.hasError && !prevState.hasError && this.props.navigate) {
      this.props.navigate('/')
    }
  }

  render() {
    if (this.state.hasError) {
      // Show nothing or a loading state while redirecting
      return (
        <div className='redirecting'>
          <p>Redirecting to home...</p>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundaryWithNavigate
