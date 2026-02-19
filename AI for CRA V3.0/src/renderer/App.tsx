/**
 * Main App Component
 * CRA AI Assistant V3.0
 */

import React, { useEffect, useState } from 'react';
import { AppLayout } from './components/Layout/AppLayout';
import { StorageZone } from './components/StorageZone/StorageZone';
import { CriteriaSheet } from './components/Worksheet1/CriteriaSheet';
import { VisitScheduleEditor } from './components/Worksheet2/VisitScheduleEditor';
import { MedicationReviewer } from './components/Worksheet3/MedicationReviewer';
import { ToastContainer } from './components/common/Toast';
import { useStore } from './hooks/useStore';
import { APP_INFO } from '@shared/constants/app';

// ============================================================================
// Main App Component
// ============================================================================

export const App: React.FC = () => {
  // Use the store directly to avoid multiple selector calls
  const store = useStore();

  const [toasts, setToasts] = useState<Array<{ id: string; message: string; variant: 'info' | 'success' | 'warning' | 'danger' }>>([]);

  // Initialize settings from main process on mount
  useEffect(() => {
    const initSettings = async () => {
      try {
        const result = await window.electronAPI.getSettings();
        if (result.success && result.data) {
          // Sync API key to store if different
          if (result.data.apiKey && result.data.apiKey !== store.apiKey) {
            store.setApiKey(result.data.apiKey);
          }
        }
      } catch (error) {
        console.error('Failed to initialize settings:', error);
      }
    };
    initSettings();
  }, []); // Run once on mount

  // Export to Excel function
  const handleExportToExcel = async () => {
    try {
      // First open save dialog to let user choose location
      const dialogResult = await window.electronAPI.saveFile(
        'CRA_Tracker.xlsx',
        [{ name: 'Excel文件', extensions: ['xlsx'] }]
      );

      if (dialogResult.success === false || dialogResult.data.canceled) {
        return;
      }

      const outputPath = dialogResult.data.filePath;
      store.setProcessing(true, '正在导出Excel...');

      const result = await window.electronAPI.exportTracker({
        outputPath,
        inclusionCriteria: store.inclusionCriteria,
        exclusionCriteria: store.exclusionCriteria,
        visitSchedule: store.visitSchedule,
        medications: store.medications,
      });

      if (result.success) {
        // Show success toast
        const id = `toast-${Date.now()}`;
        setToasts((prev) => [...prev, { id, message: `Excel已导出: ${result.data}`, variant: 'success' }]);
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
      } else {
        store.setError(result.error.userMessage, result.error.technicalMessage);
      }
    } catch (error) {
      store.setError('导出失败', error instanceof Error ? error.message : '未知错误');
    } finally {
      store.setProcessing(false);
    }
  };

  // Show error toast when error occurs
  useEffect(() => {
    if (store.lastError) {
      const id = `toast-${Date.now()}`;
      setToasts((prev) => [...prev, { id, message: store.lastError.message, variant: 'danger' }]);

      // Auto-remove after 5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    }
  }, [store.lastError]);

  // Remove toast
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Render worksheet content based on active tab
  const renderWorksheet = () => {
    switch (store.activeWorksheet) {
      case 1:
        return <CriteriaSheet />;
      case 2:
        return <VisitScheduleEditor />;
      case 3:
        return <MedicationReviewer />;
      default:
        return <CriteriaSheet />;
    }
  };

  return (
    <div className="app">
      {/* Main layout with storage zones and worksheet */}
      <AppLayout
        title={APP_INFO.NAME}
        version={APP_INFO.VERSION}
        activeWorksheet={store.activeWorksheet}
        onWorksheetChange={store.setActiveWorksheet}
        onExportToExcel={handleExportToExcel}
      >
        {/* Storage Zones */}
        <div className="flex gap-6 mb-6">
          <StorageZone zone="protocol" title="存储区A" subtitle="方案文件" />
          <StorageZone zone="subject" title="存储区B" subtitle="受试者文件" />
        </div>

        {/* Worksheet Content */}
        <div className="worksheet-content">
          {renderWorksheet()}
        </div>
      </AppLayout>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Processing Overlay */}
      {store.isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">处理中</h3>
              {store.processingStage && <p className="text-lg text-gray-600">{store.processingStage}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
