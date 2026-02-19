/**
 * Settings Handler - IPC handlers for settings operations
 */

import { IpcMain, BrowserWindow, app } from 'electron';
import { join } from 'path';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { createGLMService } from '../services/AIService/GLMService';
import { DEFAULT_SETTINGS } from '@shared/types/core';

// ============================================================================
// Settings Storage
// ============================================================================

const SETTINGS_FILE = 'settings.json';

function getSettingsPath(): string {
  const userDataPath = app.getPath('userData');
  return join(userDataPath, SETTINGS_FILE);
}

function ensureUserDataDir(): void {
  const userDataPath = app.getPath('userData');
  if (!existsSync(userDataPath)) {
    mkdirSync(userDataPath, { recursive: true });
  }
}

function loadSettings() {
  try {
    const settingsPath = getSettingsPath();
    if (existsSync(settingsPath)) {
      const data = readFileSync(settingsPath, 'utf-8');
      const settings = JSON.parse(data);
      return {
        ...DEFAULT_SETTINGS,
        ...settings,
      };
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: Record<string, unknown>): void {
  try {
    ensureUserDataDir();
    const settingsPath = getSettingsPath();
    writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save settings:', error);
    throw error;
  }
}

// ============================================================================
// Setup Handler
// ============================================================================

export const setupSettingsHandlers = (ipcMain: IpcMain, mainWindow: BrowserWindow | null): void => {
  /**
   * Get current settings
   */
  ipcMain.handle('settings:get', async () => {
    try {
      const settings = loadSettings();

      // Initialize GLM service if API key exists
      if (settings.apiKey && settings.apiKey.trim().length > 0) {
        const glmService = createGLMService({
          apiKey: settings.apiKey,
        });
        glmService.initialize();
      }

      return {
        success: true,
        data: settings,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SETTINGS_GET_FAILED',
          userMessage: '获取设置失败',
          technicalMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  });

  /**
   * Update settings
   */
  ipcMain.handle(
    'settings:set',
    async (_event, { settings }: { settings: Record<string, unknown> }) => {
      try {
        const currentSettings = loadSettings();
        const newSettings = { ...currentSettings, ...settings };
        saveSettings(newSettings);

        // Update GLM service if API key changed
        if (settings.apiKey !== undefined) {
          const glmService = createGLMService({
            apiKey: settings.apiKey as string,
          });
          const initResult = glmService.initialize();
          if (initResult.success === false) {
            return {
              success: false,
              error: initResult.error,
            };
          }
        }

        return {
          success: true,
          data: undefined,
        };
      } catch (error) {
        return {
          success: false,
          error: {
            code: 'SETTINGS_SET_FAILED',
            userMessage: '保存设置失败',
            technicalMessage: error instanceof Error ? error.message : 'Unknown error',
          },
        };
      }
    }
  );

  /**
   * Set API key (convenience method)
   */
  ipcMain.handle(
    'settings:setApiKey',
    async (_event, { apiKey }: { apiKey: string }) => {
      try {
        const currentSettings = loadSettings();
        currentSettings.apiKey = apiKey;
        saveSettings(currentSettings);

        // Initialize GLM service with new API key
        const glmService = createGLMService({
          apiKey: apiKey,
        });
        const initResult = glmService.initialize();

        if (initResult.success === false) {
          return {
            success: false,
            error: initResult.error,
          };
        }

        return {
          success: true,
          data: undefined,
        };
      } catch (error) {
        return {
          success: false,
          error: {
            code: 'API_KEY_SET_FAILED',
            userMessage: '设置API密钥失败',
            technicalMessage: error instanceof Error ? error.message : 'Unknown error',
          },
        };
      }
    }
  );
};
