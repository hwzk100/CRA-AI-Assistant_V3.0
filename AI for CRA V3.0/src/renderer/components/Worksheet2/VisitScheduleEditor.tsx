/**
 * Worksheet 2 Component - Visit Schedule
 * Semi-automatic mode: AI extraction + user editing
 */

import React, { useState } from 'react';
import { Card, Button } from '../common';
import { useStore, useVisitSchedule, useProtocolFiles } from '../../hooks/useStore';
import { VisitSchedule } from '@shared/types/core';

// ============================================================================
// Types
// ============================================================================

interface VisitCardProps {
  visit: VisitSchedule;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (updates: Partial<VisitSchedule>) => void;
  onCancel: () => void;
}

// ============================================================================
// Subcomponents
// ============================================================================

/**
 * Visit schedule card component
 */
const VisitCard: React.FC<VisitCardProps> = ({ visit, isEditing, onEdit, onSave, onCancel }) => {
  const [editedVisit, setEditedVisit] = useState<Partial<VisitSchedule>>({
    visitNumber: visit.visitNumber,
    visitName: visit.visitName,
    windowStart: visit.windowStart,
    windowEnd: visit.windowEnd,
    notes: visit.notes,
  });

  const handleSave = () => {
    onSave(editedVisit);
  };

  if (isEditing) {
    return (
      <div className="p-6 bg-blue-50 border-2 border-blue-300 rounded-2xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">访视编号</label>
              <input
                type="text"
                value={editedVisit.visitNumber || ''}
                onChange={(e) => setEditedVisit({ ...editedVisit, visitNumber: e.target.value })}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="例如: 1, -1, 1+1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">访视名称</label>
              <input
                type="text"
                value={editedVisit.visitName || ''}
                onChange={(e) => setEditedVisit({ ...editedVisit, visitName: e.target.value })}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="例如: 筛选期访视"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">窗口开始</label>
              <input
                type="text"
                value={editedVisit.windowStart || ''}
                onChange={(e) => setEditedVisit({ ...editedVisit, windowStart: e.target.value })}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="例如: Day -28"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">窗口结束</label>
              <input
                type="text"
                value={editedVisit.windowEnd || ''}
                onChange={(e) => setEditedVisit({ ...editedVisit, windowEnd: e.target.value })}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="例如: Day -1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">备注</label>
            <textarea
              value={editedVisit.notes || ''}
              onChange={(e) => setEditedVisit({ ...editedVisit, notes: e.target.value })}
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
              placeholder="可选备注信息"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave}>保存</Button>
            <Button variant="secondary" onClick={onCancel}>
              取消
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-6 bg-white rounded-2xl border-2 shadow-sm hover:shadow-md transition-all ${
        visit._aiExtracted && !visit._userEdited
          ? 'border-yellow-300'
          : visit._userEdited
          ? 'border-success-300'
          : 'border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-4 mb-4">
            <span className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-700 text-xl font-bold">
              {visit.visitNumber}
            </span>
            <h3 className="text-xl font-semibold text-gray-900">{visit.visitName}</h3>

            {/* Status badges */}
            <div className="flex gap-2">
              {visit._aiExtracted && !visit._userEdited && (
                <span className="px-3 py-1 text-sm font-medium bg-yellow-100 text-yellow-700 rounded-full">
                  AI提取待确认
                </span>
              )}
              {visit._userEdited && (
                <span className="px-3 py-1 text-sm font-medium bg-success-100 text-success-700 rounded-full">
                  已确认
                </span>
              )}
            </div>
          </div>

          {/* Time window */}
          <p className="text-lg text-gray-600 mb-4">
            <span className="font-medium">时间窗口:</span> {visit.windowStart} ~ {visit.windowEnd}
          </p>

          {/* Procedures */}
          {visit.procedures.length > 0 && (
            <div className="mb-4">
              <h4 className="text-base font-medium text-gray-700 mb-2">程序</h4>
              <div className="flex flex-wrap gap-2">
                {visit.procedures.map((proc) => (
                  <span
                    key={proc.id}
                    className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg"
                  >
                    {proc.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Assessments */}
          {visit.assessments.length > 0 && (
            <div className="mb-4">
              <h4 className="text-base font-medium text-gray-700 mb-2">评估</h4>
              <div className="flex flex-wrap gap-2">
                {visit.assessments.map((assess) => (
                  <span
                    key={assess.id}
                    className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg"
                  >
                    {assess.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {visit.notes && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-medium">备注:</span> {visit.notes}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <Button variant="secondary" onClick={onEdit}>
          编辑
        </Button>
      </div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const VisitScheduleEditor: React.FC = () => {
  const visitSchedule = useVisitSchedule();
  const protocolFiles = useProtocolFiles();
  const {
    setVisitSchedule,
    addVisitScheduleItem,
    updateVisitScheduleItem,
    deleteVisitScheduleItem,
    setProcessing,
    setError,
  } = useStore();

  const [isExtracting, setIsExtracting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  /**
   * Extract visit schedule from protocol
   */
  const handleExtractSchedule = async () => {
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
      setError('无法提取', '请等待文件处理完成后再提取访视计划');
      return;
    }

    // Combine all extracted text
    const protocolContent = completedFiles
      .map((f) => `=== ${f.name} ===\n${f.extractedText}`)
      .join('\n\n');

    console.log('[VisitScheduleEditor] Extracting from', completedFiles.length, 'files');
    console.log('[VisitScheduleEditor] Content length:', protocolContent.length);

    setIsExtracting(true);
    setProcessing(true, '正在提取访视计划...');

    try {
      const result = await window.electronAPI.extractVisitSchedule(protocolContent);

      if (result.success) {
        setVisitSchedule(result.data);
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
   * Add new visit
   */
  const handleAddVisit = () => {
    const newVisit: VisitSchedule = {
      id: `visit-${Date.now()}`,
      visitNumber: String(visitSchedule.length + 1),
      visitName: '新访视',
      windowStart: 'Day 1',
      windowEnd: 'Day 1',
      procedures: [],
      assessments: [],
      _aiExtracted: false,
      _userEdited: true,
    };
    addVisitScheduleItem(newVisit);
    setEditingId(newVisit.id);
  };

  /**
   * Save visit updates
   */
  const handleSaveVisit = (id: string, updates: Partial<VisitSchedule>) => {
    updateVisitScheduleItem(id, updates);
    setEditingId(null);
  };

  /**
   * Clear all visits
   */
  const handleClear = () => {
    setVisitSchedule([]);
  };

  return (
    <div className="space-y-6">
      {/* Main Card */}
      <Card
        title="访视计划"
        subtitle="AI自动提取 + 用户编辑模式"
        actions={
          <div className="flex gap-3">
            <Button variant="primary" onClick={handleExtractSchedule} loading={isExtracting}>
              AI提取访视
            </Button>
            <Button variant="secondary" onClick={handleAddVisit}>
              添加访视
            </Button>
            {visitSchedule.length > 0 && (
              <Button variant="secondary" onClick={handleClear}>
                清空
              </Button>
            )}
          </div>
        }
      >
        {/* Empty state */}
        {visitSchedule.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">暂无访视计划</h3>
            <p className="text-lg text-gray-500">
              点击"AI提取访视"自动生成，或点击"添加访视"手动创建
            </p>
          </div>
        )}

        {/* Visit list */}
        <div className="space-y-4">
          {visitSchedule.map((visit) => (
            <VisitCard
              key={visit.id}
              visit={visit}
              isEditing={editingId === visit.id}
              onEdit={() => setEditingId(visit.id)}
              onSave={(updates) => handleSaveVisit(visit.id, updates)}
              onCancel={() => setEditingId(null)}
            />
          ))}
        </div>
      </Card>

      {/* Statistics */}
      {visitSchedule.length > 0 && (
        <div className="bg-primary-50 border-2 border-primary-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-4xl">📅</span>
              <div>
                <p className="text-base text-primary-700 font-medium">访视总数</p>
                <p className="text-3xl font-bold text-primary-900">{visitSchedule.length}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-base text-primary-700 font-medium">
                待确认: {visitSchedule.filter((v) => v._aiExtracted && !v._userEdited).length}
              </p>
              <p className="text-base text-primary-700 font-medium">
                已确认: {visitSchedule.filter((v) => v._userEdited).length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitScheduleEditor;
