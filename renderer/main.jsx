import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Disable React StrictMode in Electron to avoid double initialization
// which can cause exit code 11 crashes with media devices
const isElectron = window.navigator.userAgent.includes('Electron');

// Global error boundary for Electron crashes
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Error info:', errorInfo);
    
    // Log to main process if possible
    if (isElectron && window.electron) {
      try {
        window.electron.logError(JSON.stringify({ error: error.toString(), errorInfo }));
      } catch (e) {
        // Ignore if IPC not available
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>Something went wrong</h1>
          <p>{this.state.error?.toString()}</p>
          <button onClick={() => window.location.reload()}>Reload</button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
  console.error('[Global Error Handler]', event.error);
  console.error('[Global Error Handler] Stack:', event.error?.stack);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled Promise Rejection]', event.reason);
});

// Delay rendering in Electron to avoid startup crashes
if (isElectron) {
  console.log('[main.jsx] Electron detected, delaying render...');
  
  // Wait for window to be fully ready and add extra delay
  const renderApp = () => {
    console.log('[main.jsx] Rendering app...');
    try {
      const root = document.getElementById('root');
      if (!root) {
        console.error('[main.jsx] Root element not found!');
        return;
      }
      
      ReactDOM.createRoot(root).render(
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      );
      console.log('[main.jsx] App rendered successfully');
    } catch (error) {
      console.error('[main.jsx] Error rendering app:', error);
    }
  };

  // Wait longer in Electron to ensure everything is initialized
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('[main.jsx] DOMContentLoaded fired');
      setTimeout(renderApp, 1000); // Increased delay
    });
  } else {
    console.log('[main.jsx] DOM already loaded');
    setTimeout(renderApp, 1000); // Increased delay
  }
} else {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}
