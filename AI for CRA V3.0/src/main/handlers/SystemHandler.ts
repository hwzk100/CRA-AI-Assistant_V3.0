/**
 * System Handler - IPC handlers for system operations
 */

import { IpcMain, BrowserWindow, shell } from 'electron';
import * as https from 'https';

// ============================================================================
// Setup Handler
// ============================================================================

export const setupSystemHandlers = (ipcMain: IpcMain, mainWindow: BrowserWindow | null): void => {
  /**
   * Get application version
   */
  ipcMain.handle('system:getVersion', async () => {
    try {
      return {
        success: true,
        data: 'CRA AI Assistant V3.0',
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'VERSION_GET_FAILED',
          userMessage: '获取版本信息失败',
          technicalMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  });

  /**
   * Open external URL
   */
  ipcMain.handle(
    'system:openExternal',
    async (_event, { url }: { url: string }) => {
      try {
        await shell.openExternal(url);
        return {
          success: true,
          data: undefined,
        };
      } catch (error) {
        return {
          success: false,
          error: {
            code: 'OPEN_EXTERNAL_FAILED',
            userMessage: '打开链接失败',
            technicalMessage: error instanceof Error ? error.message : 'Unknown error',
          },
        };
      }
    }
  );

  /**
   * Test network connectivity to GLM API
   */
  ipcMain.handle('system:testNetwork', async () => {
    const results = {
      apiEndpoint: false,
      dnsResolution: false,
      error: '',
    };

    try {
      // Test DNS resolution and connectivity
      await new Promise<void>((resolve, reject) => {
        const req = https.request(
          {
            hostname: 'open.bigmodel.cn',
            port: 443,
            path: '/',
            method: 'HEAD',
            timeout: 10000,
          },
          (res) => {
            results.dnsResolution = true;
            results.apiEndpoint = res.statusCode ? true : false;
            resolve();
          }
        );

        req.on('error', (error) => {
          results.error = error.message;
          reject(error);
        });

        req.on('timeout', () => {
          results.error = 'Connection timeout';
          req.destroy();
          reject(new Error('Timeout'));
        });

        req.end();
      });

      return {
        success: true,
        data: results,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_TEST_FAILED',
          userMessage: '网络连接测试失败',
          technicalMessage: error instanceof Error ? error.message : 'Unknown error',
        },
        data: results,
      };
    }
  });
};
