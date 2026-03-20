'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, info);
  }

  reset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }

      return (
        <div className="rounded bg-red-50 p-4 text-center">
          <p className="text-sm font-semibold text-red-600">오류가 발생했습니다</p>
          <p className="mt-1 text-xs text-red-500">{this.state.error.message}</p>
          <button
            onClick={this.reset}
            className="mt-3 rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
          >
            다시 시도
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
