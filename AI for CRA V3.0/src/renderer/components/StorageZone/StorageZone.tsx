/**
 * Storage Zone Component - File upload and management
 * Zone A: Protocol files, Zone B: Subject files
 */

import React, { useState } from 'react';
import { Button } from '../common';
import { useStore } from '../../hooks/useStore';
import { StorageZone as StorageZoneEnum, FileInfo } from '@shared/types/core';

// ============================================================================
// Types
// ============================================================================

interface StorageZoneProps {
  zone: 'protocol' | 'subject';
  title: string;
  subtitle: string;
}

// ============================================================================
// File Card Component
// ============================================================================

interface FileCardProps {
  file: FileInfo;
  onDelete: () => void;
}

const FileCard: React.FC<FileCardProps> = ({ file, onDelete }) => {
  const getStatusIcon = () => {
    switch (file.status) {
      case 'completed':
        return '✅';
      case 'processing':
      case 'ocr_processing':
      case 'pdf_parsing':
        return '⚙️';
      case 'failed':
        return '❌';
      default:
        return '📄';
    }
  };

  const getStatusText = () => {
    switch (file.status) {
      case 'completed':
        return '已完成';
      case 'processing':
        return '处理中';
      case 'ocr_processing':
        return 'OCR识别中';
      case 'pdf_parsing':
        return 'PDF解析中';
      case 'failed':
        return '失败';
      default:
        return '等待处理';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{getStatusIcon()}</span>
        <div className="flex-1 min-w-0">
          <p className="text-base font-medium text-gray-900 truncate">{file.name}</p>
          <p className="text-sm text-gray-500">{getStatusText()}</p>
        </div>
        <Button variant="secondary" size="medium" onClick={onDelete}>
          删除
        </Button>
      </div>

      {/* Progress bar for processing files */}
      {file.status !== 'completed' && file.status !== 'failed' && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all"
              style={{ width: `${file.progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Main Storage Zone Component
// ============================================================================

export const StorageZone: React.FC<StorageZoneProps> = ({ zone, title, subtitle }) => {
  const {
    protocolFiles,
    subjectFiles,
    addFile,
    removeFile,
    updateFileStatus,
  } = useStore();

  const [isUploading, setIsUploading] = useState(false);

  const files = zone === 'protocol' ? protocolFiles : subjectFiles;
  const storageZone =
    zone === 'protocol' ? StorageZoneEnum.PROTOCOL : StorageZoneEnum.SUBJECT;

  /**
   * Handle file upload
   */
  const handleUpload = async () => {
    try {
      const dialogResult = await window.electronAPI.openFile();

      if (dialogResult.success === false) {
        console.error('Dialog error:', dialogResult.error);
        return;
      }

      if (dialogResult.data.canceled || dialogResult.data.filePaths.length === 0) {
        return;
      }

      setIsUploading(true);

      // Upload each file
      for (const filePath of dialogResult.data.filePaths) {
        const uploadResult = await window.electronAPI.uploadFile(zone, filePath);

        if (uploadResult.success) {
          addFile(storageZone, uploadResult.data);
        } else {
          console.error('Upload failed:', uploadResult.error);
        }
      }
    } catch (error) {
      console.error('File selection error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Handle file delete
   */
  const handleDelete = async (fileId: string) => {
    await window.electronAPI.deleteFile(zone, fileId);
    removeFile(storageZone, fileId);
  };

  /**
   * Clear all files
   */
  const handleClear = () => {
    files.forEach((file) => removeFile(storageZone, file.id));
  };

  return (
    <div className="flex-1 bg-white border border-gray-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            <p className="text-base text-gray-500 mt-1">{subtitle}</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-primary-600">{files.length}</p>
            <p className="text-xs text-gray-500">个文件</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {files.length === 0 ? (
          /* Empty state */
          <div className="text-center py-12">
            <div className="text-5xl mb-3">📁</div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">暂无文件</h4>
            <p className="text-base text-gray-500 mb-4">
              {zone === 'protocol'
                ? '上传临床试验方案文件（PDF、图片）'
                : '上传受试者医疗记录（PDF、图片）'}
            </p>
            <Button
              variant="primary"
              onClick={handleUpload}
              loading={isUploading}
            >
              上传文件
            </Button>
          </div>
        ) : (
          /* File list */
          <div className="space-y-3">
            {files.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                onDelete={() => handleDelete(file.id)}
              />
            ))}

            {/* Action buttons */}
            <div className="flex gap-3 pt-3 border-t border-gray-100">
              <Button
                variant="primary"
                onClick={handleUpload}
                loading={isUploading}
                className="flex-1"
              >
                添加文件
              </Button>
              {files.length > 0 && (
                <Button
                  variant="secondary"
                  onClick={handleClear}
                >
                  清空
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StorageZone;
