/**
 * AI Handler - IPC handlers for AI operations
 */

import { IpcMain, BrowserWindow } from 'electron';
import { createGLMService, getGLMService } from '../services/AIService/GLMService';

// ============================================================================
// Setup Handler
// ============================================================================

export const setupAIHandlers = (ipcMain: IpcMain, mainWindow: BrowserWindow | null): void => {
  /**
   * Extract inclusion/exclusion criteria from protocol
   */
  ipcMain.handle(
    'ai:extractCriteria',
    async (_event, { protocolContent }: { protocolContent: string }) => {
      try {
        const glmService = getGLMService();
        if (!glmService) {
          return {
            success: false,
            error: {
              code: 'AI_NOT_INITIALIZED',
              userMessage: 'AI服务未初始化，请先设置API密钥',
              technicalMessage: 'GLM service not initialized',
            },
          };
        }

        const result = await glmService.extractCriteria(protocolContent);
        return result;
      } catch (error) {
        return {
          success: false,
          error: {
            code: 'AI_EXTRACT_CRITERIA_FAILED',
            userMessage: '提取入排标准失败',
            technicalMessage: error instanceof Error ? error.message : 'Unknown error',
          },
        };
      }
    }
  );

  /**
   * Extract visit schedule from protocol
   */
  ipcMain.handle(
    'ai:extractVisitSchedule',
    async (_event, { protocolContent }: { protocolContent: string }) => {
      try {
        const glmService = getGLMService();
        if (!glmService) {
          return {
            success: false,
            error: {
              code: 'AI_NOT_INITIALIZED',
              userMessage: 'AI服务未初始化，请先设置API密钥',
              technicalMessage: 'GLM service not initialized',
            },
          };
        }

        const result = await glmService.extractVisitSchedule(protocolContent);
        return result;
      } catch (error) {
        return {
          success: false,
          error: {
            code: 'AI_EXTRACT_VISIT_SCHEDULE_FAILED',
            userMessage: '提取访视计划失败',
            technicalMessage: error instanceof Error ? error.message : 'Unknown error',
          },
        };
      }
    }
  );

  /**
   * Recognize medications from subject records
   */
  ipcMain.handle(
    'ai:recognizeMedications',
    async (_event, { subjectContent }: { subjectContent: string }) => {
      try {
        const glmService = getGLMService();
        if (!glmService) {
          return {
            success: false,
            error: {
              code: 'AI_NOT_INITIALIZED',
              userMessage: 'AI服务未初始化，请先设置API密钥',
              technicalMessage: 'GLM service not initialized',
            },
          };
        }

        const result = await glmService.recognizeMedications(subjectContent);
        return result;
      } catch (error) {
        return {
          success: false,
          error: {
            code: 'AI_RECOGNIZE_MEDICATIONS_FAILED',
            userMessage: '识别用药信息失败',
            technicalMessage: error instanceof Error ? error.message : 'Unknown error',
          },
        };
      }
    }
  );

  /**
   * Chat with AI for follow-up questions
   */
  ipcMain.handle(
    'ai:chat',
    async (_event, { message, context }: { message: string; context?: string }) => {
      try {
        const glmService = getGLMService();
        if (!glmService) {
          return {
            success: false,
            error: {
              code: 'AI_NOT_INITIALIZED',
              userMessage: 'AI服务未初始化，请先设置API密钥',
              technicalMessage: 'GLM service not initialized',
            },
          };
        }

        // For now, return a simple response
        return {
          success: true,
          data: 'AI聊天功能正在开发中...',
        };
      } catch (error) {
        return {
          success: false,
          error: {
            code: 'AI_CHAT_FAILED',
            userMessage: 'AI对话失败',
            technicalMessage: error instanceof Error ? error.message : 'Unknown error',
          },
        };
      }
    }
  );

  /**
   * Test API connection
   */
  ipcMain.handle(
    'ai:testConnection',
    async () => {
      try {
        const glmService = getGLMService();
        if (!glmService) {
          return {
            success: false,
            error: {
              code: 'AI_NOT_INITIALIZED',
              userMessage: 'AI服务未初始化，请先设置API密钥',
              technicalMessage: 'GLM service not initialized',
            },
          };
        }

        const result = await glmService.testConnection();
        return result;
      } catch (error) {
        return {
          success: false,
          error: {
            code: 'CONNECTION_TEST_FAILED',
            userMessage: '连接测试失败',
            technicalMessage: error instanceof Error ? error.message : 'Unknown error',
          },
        };
      }
    }
  );
};
