/**
 * ProgressBar Component - Accessible progress indicator
 * Large, visible progress tracking with percentage display
 */
import React from 'react';
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
/**
 * ProgressBar component with accessibility features
 */
export declare const ProgressBar: React.FC<ProgressBarProps>;
export interface FileProgressProps {
    fileName: string;
    progress: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    error?: string;
    className?: string;
}
export declare const FileProgress: React.FC<FileProgressProps>;
export default ProgressBar;
//# sourceMappingURL=ProgressBar.d.ts.map