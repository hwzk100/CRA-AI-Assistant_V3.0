/**
 * ProgressBar Component - Accessible progress indicator
 * Large, visible progress tracking with percentage display
 */

import React from 'react';

// ============================================================================
// Types
// ============================================================================

export interface ProgressBarProps {
  /** Progress value (0-100) */
  value: number;
  /** Optional label */
  label?: string;
  /** Show percentage text */
  showPercentage?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Color variant */
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  /** Animated progress bar */
  animated?: boolean;
  /** Striped pattern */
  striped?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Styles
// ============================================================================

const sizeStyles = {
  sm: 'h-2',
  md: 'h-4',
  lg: 'h-6',
};

const variantStyles = {
  primary: 'bg-primary-600',
  success: 'bg-success-600',
  warning: 'bg-warning-500',
  danger: 'bg-danger-600',
};

// ============================================================================
// Component
// ============================================================================

/**
 * ProgressBar component with accessibility features
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  showPercentage = true,
  size = 'md',
  variant = 'primary',
  animated = true,
  striped = false,
  className = '',
}) => {
  // Clamp value between 0 and 100
  const clampedValue = Math.max(0, Math.min(100, value));
  const percentage = Math.round(clampedValue);

  return (
    <div className={className}>
      {/* Label row */}
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-2">
          {label && <span className="text-base font-medium text-gray-700">{label}</span>}
          {showPercentage && (
            <span className="text-lg font-semibold text-gray-900">{percentage}%</span>
          )}
        </div>
      )}

      {/* Progress bar */}
      <div
        className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeStyles[size]}`}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
      >
        <div
          className={`${variantStyles[variant]} ${sizeStyles[size]} rounded-full transition-all duration-300 ease-out ${
            animated ? 'animate-progress' : ''
          } ${striped ? 'bg-striped' : ''}`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
};

// ============================================================================
// File Upload Progress Component
// ============================================================================

export interface FileProgressProps {
  fileName: string;
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  className?: string;
}

export const FileProgress: React.FC<FileProgressProps> = ({
  fileName,
  progress,
  status,
  error,
  className = '',
}) => {
  const statusConfig = {
    pending: { icon: '⏳', color: 'text-gray-500', label: '等待处理' },
    processing: { icon: '⚙️', color: 'text-primary-600', label: '处理中' },
    completed: { icon: '✅', color: 'text-success-600', label: '完成' },
    failed: { icon: '❌', color: 'text-danger-600', label: '失败' },
  };

  const config = statusConfig[status];

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{config.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-base font-medium text-gray-900 truncate">{fileName}</p>
          <p className={`text-sm ${config.color}`}>{config.label}</p>
        </div>
        {status !== 'failed' && (
          <span className="text-lg font-semibold text-gray-900">{Math.round(progress)}%</span>
        )}
      </div>

      {status === 'processing' && (
        <ProgressBar value={progress} size="sm" variant="primary" showPercentage={false} />
      )}

      {status === 'failed' && error && (
        <p className="text-sm text-danger-600 mt-2 bg-danger-50 rounded-lg p-2">{error}</p>
      )}

      {status === 'completed' && (
        <ProgressBar value={100} size="sm" variant="success" showPercentage={false} />
      )}
    </div>
  );
};

export default ProgressBar;
