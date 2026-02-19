/**
 * Worksheet 3 Component - Medication Records
 * Assisted entry mode: AI recognition + user confirmation
 */

import React, { useState } from 'react';
import { Card, Button } from '../common';
import { useStore, useMedications, useSubjectFiles } from '../../hooks/useStore';
import { MedicationRecord } from '@shared/types/core';

// ============================================================================
// Types
// ============================================================================

interface MedicationCardProps {
  medication: MedicationRecord;
  isEditing: boolean;
  onConfirm: () => void;
  onEdit: (updates: Partial<MedicationRecord>) => void;
  onCancel: () => void;
}

// ============================================================================
// Subcomponents
// ============================================================================

/**
 * Medication card component
 */
const MedicationCard: React.FC<MedicationCardProps> = ({
  medication,
  isEditing,
  onConfirm,
  onEdit,
  onCancel,
}) => {
  const [editedMed, setEditedMed] = useState<Partial<MedicationRecord>>({
    medicationName: medication.medicationName,
    dosage: medication.dosage,
    frequency: medication.frequency,
    route: medication.route,
    indication: medication.indication,
    notes: medication.notes,
  });

  const handleSave = () => {
    onEdit(editedMed);
  };

  if (isEditing) {
    return (
      <div className="p-6 bg-purple-50 border-2 border-purple-300 rounded-2xl">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">药物名称</label>
              <input
                type="text"
                value={editedMed.medicationName || ''}
                onChange={(e) => setEditedMed({ ...editedMed, medicationName: e.target.value })}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="药物名称"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">剂量</label>
              <input
                type="text"
                value={editedMed.dosage || ''}
                onChange={(e) => setEditedMed({ ...editedMed, dosage: e.target.value })}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="例如: 100mg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">频次</label>
              <input
                type="text"
                value={editedMed.frequency || ''}
                onChange={(e) => setEditedMed({ ...editedMed, frequency: e.target.value })}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="例如: 每日一次"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">给药途径</label>
              <select
                value={editedMed.route || ''}
                onChange={(e) => setEditedMed({ ...editedMed, route: e.target.value })}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">请选择</option>
                <option value="口服">口服</option>
                <option value="静脉注射">静脉注射</option>
                <option value="肌肉注射">肌肉注射</option>
                <option value="皮下注射">皮下注射</option>
                <option value="外用">外用</option>
                <option value="吸入">吸入</option>
                <option value="其他">其他</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">适应症</label>
              <input
                type="text"
                value={editedMed.indication || ''}
                onChange={(e) => setEditedMed({ ...editedMed, indication: e.target.value })}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="用药原因"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">备注</label>
            <textarea
              value={editedMed.notes || ''}
              onChange={(e) => setEditedMed({ ...editedMed, notes: e.target.value })}
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              rows={2}
              placeholder="可选备注信息"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave}>保存并确认</Button>
            <Button variant="secondary" onClick={onCancel}>
              取消
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Determine card styling based on status
  const getCardStyles = () => {
    if (medication._userConfirmed) {
      return 'bg-success-50 border-success-300';
    }
    if (medication._aiRecognized) {
      return 'bg-yellow-50 border-yellow-300';
    }
    return 'bg-white border-gray-200';
  };

  return (
    <div className={`p-6 rounded-2xl border-2 shadow-sm hover:shadow-md transition-all ${getCardStyles()}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-4 mb-4">
            <span className="text-3xl">💊</span>
            <h3 className="text-xl font-semibold text-gray-900">{medication.medicationName}</h3>

            {/* Status badges */}
            <div className="flex gap-2">
              {medication._aiRecognized && !medication._userConfirmed && (
                <span className="px-3 py-1 text-sm font-medium bg-yellow-100 text-yellow-700 rounded-full">
                  AI识别待确认
                </span>
              )}
              {medication._userConfirmed && (
                <span className="px-3 py-1 text-sm font-medium bg-success-100 text-success-700 rounded-full">
                  已确认
                </span>
              )}
              {medication._confidence && (
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    medication._confidence === 'high'
                      ? 'bg-green-100 text-green-700'
                      : medication._confidence === 'medium'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  置信度: {medication._confidence === 'high' ? '高' : medication._confidence === 'medium' ? '中' : '低'}
                </span>
              )}
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">剂量</p>
              <p className="text-base font-medium text-gray-900">{medication.dosage}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">频次</p>
              <p className="text-base font-medium text-gray-900">{medication.frequency}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">途径</p>
              <p className="text-base font-medium text-gray-900">{medication.route}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">适应症</p>
              <p className="text-base font-medium text-gray-900">{medication.indication}</p>
            </div>
          </div>

          {/* Date range */}
          <div className="flex items-center gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">开始日期</p>
              <p className="text-base font-medium text-gray-900">
                {medication.startDate instanceof Date
                  ? medication.startDate.toLocaleDateString('zh-CN')
                  : new Date(medication.startDate).toLocaleDateString('zh-CN')}
              </p>
            </div>
            {medication.endDate && (
              <>
                <span className="text-gray-400">→</span>
                <div>
                  <p className="text-sm text-gray-500 mb-1">结束日期</p>
                  <p className="text-base font-medium text-gray-900">
                    {medication.endDate instanceof Date
                      ? medication.endDate.toLocaleDateString('zh-CN')
                      : new Date(medication.endDate).toLocaleDateString('zh-CN')}
                  </p>
                </div>
              </>
            )}
            {!medication.endDate && (
              <div>
                <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-700 rounded-full">
                  进行中
                </span>
              </div>
            )}
          </div>

          {/* Notes */}
          {medication.notes && (
            <div className="p-3 bg-white bg-opacity-60 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-medium">备注:</span> {medication.notes}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {!medication._userConfirmed && (
            <Button onClick={onConfirm}>确认</Button>
          )}
          <Button variant="secondary" onClick={() => onEdit(medication)}>
            编辑
          </Button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const MedicationReviewer: React.FC = () => {
  const medications = useMedications();
  const subjectFiles = useSubjectFiles();
  const {
    setMedications,
    addMedicationItem,
    updateMedicationItem,
    deleteMedicationItem,
    confirmMedicationItem,
    setProcessing,
    setError,
  } = useStore();

  const [isRecognizing, setIsRecognizing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  /**
   * Recognize medications from subject files
   */
  const handleRecognizeMedications = async () => {
    // Check if there are subject files
    if (subjectFiles.length === 0) {
      setError('无法识别', '请先在存储区B上传受试者文件');
      return;
    }

    // Get combined extracted text from all completed subject files
    const completedFiles = subjectFiles.filter(
      (f) => f.status === 'completed' && f.extractedText
    );

    if (completedFiles.length === 0) {
      setError('无法识别', '请等待文件处理完成后再识别用药信息');
      return;
    }

    // Combine all extracted text
    const subjectContent = completedFiles
      .map((f) => `=== ${f.name} ===\n${f.extractedText}`)
      .join('\n\n');

    console.log('[MedicationReviewer] Recognizing from', completedFiles.length, 'files');
    console.log('[MedicationReviewer] Content length:', subjectContent.length);

    setIsRecognizing(true);
    setProcessing(true, '正在识别用药信息...');

    try {
      const result = await window.electronAPI.recognizeMedications(subjectContent);

      if (result.success) {
        setMedications(result.data);
      } else {
        setError(result.error.userMessage, result.error.technicalMessage);
      }
    } catch (error) {
      setError('识别失败', error instanceof Error ? error.message : '未知错误');
    } finally {
      setIsRecognizing(false);
      setProcessing(false);
    }
  };

  /**
   * Add new medication manually
   */
  const handleAddMedication = () => {
    const newMedication: MedicationRecord = {
      id: `med-${Date.now()}`,
      medicationName: '新用药',
      dosage: '',
      frequency: '',
      route: '口服',
      startDate: new Date(),
      indication: '',
      _aiRecognized: false,
      _userConfirmed: true,
    };
    addMedicationItem(newMedication);
    setEditingId(newMedication.id);
  };

  /**
   * Handle save edit
   */
  const handleSaveEdit = (id: string, updates: Partial<MedicationRecord>) => {
    updateMedicationItem(id, updates);
    setEditingId(null);
  };

  /**
   * Clear all medications
   */
  const handleClear = () => {
    setMedications([]);
  };

  // Statistics
  const pendingCount = medications.filter((m) => m._aiRecognized && !m._userConfirmed).length;
  const confirmedCount = medications.filter((m) => m._userConfirmed).length;
  const highConfidenceCount = medications.filter((m) => m._confidence === 'high').length;

  return (
    <div className="space-y-6">
      {/* Main Card */}
      <Card
        title="用药记录"
        subtitle="AI辅助识别 + 用户确认模式"
        actions={
          <div className="flex gap-3">
            <Button variant="primary" onClick={handleRecognizeMedications} loading={isRecognizing}>
              AI识别用药
            </Button>
            <Button variant="secondary" onClick={handleAddMedication}>
              添加用药
            </Button>
            {medications.length > 0 && (
              <Button variant="secondary" onClick={handleClear}>
                清空
              </Button>
            )}
          </div>
        }
      >
        {/* Empty state */}
        {medications.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">💊</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">暂无用药记录</h3>
            <p className="text-lg text-gray-500">
              点击"AI识别用药"自动识别，或点击"添加用药"手动录入
            </p>
          </div>
        )}

        {/* Medication list */}
        <div className="space-y-4">
          {medications.map((medication) => (
            <MedicationCard
              key={medication.id}
              medication={medication}
              isEditing={editingId === medication.id}
              onConfirm={() => confirmMedicationItem(medication.id)}
              onEdit={(updates) => handleSaveEdit(medication.id, updates)}
              onCancel={() => setEditingId(null)}
            />
          ))}
        </div>
      </Card>

      {/* Statistics */}
      {medications.length > 0 && (
        <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-4xl">💊</span>
              <div>
                <p className="text-base text-purple-700 font-medium">用药总数</p>
                <p className="text-3xl font-bold text-purple-900">{medications.length}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-base text-purple-700 font-medium">待确认</p>
                <p className="text-2xl font-bold text-purple-900">{pendingCount}</p>
              </div>
              <div>
                <p className="text-base text-purple-700 font-medium">已确认</p>
                <p className="text-2xl font-bold text-purple-900">{confirmedCount}</p>
              </div>
              <div>
                <p className="text-base text-purple-700 font-medium">高置信度</p>
                <p className="text-2xl font-bold text-purple-900">{highConfidenceCount}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicationReviewer;
