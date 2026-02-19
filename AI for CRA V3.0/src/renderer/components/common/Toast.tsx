/**
 * Toast/Alert Component - User-friendly notifications and error messages
 * Large, accessible, auto-dismissing toast notifications
 */

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ErrorSeverity } from '@shared/types/core';

// ============================================================================
// Types
// ============================================================================

export interface ToastProps {
  /** Toast message */
  message: string;
  /** Toast type/variant */
  variant?: 'info' | 'success' | 'warning' | 'danger' | 'error';
  /** Error severity (maps to variant) */
  severity?: ErrorSeverity;
  /** Auto-dismiss after delay (ms) */
  duration?: number | null;
  /** On close callback */
  onClose?: () => void;
  /** Show close button */
  closable?: boolean;
  /** Icon to display */
  icon?: React.ReactNode;
}

export interface AlertProps {
  /** Alert title */
  title?: string;
  /** Alert message */
  message: string;
  /** Alert variant */
  variant?: 'info' | 'success' | 'warning' | 'danger';
  /** On dismiss callback */
  onDismiss?: () => void;
  /** Action button */
  action?: { label: string; onClick: () => void };
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Toast Component
// ============================================================================

const variantConfig = {
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-500',
    icon: 'ℹ️',
    iconBg: 'bg-blue-100',
    text: 'text-blue-900',
  },
  success: {
    bg: 'bg-success-50',
    border: 'border-success-500',
    icon: '✅',
    iconBg: 'bg-success-100',
    text: 'text-success-900',
  },
  warning: {
    bg: 'bg-warning-50',
    border: 'border-warning-500',
    icon: '⚠️',
    iconBg: 'bg-warning-100',
    text: 'text-warning-900',
  },
  danger: {
    bg: 'bg-danger-50',
    border: 'border-danger-500',
    icon: '🚫',
    iconBg: 'bg-danger-100',
    text: 'text-danger-900',
  },
  error: {
    bg: 'bg-danger-50',
    border: 'border-danger-500',
    icon: '❌',
    iconBg: 'bg-danger-100',
    text: 'text-danger-900',
  },
};

/**
 * Toast notification component
 */
export const Toast: React.FC<ToastProps> = ({
  message,
  variant = 'info',
  severity,
  duration = 5000,
  onClose,
  closable = true,
  icon,
}) => {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);

  // Map severity to variant
  const effectiveVariant = severity
    ? (severity === ErrorSeverity.CRITICAL ? 'danger' : severity === ErrorSeverity.WARNING ? 'warning' : 'info')
    : variant;

  const config = variantConfig[effectiveVariant];

  useEffect(() => {
    if (duration !== null) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, 200);
  };

  if (!visible) return null;

  return createPortal(
    <div
      className={`fixed bottom-6 right-6 max-w-lg w-full z-50 transition-all duration-200 ${
        exiting ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
      }`}
      role="alert"
      aria-live={effectiveVariant === 'danger' || effectiveVariant === 'error' ? 'assertive' : 'polite'}
    >
      <div className={`${config.bg} ${config.border} border-l-4 rounded-xl shadow-lg p-5`}>
        <div className="flex items-start gap-4">
          {/* Icon */}
          {icon ? (
            <div className={`flex-shrink-0 ${config.iconBg} rounded-full p-2`}>{icon}</div>
          ) : (
            <span className={`flex-shrink-0 text-2xl ${config.iconBg} rounded-full w-10 h-10 flex items-center justify-center`}>
              {config.icon}
            </span>
          )}

          {/* Message */}
          <div className="flex-1 min-w-0">
            <p className={`text-base font-medium ${config.text}`}>{message}</p>
          </div>

          {/* Close button */}
          {closable && (
            <button
              onClick={handleDismiss}
              className={`flex-shrink-0 ${config.text} hover:opacity-70 transition-opacity`}
              aria-label="关闭"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

// ============================================================================
// Alert Component (Inline)
// ============================================================================

/**
 * Inline alert component for use within content
 */
export const Alert: React.FC<AlertProps> = ({
  title,
  message,
  variant = 'info',
  onDismiss,
  action,
  className = '',
}) => {
  const config = variantConfig[variant];

  return (
    <div className={`${config.bg} ${config.border} border-l-4 rounded-xl p-5 ${className}`} role="alert">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <span className={`flex-shrink-0 text-2xl ${config.iconBg} rounded-full w-10 h-10 flex items-center justify-center`}>
          {config.icon}
        </span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && <h4 className={`text-lg font-semibold ${config.text} mb-1`}>{title}</h4>}
          <p className={`text-base ${config.text}`}>{message}</p>

          {/* Action button */}
          {action && (
            <button
              onClick={action.onClick}
              className={`mt-3 px-4 py-2 text-base font-medium ${config.text} ${config.iconBg} rounded-lg hover:opacity-80 transition-opacity`}
            >
              {action.label}
            </button>
          )}
        </div>

        {/* Dismiss button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`flex-shrink-0 ${config.text} hover:opacity-70 transition-opacity`}
            aria-label="关闭"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Toast Container (for multiple toasts)
// ============================================================================

export interface ToastItem {
  id: string;
  message: string;
  variant?: ToastProps['variant'];
  duration?: number | null;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return createPortal(
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-lg w-full">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          variant={toast.variant}
          duration={toast.duration}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>,
    document.body
  );
};

export default Toast;
