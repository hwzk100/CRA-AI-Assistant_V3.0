/**
 * Electron Main Process Entry Point
 * CRA AI Assistant V3.0
 */

import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';

// ============================================================================
// Error Handling
// ============================================================================

// Catch unhandled errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// ============================================================================
// Types
// ============================================================================

let mainWindow: BrowserWindow | null = null;

// ============================================================================
// Window Creation
// ============================================================================

/**
 * Create the main application window
 */
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    show: false,
    frame: true,
    titleBarStyle: 'default',
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    backgroundColor: '#f9fafb',
  });

  // Load the app
  console.log('Loading app...');
  console.log('__dirname:', __dirname);
  console.log('Renderer path:', join(__dirname, '../renderer/index.html'));

  if (process.env.NODE_ENV === 'development') {
    console.log('Loading from dev server: http://localhost:3000');
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    console.log('Loading from file:', join(__dirname, '../renderer/index.html'));
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    console.log('Window ready to show');
    mainWindow?.show();
  });

  // Fallback: show window after 3 seconds regardless
  setTimeout(() => {
    if (mainWindow && !mainWindow.isVisible()) {
      console.log('Force showing window after timeout');
      mainWindow.show();
    }
  }, 3000);

  // Handle window closed
  mainWindow.on('closed', () => {
    console.log('Window closed');
    mainWindow = null;
  });

  // Handle load errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Failed to load:', errorCode, errorDescription, validatedURL);
  });

  // Handle load finish
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page loaded successfully');
  });

  // Handle DOM ready
  mainWindow.webContents.on('dom-ready', () => {
    console.log('DOM is ready');
  });

  // Handle console messages from renderer
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[Renderer Console] ${message}`);
  });

  // Handle renderer crashes
  mainWindow.webContents.on('render-process-gone', (event, details) => {
    console.error('Renderer process gone:', details);
  });
}

// ============================================================================
// App Lifecycle
// ============================================================================

/**
 * Handle app ready
 */
app.whenReady().then(() => {
  console.log('App is ready');

  // Initialize GLM service with default API key
  const { createGLMService } = require('./services/AIService/GLMService');
  const { DEFAULT_SETTINGS } = require('@shared/types/core');
  if (DEFAULT_SETTINGS.apiKey) {
    const glmService = createGLMService({
      apiKey: DEFAULT_SETTINGS.apiKey,
    });
    const initResult = glmService.initialize();
    if (initResult.success) {
      console.log('GLM service initialized with default API key');
    } else {
      console.log('GLM service initialization failed:', initResult.error);
    }
  }

  createWindow();
  console.log('Setting up IPC handlers');
  setupIPCHandlers();
  console.log('IPC handlers setup complete');

  app.on('activate', () => {
    console.log('App activated');
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

/**
 * Handle all windows closed
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * Handle app before quit
 */
app.on('before-quit', () => {
  // Cleanup resources
});

// ============================================================================
// IPC Handlers Setup
// ============================================================================

function setupIPCHandlers(): void {
  // Import handlers after app is ready
  const { setupFileHandlers } = require('./handlers/FileHandler');
  const { setupAIHandlers } = require('./handlers/AIHandler');
  const { setupExcelHandlers } = require('./handlers/ExcelHandler');
  const { setupSettingsHandlers } = require('./handlers/SettingsHandler');
  const { setupSystemHandlers } = require('./handlers/SystemHandler');
  const { setupDialogHandlers } = require('./handlers/DialogHandler');

  // Setup all handlers
  setupFileHandlers(ipcMain, mainWindow);
  setupAIHandlers(ipcMain, mainWindow);
  setupExcelHandlers(ipcMain, mainWindow);
  setupSettingsHandlers(ipcMain, mainWindow);
  setupSystemHandlers(ipcMain, mainWindow);
  setupDialogHandlers(ipcMain, mainWindow);
}

// ============================================================================
// Exports
// ============================================================================

export { mainWindow };
