/**
 * Worksheet 2 Component - Visit Schedule
 * Semi-automatic mode: AI extraction + user editing
 * With subject data extraction for verification checklists
 */

import React, { useState } from 'react';
import { Card, Button } from '../common';
import { useStore, useVisitSchedule, useProtocolFiles, useSubjectFiles, useSubjectVisits, useSubjectVisitItems } from '../../hooks/useStore';
import { VisitSchedule } from '@shared/types/core';
import { SubjectVisitData, SubjectVisitItemData } from '@shared/types/worksheet';

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
  const subjectFiles = useSubjectFiles();
  const subjectVisits = useSubjectVisits();
  const subjectVisitItems = useSubjectVisitItems();
  const {
    setVisitSchedule,
    addVisitScheduleItem,
    updateVisitScheduleItem,
    deleteVisitScheduleItem,
    setSubjectVisits,
    setSubjectVisitItems,
    setProcessing,
    setError,
  } = useStore();

  const [isExtracting, setIsExtracting] = useState(false);
  const [isExtractingSubjects, setIsExtractingSubjects] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

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

  /**
   * Extract subject data from medical records
   */
  const handleExtractSubjectData = async () => {
    // Check if visit schedule exists
    if (visitSchedule.length === 0) {
      setError('无法提取', '请先提取访视计划');
      return;
    }

    // Check if there are subject files
    if (subjectFiles.length === 0) {
      setError('无法提取', '请先在存储区B上传受试者文件');
      return;
    }

    // Get completed subject files
    const completedFiles = subjectFiles.filter(
      (f) => f.status === 'completed' && f.extractedText
    );

    if (completedFiles.length === 0) {
      setError('无法提取', '请等待文件处理完成后再提取受试者数据');
      return;
    }

    // Prepare visit schedule summary for AI
    const visitScheduleSummary = visitSchedule.map((visit) =>
      `${visit.visitNumber}. ${visit.visitName} (${visit.windowStart}~${visit.windowEnd})`
    ).join('\n');

    const visitItemsSummary = visitSchedule.map((visit) => {
      const procedures = visit.procedures.map((p) => `${visit.visitNumber}-${p.name}`).join(', ');
      const assessments = visit.assessments.map((a) => `${visit.visitNumber}-${a.name}`).join(', ');
      return [procedures, assessments].filter(Boolean).join(', ');
    }).join('\n');

    setIsExtractingSubjects(true);
    setProcessing(true, '正在提取受试者数据...');

    try {
      const allSubjectVisits: SubjectVisitData[] = [];
      const allSubjectVisitItems: SubjectVisitItemData[] = [];

      // Process each subject file
      for (const file of completedFiles) {
        const content = file.extractedText || '';

        // Step 1: Extract subject number
        const numberResult = await window.electronAPI.extractSubjectNumber(content);
        if (!numberResult.success) {
          console.error('Failed to extract subject number:', numberResult.error);
          continue;
        }

        const subjectNumber = numberResult.data || `SUB-${Date.now()}`;

        // Step 2: Extract subject visit dates
        const visitsResult = await window.electronAPI.extractSubjectVisits(
          content,
          visitScheduleSummary
        );

        if (visitsResult.success && visitsResult.data) {
          visitsResult.data.forEach((visit) => {
            allSubjectVisits.push({
              id: `sv-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              subjectNumber,
              visitScheduleId: visit.visitScheduleId,
              actualVisitDate: visit.actualVisitDate,
              status: visit.status as 'completed' | 'pending' | 'missed' | 'not_applicable',
              notes: visit.notes,
              _aiExtracted: true,
            });
          });
        }

        // Step 3: Extract subject visit items
        const itemsResult = await window.electronAPI.extractSubjectItems(
          content,
          visitItemsSummary
        );

        if (itemsResult.success && itemsResult.data) {
          itemsResult.data.forEach((item) => {
            allSubjectVisitItems.push({
              id: `svi-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              subjectNumber,
              visitScheduleId: item.visitScheduleId,
              itemName: item.itemName,
              itemType: item.itemType as 'procedure' | 'assessment',
              actualDate: item.actualDate,
              status: item.status as 'completed' | 'pending' | 'not_done' | 'not_applicable',
              notes: item.notes,
              _aiExtracted: true,
            });
          });
        }

        // Update progress
        const currentIndex = completedFiles.indexOf(file) + 1;
        setProcessing(true, `正在提取受试者数据 (${currentIndex}/${completedFiles.length})...`);
      }

      // Save to store
      setSubjectVisits(allSubjectVisits);
      setSubjectVisitItems(allSubjectVisitItems);

      setShowPreview(true);
    } catch (error) {
      setError('提取失败', error instanceof Error ? error.message : '未知错误');
    } finally {
      setIsExtractingSubjects(false);
      setProcessing(false);
    }
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
              <>
                <Button variant="secondary" onClick={handleExtractSubjectData} loading={isExtractingSubjects}>
                  提取受试者数据
                </Button>
                <Button variant="secondary" onClick={handleClear}>
                  清空
                </Button>
              </>
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

      {/* Subject Data Preview */}
      {subjectVisits.length > 0 || subjectVisitItems.length > 0 ? (
        <Card
          title="受试者数据预览"
          subtitle={`已提取 ${new Set(subjectVisits.map(v => v.subjectNumber)).size} 名受试者的数据`}
          actions={
            <Button variant="secondary" onClick={() => setShowPreview(!showPreview)}>
              {showPreview ? '隐藏预览' : '显示预览'}
            </Button>
          }
        >
          {showPreview && (
            <div className="space-y-6">
              {/* Visit Time Preview */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">访视时间核对表预览</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 border-b text-left">受试者编号</th>
                        {visitSchedule.slice(0, 5).map((visit) => (
                          <th key={visit.id} className="px-4 py-2 border-b text-left">
                            {visit.visitNumber}-{visit.visitName}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from(new Set(subjectVisits.map(v => v.subjectNumber))).slice(0, 3).map((subjectNumber) => (
                        <tr key={subjectNumber}>
                          <td className="px-4 py-2 border-b">{subjectNumber}</td>
                          {visitSchedule.slice(0, 5).map((visit) => {
                            const subjectVisit = subjectVisits.find(
                              (v) => v.subjectNumber === subjectNumber && v.visitScheduleId === visit.id
                            );
                            return (
                              <td key={visit.id} className="px-4 py-2 border-b">
                                {subjectVisit?.actualVisitDate || '-'}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {subjectVisits.length > 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    共 {new Set(subjectVisits.map(v => v.subjectNumber)).size} 名受试者 × {visitSchedule.length} 个访视
                  </p>
                )}
              </div>

              {/* Visit Item Time Preview */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">访视项目时间核对表预览</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 border-b text-left">受试者编号</th>
                        {visitSchedule.slice(0, 3).flatMap((visit) =>
                          visit.procedures.slice(0, 3).map((proc) => (
                            <th key={`${visit.id}-${proc.id}`} className="px-4 py-2 border-b text-left">
                              {visit.visitNumber}-{proc.name}
                            </th>
                          ))
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from(new Set(subjectVisitItems.map(v => v.subjectNumber))).slice(0, 3).map((subjectNumber) => (
                        <tr key={subjectNumber}>
                          <td className="px-4 py-2 border-b">{subjectNumber}</td>
                          {visitSchedule.slice(0, 3).flatMap((visit) =>
                            visit.procedures.slice(0, 3).map((proc) => {
                              const subjectItem = subjectVisitItems.find(
                                (i) => i.subjectNumber === subjectNumber && i.visitScheduleId === visit.id && i.itemName === proc.name
                              );
                              return (
                                <td key={`${visit.id}-${proc.id}`} className="px-4 py-2 border-b">
                                  {subjectItem?.actualDate || '-'}
                                </td>
                              );
                            })
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {subjectVisitItems.length > 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    共 {new Set(subjectVisitItems.map(v => v.subjectNumber)).size} 名受试者 × {
                      visitSchedule.reduce((sum, visit) => sum + visit.procedures.length + visit.assessments.length, 0)
                    } 个项目
                  </p>
                )}
              </div>
            </div>
          )}
        </Card>
      ) : visitSchedule.length > 0 && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <span className="text-4xl">📋</span>
            <div>
              <p className="text-base text-blue-700 font-medium">受试者数据待提取</p>
              <p className="text-sm text-blue-600">上传受试者文件后，点击"提取受试者数据"生成核对表</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitScheduleEditor;
