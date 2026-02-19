/**
 * Error Boundary Component - Catch and handle React errors
 * User-friendly error display with recovery options
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './Button';

// ============================================================================
// Types
// ============================================================================

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// ============================================================================
// Error Boundary Component
// ============================================================================

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    this.setState({
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg p-8">
            {/* Error Icon */}
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-danger-100 mb-4">
                <svg
                  className="h-10 w-10 text-danger-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">出错了</h2>
              <p className="text-lg text-gray-600">
                应用程序遇到了意外错误
              </p>
            </div>

            {/* Error Details */}
            {this.state.error && (
              <div className="bg-danger-50 rounded-xl p-4 mb-6">
                <p className="text-base text-danger-900 font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            {/* Error Info (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="mb-6">
                <summary className="text-sm font-medium text-gray-700 cursor-pointer mb-2">
                  错误详情（开发模式）
                </summary>
                <pre className="text-xs text-gray-600 bg-gray-100 p-3 rounded-lg overflow-auto max-h-40">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button onClick={this.handleReset} className="flex-1">
                尝试恢复
              </Button>
              <Button variant="secondary" onClick={this.handleReload} className="flex-1">
                重新加载
              </Button>
            </div>

            {/* Support */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                如果问题持续存在，请联系技术支持
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// Fallback Components
// ============================================================================

/**
 * Simple inline error fallback
 */
export interface InlineErrorFallbackProps {
  message: string;
  onRetry?: () => void;
}

export const InlineErrorFallback: React.FC<InlineErrorFallbackProps> = ({
  message,
  onRetry,
}) => {
  return (
    <div className="bg-danger-50 border-2 border-danger-200 rounded-2xl p-6 text-center">
      <div className="text-4xl mb-3">⚠️</div>
      <h3 className="text-lg font-semibold text-danger-900 mb-2">加载失败</h3>
      <p className="text-base text-danger-700 mb-4">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="danger">
          重试
        </Button>
      )}
    </div>
  );
};

/**
 * Loading error fallback with spinner
 */
export interface LoadingErrorFallbackProps {
  message: string;
}

export const LoadingErrorFallback: React.FC<LoadingErrorFallbackProps> = ({ message }) => {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-danger-200 border-t-danger-600 mb-4"></div>
        <p className="text-base text-danger-700">{message}</p>
      </div>
    </div>
  );
};

export default ErrorBoundary;
