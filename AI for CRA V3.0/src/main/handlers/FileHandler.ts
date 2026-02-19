/**
 * File Handler - IPC handlers for file operations
 */

import { IpcMain, BrowserWindow } from 'electron';
import { join, extname, basename } from 'path';
import { promises as fsPromises } from 'fs';
import * as pdfParse from 'pdf-parse';
import Tesseract from 'tesseract.js';
import AdmZip from 'adm-zip';

// ============================================================================
// File Type Detection
// ============================================================================

function detectFileType(filePath: string): string {
  const ext = extname(filePath).toLowerCase();
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.webp'];
  const archiveExtensions = ['.zip', '.rar', '.7z'];

  if (ext === '.pdf') return 'pdf';
  if (imageExtensions.includes(ext)) return 'image';
  if (archiveExtensions.includes(ext)) return 'archive';

  throw new Error(`Unsupported file type: ${ext}`);
}

// ============================================================================
// File Processing
// ============================================================================

/**
 * Process PDF file - extract text content
 */
async function processPDF(filePath: string): Promise<string> {
  const dataBuffer = await fsPromises.readFile(filePath);
  const data = await pdfParse.default(dataBuffer);
  return data.text;
}

/**
 * Process image file - OCR text extraction
 */
async function processImage(filePath: string): Promise<string> {
  const worker = await Tesseract.createWorker('chi_sim+eng');
  const { data: { text } } = await worker.recognize(filePath);
  await worker.terminate();
  return text;
}

/**
 * Process archive file - extract contents
 */
async function processArchive(filePath: string): Promise<{ files: string[] }> {
  const zip = new AdmZip(filePath);
  const entries = zip.getEntries();
  return {
    files: entries.map((e: any) => e.entryName),
  };
}

/**
 * Generate unique file ID
 */
function generateFileId(): string {
  return `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// ============================================================================
// Setup Handler
// ============================================================================

export const setupFileHandlers = (ipcMain: IpcMain, mainWindow: BrowserWindow | null): void => {
  /**
   * Upload file to storage zone
   */
  ipcMain.handle(
    'file:upload',
    async (_event, { zone, filePath }: { zone: string; filePath: string }) => {
      try {
        const fs = require('fs');
        const stats = fs.statSync(filePath);

        const fileInfo = {
          id: generateFileId(),
          name: basename(filePath),
          path: filePath,
          type: detectFileType(filePath),
          size: stats.size,
          status: 'pending',
          uploadedAt: new Date(),
          progress: 0,
          extractedText: '' as string | undefined,
        };

        // Update status to processing
        fileInfo.status = 'processing';
        fileInfo.progress = 10;

        // Process file based on type
        let extractedText = '';

        switch (fileInfo.type) {
          case 'pdf':
            fileInfo.status = 'pdf_parsing';
            fileInfo.progress = 30;
            extractedText = await processPDF(filePath);
            break;

          case 'image':
            fileInfo.status = 'ocr_processing';
            fileInfo.progress = 30;
            extractedText = await processImage(filePath);
            break;

          case 'archive':
            fileInfo.status = 'processing';
            fileInfo.progress = 50;
            const archiveResult = await processArchive(filePath);
            extractedText = JSON.stringify(archiveResult);
            break;
        }

        fileInfo.extractedText = extractedText;
        fileInfo.status = 'completed';
        fileInfo.progress = 100;
        (fileInfo as any).completedAt = new Date();

        return {
          success: true,
          data: fileInfo,
        };
      } catch (error) {
        return {
          success: false,
          error: {
            code: 'FILE_UPLOAD_FAILED',
            userMessage: '文件上传失败',
            technicalMessage: error instanceof Error ? error.message : 'Unknown error',
          },
        };
      }
    }
  );

  /**
   * Delete file from storage zone
   */
  ipcMain.handle(
    'file:delete',
    async (_event, { zone, fileId }: { zone: string; fileId: string }) => {
      try {
        return {
          success: true,
          data: undefined,
        };
      } catch (error) {
        return {
          success: false,
          error: {
            code: 'FILE_DELETE_FAILED',
            userMessage: '文件删除失败',
            technicalMessage: error instanceof Error ? error.message : 'Unknown error',
          },
        };
      }
    }
  );

  /**
   * Process file (trigger re-processing)
   */
  ipcMain.handle(
    'file:process',
    async (_event, { zone, fileId }: { zone: string; fileId: string }) => {
      try {
        return {
          success: true,
          data: undefined,
        };
      } catch (error) {
        return {
          success: false,
          error: {
            code: 'FILE_PROCESS_FAILED',
            userMessage: '文件处理失败',
            technicalMessage: error instanceof Error ? error.message : 'Unknown error',
          },
        };
      }
    }
  );

  /**
   * Get all files from storage zone
   */
  ipcMain.handle(
    'file:getAll',
    async (_event, { zone }: { zone: string }) => {
      try {
        return {
          success: true,
          data: [],
        };
      } catch (error) {
        return {
          success: false,
          error: {
            code: 'FILE_GET_ALL_FAILED',
            userMessage: '获取文件列表失败',
            technicalMessage: error instanceof Error ? error.message : 'Unknown error',
          },
        };
      }
    }
  );
};
