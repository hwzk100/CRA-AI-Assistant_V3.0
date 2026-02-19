/**
 * Worksheet 1 Component - Inclusion/Exclusion Criteria
 * AI-extracted criteria display with edit capabilities
 */

import React, { useState } from 'react';
import { Card, Button } from '../common';
import { useStore, useInclusionCriteria, useExclusionCriteria, useProtocolFiles } from '../../hooks/useStore';
import { InclusionCriteria, ExclusionCriteria } from '@shared/types/core';
import { SUCCESS_MESSAGES } from '@shared/constants/app';

// ============================================================================
// Types
// ============================================================================

interface CriteriaCardProps {
  criteria: InclusionCriteria | ExclusionCriteria;
  type: 'inclusion' | 'exclusion';
  onEdit?: () => void;
}

// ============================================================================
// Subcomponents
// ============================================================================

/**
 * Individual criteria card component
 */
const CriteriaCard: React.FC<CriteriaCardProps> = ({ criteria, type, onEdit }) => {
  const isInclusion = type === 'inclusion';

  return (
    <div
      className={`p-5 rounded-xl border-2 transition-all ${
        isInclusion
          ? 'bg-success-50 border-success-200 hover:border-success-300'
          : 'bg-danger-50 border-danger-200 hover:border-danger-300'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Number badge */}
        <span
          className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full text-xl font-bold ${
            isInclusion ? 'bg-success-200 text-success-800' : 'bg-danger-200 text-danger-800'
          }`}
        >
          {criteria.number}
        </span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-lg text-gray-900 leading-relaxed">{criteria.description}</p>

          {/* Category badge */}
          {criteria.category && (
            <span
              className={`inline-block mt-3 px-4 py-1.5 text-sm font-medium rounded-full ${
                isInclusion
                  ? 'bg-success-100 text-success-700'
                  : 'bg-danger-100 text-danger-700'
              }`}
            >
              {criteria.category}
            </span>
          )}

          {/* Notes */}
          {criteria.notes && (
            <div className="mt-3 p-3 bg-white bg-opacity-60 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-medium">备注：</span>
                {criteria.notes}
              </p>
            </div>
          )}

          {/* AI extracted indicator */}
          {criteria._aiExtracted && !criteria._userEdited && (
            <span className="inline-block mt-3 px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
              AI提取待确认
            </span>
          )}
        </div>

        {/* Edit button */}
        {onEdit && (
          <Button variant="secondary" size="medium" onClick={onEdit}>
            编辑
          </Button>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const CriteriaSheet: React.FC = () => {
  const inclusionCriteria = useInclusionCriteria();
  const exclusionCriteria = useExclusionCriteria();
  const protocolFiles = useProtocolFiles();
  const { setInclusionCriteria, setExclusionCriteria, setProcessing, setError } = useStore();

  const [isExtracting, setIsExtracting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  /**
   * Extract criteria from protocol files
   */
  const handleExtractCriteria = async () => {
    // Check if there are protocol files
    if (protocolFiles.length === 0) {
      setError('无法提取', '请先在存储区A上传方案文件');
      return;
    }

    // Get combined extracted text from all completed protocol files
    const completedFiles = protocolFiles.filter(
      (f) => f.status === 'completed' && f.extractedText
    );

    if (completedFiles.length === 0) {
      setError('无法提取', '请等待文件处理完成后再提取入排标准');
      return;
    }

    // Combine all extracted text
    const protocolContent = completedFiles
      .map((f) => `=== ${f.name} ===\n${f.extractedText}`)
      .join('\n\n');

    console.log('[CriteriaSheet] Extracting from', completedFiles.length, 'files');
    console.log('[CriteriaSheet] Content length:', protocolContent.length);

    setIsExtracting(true);
    setProcessing(true, '正在提取入排标准...');

    try {
      // Call IPC to extract criteria with content
      const result = await window.electronAPI.extractCriteria(protocolContent);

      if (result.success) {
        setInclusionCriteria(result.data.inclusionCriteria);
        setExclusionCriteria(result.data.exclusionCriteria);
      } else {
        setError(result.error.userMessage, result.error.technicalMessage);
      }
    } catch (error) {
      setError('提取失败', error instanceof Error ? error.message : '未知错误');
    } finally {
      setIsExtracting(false);
      setProcessing(false);
    }
  };

  /**
   * Clear all criteria
   */
  const handleClear = () => {
    setInclusionCriteria([]);
    setExclusionCriteria([]);
  };

  return (
    <div className="space-y-6">
      {/* Main Card */}
      <Card
        title="入排标准核对"
        subtitle="从方案文件中AI自动提取入组和排除标准"
        actions={
          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={handleExtractCriteria}
              loading={isExtracting}
            >
              提取标准
            </Button>
            {(inclusionCriteria.length > 0 || exclusionCriteria.length > 0) && (
              <Button variant="secondary" onClick={handleClear}>
                清空
              </Button>
            )}
          </div>
        }
      >
        {/* Empty state */}
        {inclusionCriteria.length === 0 && exclusionCriteria.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">暂无入排标准</h3>
            <p className="text-lg text-gray-500">
              请先在存储区A上传方案文件，然后点击"提取标准"按钮
            </p>
          </div>
        )}

        {/* Inclusion Criteria */}
        {inclusionCriteria.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-success-200">
              <span className="text-2xl">✅</span>
              <h3 className="text-xl font-semibold text-gray-900">
                入组标准 ({inclusionCriteria.length})
              </h3>
            </div>
            <div className="space-y-4">
              {inclusionCriteria.map((criteria) => (
                <CriteriaCard
                  key={criteria.id}
                  criteria={criteria}
                  type="inclusion"
                />
              ))}
            </div>
          </div>
        )}

        {/* Exclusion Criteria */}
        {exclusionCriteria.length > 0 && (
          <div className="space-y-4 mt-8">
            <div className="flex items-center gap-3 pb-3 border-b border-danger-200">
              <span className="text-2xl">🚫</span>
              <h3 className="text-xl font-semibold text-gray-900">
                排除标准 ({exclusionCriteria.length})
              </h3>
            </div>
            <div className="space-y-4">
              {exclusionCriteria.map((criteria) => (
                <CriteriaCard
                  key={criteria.id}
                  criteria={criteria}
                  type="exclusion"
                />
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Summary Statistics */}
      {(inclusionCriteria.length > 0 || exclusionCriteria.length > 0) && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-success-50 border-2 border-success-200 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <span className="text-4xl">✅</span>
              <div>
                <p className="text-base text-success-700 font-medium">入组标准</p>
                <p className="text-3xl font-bold text-success-900">{inclusionCriteria.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-danger-50 border-2 border-danger-200 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <span className="text-4xl">🚫</span>
              <div>
                <p className="text-base text-danger-700 font-medium">排除标准</p>
                <p className="text-3xl font-bold text-danger-900">{exclusionCriteria.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CriteriaSheet;
