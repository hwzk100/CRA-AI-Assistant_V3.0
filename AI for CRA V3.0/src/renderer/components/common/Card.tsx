/**
 * Card Component - Container with header and content areas
 * Large, friendly, accessible card component
 */

import React from 'react';

// ============================================================================
// Types
// ============================================================================

export interface CardProps {
  /** Card title */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Card content */
  children: React.ReactNode;
  /** Action buttons for header */
  actions?: React.ReactNode;
  /** Icon to display next to title */
  icon?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Header background color variant */
  headerVariant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  /** Whether card is bordered */
  bordered?: boolean;
  /** Whether card has shadow */
  shadow?: boolean;
}

// ============================================================================
// Styles
// ============================================================================

const headerVariantStyles: Record<NonNullable<CardProps['headerVariant']>, string> = {
  default: 'bg-gradient-to-r from-gray-50 to-white border-gray-100',
  primary: 'bg-gradient-to-r from-primary-50 to-blue-50 border-primary-100',
  success: 'bg-gradient-to-r from-success-50 to-green-50 border-success-100',
  warning: 'bg-gradient-to-r from-warning-50 to-yellow-50 border-warning-100',
  danger: 'bg-gradient-to-r from-danger-50 to-red-50 border-danger-100',
};

// ============================================================================
// Component
// ============================================================================

/**
 * Card component with header, content, and optional actions
 */
export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  actions,
  icon,
  className = '',
  headerVariant = 'default',
  bordered = true,
  shadow = true,
}) => {
  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden ${
        bordered ? 'border border-gray-100' : ''
      } ${shadow ? 'shadow-lg hover:shadow-xl transition-shadow duration-200' : ''} ${className}`}
    >
      {/* Header */}
      <div className={`px-6 py-5 border-b ${headerVariantStyles[headerVariant]}`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            {icon && <div className="flex-shrink-0 text-primary-600">{icon}</div>}
            <div className="min-w-0">
              <h3 className="text-xl font-semibold text-gray-900 truncate">{title}</h3>
              {subtitle && <p className="text-base text-gray-500 mt-1">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">{children}</div>
    </div>
  );
};

/**
 * Simple card without header
 */
export interface SimpleCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const SimpleCard: React.FC<SimpleCardProps> = ({
  children,
  className = '',
  padding = 'md',
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-lg ${paddingStyles[padding]} ${className}`}
    >
      {children}
    </div>
  );
};

/**
 * Info card with icon and colored background
 */
export interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  variant?: 'info' | 'success' | 'warning' | 'danger';
  className?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  icon,
  title,
  description,
  variant = 'info',
  className = '',
}) => {
  const variantStyles = {
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    success: 'bg-success-50 border-success-200 text-success-900',
    warning: 'bg-warning-50 border-warning-200 text-warning-900',
    danger: 'bg-danger-50 border-danger-200 text-danger-900',
  };

  return (
    <div className={`${variantStyles[variant]} border-2 rounded-2xl p-6 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 text-2xl">{icon}</div>
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-semibold">{title}</h4>
          {description && <p className="text-base mt-1 opacity-90">{description}</p>}
        </div>
      </div>
    </div>
  );
};

export default Card;
