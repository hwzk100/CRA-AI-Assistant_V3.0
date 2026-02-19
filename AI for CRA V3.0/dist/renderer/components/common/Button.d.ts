/**
 * Button Component - Large, accessible, user-friendly buttons
 * Following WCAG AA guidelines with 44px minimum touch target
 */
import React from 'react';
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
/**
 * Button component with accessibility features
 */
export declare const Button: React.FC<ButtonProps>;
export default Button;
//# sourceMappingURL=Button.d.ts.map