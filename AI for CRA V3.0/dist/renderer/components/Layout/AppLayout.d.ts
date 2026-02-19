/**
 * App Layout Component - Main application layout
 * Header with worksheet tabs and content area
 */
import React from 'react';
interface AppLayoutProps {
    title: string;
    subtitle?: string;
    version?: string;
    activeWorksheet: 1 | 2 | 3;
    onWorksheetChange: (worksheet: 1 | 2 | 3) => void;
    onExportToExcel?: () => void;
    children: React.ReactNode;
}
export declare const AppLayout: React.FC<AppLayoutProps>;
export default AppLayout;
//# sourceMappingURL=AppLayout.d.ts.map