/**
 * Error Boundary Component - Catch and handle React errors
 * User-friendly error display with recovery options
 */
import React, { Component, ErrorInfo, ReactNode } from 'react';
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
export declare class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props);
    static getDerivedStateFromError(error: Error): State;
    componentDidCatch(error: Error, errorInfo: ErrorInfo): void;
    handleReset: () => void;
    handleReload: () => void;
    render(): string | number | boolean | Iterable<React.ReactNode> | import("react/jsx-runtime").JSX.Element;
}
/**
 * Simple inline error fallback
 */
export interface InlineErrorFallbackProps {
    message: string;
    onRetry?: () => void;
}
export declare const InlineErrorFallback: React.FC<InlineErrorFallbackProps>;
/**
 * Loading error fallback with spinner
 */
export interface LoadingErrorFallbackProps {
    message: string;
}
export declare const LoadingErrorFallback: React.FC<LoadingErrorFallbackProps>;
export default ErrorBoundary;
//# sourceMappingURL=ErrorBoundary.d.ts.map