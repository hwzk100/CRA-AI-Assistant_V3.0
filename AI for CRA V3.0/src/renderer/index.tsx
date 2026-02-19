/**
 * Renderer Entry Point
 * CRA AI Assistant V3.0
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './styles/index.css';

// Type declaration for webpack module.hot
declare const module: {
  hot?: {
    accept(): void;
  };
};

// ============================================================================
// Initialize App
// ============================================================================

// Wait for DOM to be ready
function initializeApp() {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('Root element not found');
    return;
  }

  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <ErrorBoundary
        onError={(error, errorInfo) => {
          console.error('Error caught by ErrorBoundary:', error);
          console.error('Component stack:', errorInfo.componentStack);
        }}
      >
        <App />
      </ErrorBoundary>
    );
    console.log('React app initialized successfully');
  } catch (error) {
    console.error('Failed to initialize React app:', error);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// ============================================================================
// Hot Module Replacement
// ============================================================================

if (module.hot) {
  module.hot.accept();
}
