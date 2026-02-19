/**
 * Toast/Alert Component - User-friendly notifications and error messages
 * Large, accessible, auto-dismissing toast notifications
 */
import React from 'react';
import { ErrorSeverity } from '@shared/types/core';
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
    action?: {
        label: string;
        onClick: () => void;
    };
    /** Additional CSS classes */
    className?: string;
}
/**
 * Toast notification component
 */
export declare const Toast: React.FC<ToastProps>;
/**
 * Inline alert component for use within content
 */
export declare const Alert: React.FC<AlertProps>;
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
export declare const ToastContainer: React.FC<ToastContainerProps>;
export default Toast;
//# sourceMappingURL=Toast.d.ts.map