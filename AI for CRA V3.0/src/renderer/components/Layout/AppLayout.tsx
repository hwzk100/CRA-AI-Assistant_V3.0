/**
 * App Layout Component - Main application layout
 * Header with worksheet tabs and content area
 */

import React, { useState, useEffect } from 'react';
import { useStore } from '../../hooks/useStore';
import { APP_INFO } from '@shared/constants/app';

// ============================================================================
// Types
// ============================================================================

interface AppLayoutProps {
  title: string;
  subtitle?: string;
  version?: string;
  activeWorksheet: 1 | 2 | 3;
  onWorksheetChange: (worksheet: 1 | 2 | 3) => void;
  onExportToExcel?: () => void;
  children: React.ReactNode;
}

// ============================================================================
// API Key Dialog Component
// ============================================================================

const ApiKeyDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
  currentApiKey: string;
}> = ({ isOpen, onClose, onSave, currentApiKey }) => {
  const [apiKey, setApiKey] = useState(currentApiKey);
  const [isLoading, setIsLoading] = useState(false);

  // Update state when currentApiKey changes (on mount or when dialog opens)
  useEffect(() => {
    if (isOpen) {
      setApiKey(currentApiKey);
    }
  }, [isOpen, currentApiKey]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!apiKey.trim()) return;

    setIsLoading(true);
    try {
      // Call the settings:setApiKey IPC handler
      const result = await window.electronAPI.setApiKey(apiKey.trim());

      if (result.success === false) {
        alert('API密钥保存失败: ' + (result.error?.userMessage || '未知错误'));
        return;
      }

      onSave(apiKey.trim());
      onClose();
      alert('API密钥配置成功！');
    } catch (error) {
      console.error('Failed to save API key:', error);
      alert('API密钥保存失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">配置API密钥</h2>

        <div className="mb-4">
          <label className="block text-base font-medium text-gray-700 mb-2">
            GLM-4 API密钥
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="请输入智谱AI API密钥"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800">
            <strong>获取API密钥：</strong>访问
            <a href="https://open.bigmodel.cn/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
              open.bigmodel.cn
            </a>
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !apiKey.trim()}
            className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg text-base font-medium hover:bg-primary-700 disabled:opacity-50"
          >
            {isLoading ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Worksheet Tab Component
// ============================================================================

interface WorksheetTabProps {
  number: 1 | 2 | 3;
  title: string;
  description: string;
  icon: string;
  isActive: boolean;
  onClick: () => void;
}

const WorksheetTab: React.FC<WorksheetTabProps> = ({
  number,
  title,
  description,
  icon,
  isActive,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex-1 p-6 rounded-2xl border-2 transition-all ${
        isActive
          ? 'bg-primary-50 border-primary-500 shadow-md'
          : 'bg-white border-gray-200 hover:border-primary-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center gap-4">
        <span className="text-3xl">{icon}</span>
        <div className="text-left">
          <h3 className={`text-lg font-semibold ${isActive ? 'text-primary-900' : 'text-gray-900'}`}>
            {title}
          </h3>
          <p className={`text-sm ${isActive ? 'text-primary-700' : 'text-gray-500'}`}>
            {description}
          </p>
        </div>
      </div>
    </button>
  );
};

// ============================================================================
// Main Layout Component
// ============================================================================

export const AppLayout: React.FC<AppLayoutProps> = ({
  title,
  subtitle,
  version,
  activeWorksheet,
  onWorksheetChange,
  onExportToExcel,
  children,
}) => {
  const { sidebarExpanded, toggleSidebar, apiKey, setApiKey } = useStore();
  const [showApiDialog, setShowApiDialog] = useState(false);

  const hasApiKey = Boolean(apiKey);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                CRA
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                {subtitle && <p className="text-base text-gray-500">{subtitle}</p>}
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-4">
              {/* Export to Excel Button */}
              <button
                onClick={onExportToExcel}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-primary-600 text-white hover:bg-primary-700 flex items-center gap-2"
              >
                <span>📊</span>
                <span>导出Excel</span>
              </button>

              {/* API Key Status */}
              <button
                onClick={() => setShowApiDialog(true)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  hasApiKey
                    ? 'bg-success-50 text-success-700 border border-success-200 hover:bg-success-100'
                    : 'bg-warning-50 text-warning-700 border border-warning-200 hover:bg-warning-100'
                }`}
              >
                {hasApiKey ? '✓ API已配置' : '⚠ 请配置API密钥'}
              </button>

              {/* Version */}
              {version && (
                <span className="text-sm text-gray-400">v{version}</span>
              )}
            </div>
          </div>
        </div>

        {/* Worksheet Tabs */}
        <div className="px-6 pb-4">
          <div className="flex gap-4">
            <WorksheetTab
              number={1}
              title="入排标准"
              description="AI自动提取"
              icon="📋"
              isActive={activeWorksheet === 1}
              onClick={() => onWorksheetChange(1)}
            />
            <WorksheetTab
              number={2}
              title="访视计划"
              description="AI提取+编辑"
              icon="📅"
              isActive={activeWorksheet === 2}
              onClick={() => onWorksheetChange(2)}
            />
            <WorksheetTab
              number={3}
              title="用药记录"
              description="AI识别+确认"
              icon="💊"
              isActive={activeWorksheet === 3}
              onClick={() => onWorksheetChange(3)}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>© 2024 {APP_INFO.AUTHOR}</span>
          <span>{APP_INFO.HOMEPAGE}</span>
        </div>
      </footer>

      {/* API Key Dialog */}
      <ApiKeyDialog
        isOpen={showApiDialog}
        onClose={() => setShowApiDialog(false)}
        onSave={(newApiKey) => setApiKey(newApiKey)}
        currentApiKey={apiKey}
      />
    </div>
  );
};

export default AppLayout;
