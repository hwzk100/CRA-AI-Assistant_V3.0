/**
 * Dialog Handler - IPC handlers for file dialogs
 */

import { IpcMain, BrowserWindow, dialog } from 'electron';

// ============================================================================
// Setup Handler
// ============================================================================

export const setupDialogHandlers = (ipcMain: IpcMain, mainWindow: BrowserWindow | null): void => {
  /**
   * Open file selection dialog
   */
  ipcMain.handle('dialog:openFile', async () => {
    if (!mainWindow) {
      return {
        success: false,
        error: {
          code: 'NO_MAIN_WINDOW',
          userMessage: '主窗口未初始化',
          technicalMessage: 'Main window is not available',
        },
      };
    }

    try {
      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile', 'multiSelections'],
        filters: [
          { name: 'PDF文档', extensions: ['pdf'] },
          { name: '图片文件', extensions: ['png', 'jpg', 'jpeg', 'tiff', 'bmp'] },
          { name: '压缩文件', extensions: ['zip'] },
          { name: '所有文件', extensions: ['*'] },
        ],
      });

      if (result.canceled) {
        return {
          success: true,
          data: { canceled: true, filePaths: [] },
        };
      }

      return {
        success: true,
        data: { canceled: false, filePaths: result.filePaths },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DIALOG_OPEN_FAILED',
          userMessage: '打开文件对话框失败',
          technicalMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  });

  /**
   * Open save file dialog
   */
  ipcMain.handle('dialog:saveFile', async (_event, { defaultName, filters }: { defaultName?: string; filters?: Array<{ name: string; extensions: string[] }> }) => {
    if (!mainWindow) {
      return {
        success: false,
        error: {
          code: 'NO_MAIN_WINDOW',
          userMessage: '主窗口未初始化',
          technicalMessage: 'Main window is not available',
        },
      };
    }

    try {
      const result = await dialog.showSaveDialog(mainWindow, {
        defaultPath: defaultName,
        filters: filters || [
          { name: 'Excel文件', extensions: ['xlsx'] },
        ],
      });

      if (result.canceled) {
        return {
          success: true,
          data: { canceled: true, filePath: '' },
        };
      }

      return {
        success: true,
        data: { canceled: false, filePath: result.filePath },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DIALOG_SAVE_FAILED',
          userMessage: '打开保存对话框失败',
          technicalMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  });
};
