
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Portfolio ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center">
          <i className="ri-error-warning-line text-4xl text-red-400 mb-4"></i>
          <h3 className="text-xl font-semibold text-red-400 mb-2">Something went wrong</h3>
          <p className="text-red-300 mb-4">
            There was an error displaying your projects. Please try refreshing the page.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
