/**
 * Button Component - Large, accessible, user-friendly buttons
 * Following WCAG AA guidelines with 44px minimum touch target
 */

import React from 'react';

// ============================================================================
// Types
// ============================================================================

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
export type ButtonSize = 'medium' | 'large';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button style variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Show loading spinner */
  loading?: boolean;
  /** Disable button */
  disabled?: boolean;
  /** Button content */
  children: React.ReactNode;
  /** Icon to display before text */
  icon?: React.ReactNode;
  /** Full width button */
  fullWidth?: boolean;
}

// ============================================================================
// Styles
// ============================================================================

const baseStyles = "font-medium transition-all duration-200 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl";

const sizeStyles: Record<ButtonSize, string> = {
  medium: "px-6 py-3 text-base min-h-[44px]",
  large: "px-8 py-4 text-lg min-h-[48px]",
};

const variantStyles: Record<ButtonVariant, { base: string; hover: string; focusRing: string }> = {
  primary: {
    base: "bg-primary-600 text-white shadow-md",
    hover: "hover:bg-primary-700 hover:shadow-lg",
    focusRing: "focus:ring-primary-300",
  },
  secondary: {
    base: "bg-gray-100 text-gray-800 border border-gray-300",
    hover: "hover:bg-gray-200 hover:border-gray-400",
    focusRing: "focus:ring-gray-300",
  },
  danger: {
    base: "bg-danger-600 text-white shadow-md",
    hover: "hover:bg-danger-700 hover:shadow-lg",
    focusRing: "focus:ring-danger-300",
  },
  success: {
    base: "bg-success-600 text-white shadow-md",
    hover: "hover:bg-success-700 hover:shadow-lg",
    focusRing: "focus:ring-success-300",
  },
  warning: {
    base: "bg-warning-500 text-white shadow-md",
    hover: "hover:bg-warning-600 hover:shadow-lg",
    focusRing: "focus:ring-warning-300",
  },
};

// ============================================================================
// Component
// ============================================================================

/**
 * Loading spinner component
 */
const LoadingSpinner: React.FC = () => (
  <svg
    className="animate-spin h-5 w-5"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

/**
 * Button component with accessibility features
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'large',
  loading = false,
  disabled = false,
  children,
  icon,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const styles = variantStyles[variant];
  const isDisabled = disabled || loading;

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${styles.base} ${styles.hover} ${styles.focusRing} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      <span className="flex items-center justify-center gap-2">
        {loading ? (
          <>
            <LoadingSpinner />
            <span>处理中...</span>
          </>
        ) : (
          <>
            {icon && <span className="flex-shrink-0">{icon}</span>}
            <span>{children}</span>
          </>
        )}
      </span>
    </button>
  );
};

export default Button;
