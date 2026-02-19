/**
 * Card Component - Container with header and content areas
 * Large, friendly, accessible card component
 */
import React from 'react';
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
/**
 * Card component with header, content, and optional actions
 */
export declare const Card: React.FC<CardProps>;
/**
 * Simple card without header
 */
export interface SimpleCardProps {
    children: React.ReactNode;
    className?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}
export declare const SimpleCard: React.FC<SimpleCardProps>;
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
export declare const InfoCard: React.FC<InfoCardProps>;
export default Card;
//# sourceMappingURL=Card.d.ts.map