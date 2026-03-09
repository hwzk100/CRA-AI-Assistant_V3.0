/**
 * Test script to diagnose frontend loading issues
 */

const { app, BrowserWindow } = require('electron');
const path = require('path');

console.log('=== CRA AI Assistant Diagnostic Tool ===');
console.log('Process cwd:', process.cwd());
console.log('App path:', app.getAppPath());
console.log('__dirname in main:', __dirname);

// Test path resolution
const distMainPath = path.join(__dirname, 'dist', 'main');
const distRendererPath = path.join(__dirname, 'dist', 'renderer');
const preloadPath = path.join(distMainPath, 'preload.js');
const rendererIndexPath = path.join(distRendererPath, 'index.html');

console.log('\n=== Path Resolution ===');
console.log('dist/main path:', distMainPath);
console.log('dist/renderer path:', distRendererPath);
console.log('preload.js path:', preloadPath);
console.log('renderer index.html path:', rendererIndexPath);

const fs = require('fs');
console.log('\n=== File Existence Checks ===');
console.log('preload.js exists:', fs.existsSync(preloadPath));
console.log('index.html exists:', fs.existsSync(rendererIndexPath));

if (fs.existsSync(rendererIndexPath)) {
  const htmlContent = fs.readFileSync(rendererIndexPath, 'utf8');
  console.log('index.html size:', htmlContent.length, 'bytes');
  console.log('index.html preview:', htmlContent.substring(0, 200));
}

console.log('\n=== Starting test window ===');

app.whenReady().then(() => {
  const testWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // Load the renderer
  testWindow.loadFile(rendererIndexPath).then(() => {
    console.log('✓ Window loaded successfully!');
  }).catch((error) => {
    console.error('✗ Failed to load window:', error);
  });

  // Open DevTools
  testWindow.webContents.openDevTools();

  // Log console messages
  testWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[Renderer Console] ${message}`);
  });

  // Log errors
  testWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('✗ Failed to load:', errorCode, errorDescription, validatedURL);
  });

  testWindow.webContents.on('did-finish-load', () => {
    console.log('✓ Page finished loading');

    // Execute script to check if React loaded
    testWindow.webContents.executeJavaScript(`
      ({
        hasReact: typeof React !== 'undefined',
        hasReactDOM: typeof ReactDOM !== 'undefined',
        hasRoot: document.getElementById('root') !== null,
        rootContent: document.getElementById('root')?.innerHTML || 'empty',
        hasElectronAPI: typeof window.electronAPI !== 'undefined',
        errors: window.__errors__ || []
      })
    `).then((result) => {
      console.log('\n=== Runtime Checks ===');
      console.log('React loaded:', result.hasReact);
      console.log('ReactDOM loaded:', result.hasReactDOM);
      console.log('Root element exists:', result.hasRoot);
      console.log('Root element content:', result.rootContent);
      console.log('ElectronAPI available:', result.hasElectronAPI);
      if (result.errors.length > 0) {
        console.log('Errors:', result.errors);
      }
    }).catch((error) => {
      console.error('Failed to execute runtime checks:', error);
    });
  });

  // Keep app running
  app.on('window-all-closed', () => {
    // Don't quit on window close for testing
  });

  console.log('Test window created. Check the window for visual output.');
  console.log('Press Ctrl+C to exit.');
});
