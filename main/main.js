const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

const isDev = process.env.NODE_ENV !== 'production';

// Auto-reload in development (only for main process files)
if (isDev) {
  try {
    require('electron-reloader')(module, {
      debug: true,
      watchRenderer: false, // Vite handles renderer hot reload
      ignore: ['node_modules', 'dist', 'renderer']
    });
  } catch (err) {
    console.log('electron-reloader not available');
  }
}

let mainWindow;

// Fix for exit code 11: Disable hardware acceleration before app ready
// This prevents GPU-related crashes on macOS
// Exit code 11 = SIGSEGV (segmentation fault) = GPU/media driver crash
if (process.platform === 'darwin') {
  // On macOS, hardware acceleration can cause exit code 11 crashes
  app.disableHardwareAcceleration();
  console.log('[Electron] Hardware acceleration disabled to prevent exit code 11 crashes');
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#ffffff',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      devTools: isDev,
      autoplayPolicy: 'no-user-gesture-required',
      webSecurity: false,
      sandbox: false, // Allow hardware access in dev (avoids Mac renderer kill)
      backgroundThrottling: false,
      offscreen: false,
      // Fix for exit code 11 (GPU/media crash) on macOS
      enableWebGL: false, // Disable WebGL to avoid GPU crashes
      enableBlinkFeatures: '',
      disableBlinkFeatures: 'Accelerated2dCanvas,AcceleratedSmallCanvases',
    }
  });

  // ============================================
  // COMPREHENSIVE CRASH DEBUGGING
  // ============================================
  
  // 1. Renderer process crash handler
  mainWindow.webContents.on('render-process-gone', (event, details) => {
    console.error('\n========================================');
    console.error('[CRASH] Renderer process crashed!');
    console.error('========================================');
    console.error('Reason:', details.reason);
    console.error('Exit code:', details.exitCode);
    console.error('Killed:', details.killed);
    console.error('Full details:', JSON.stringify(details, null, 2));
    
    // Exit code meanings:
    // 11 = SIGSEGV (segmentation fault) = GPU/media driver crash
    // 1 = General crash
    // 139 = SIGSEGV (alternative)
    // 134 = SIGABRT (abort)
    
    if (details.exitCode === 11) {
      console.error('\n[DIAGNOSIS] Exit code 11 = SIGSEGV (segmentation fault)');
      console.error('[POSSIBLE CAUSES]:');
      console.error('  1. GPU/hardware acceleration issue');
      console.error('  2. Media device access (camera/microphone)');
      console.error('  3. WebGL/Canvas operations');
      console.error('  4. Native module crash');
      console.error('  5. Memory corruption');
    }
    
    console.error('========================================\n');
  });

  // 2. Unresponsive handler
  mainWindow.webContents.on('unresponsive', () => {
    console.error('[WARNING] Renderer process became unresponsive');
    console.error('[TIP] Check for infinite loops or heavy computations');
  });

  // 3. Responsive handler
  mainWindow.webContents.on('responsive', () => {
    console.log('[INFO] Renderer process became responsive again');
  });

  // 4. Console messages from renderer (for debugging)
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    const levelNames = ['', 'INFO', 'WARNING', 'ERROR'];
    if (level >= 2) { // Only log warnings and errors
      console.log(`[Renderer ${levelNames[level]}] ${message} (${sourceId}:${line})`);
    }
  });

  // 5. Crashed handler (alternative to render-process-gone)
  mainWindow.webContents.on('crashed', (event, killed) => {
    console.error('[CRASH] Renderer crashed (killed:', killed, ')');
  });

  // 6. Did-fail-load handler (for navigation errors)
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    if (errorCode !== -3) { // -3 is ERR_ABORTED, which is normal for navigation
      console.error('[LOAD ERROR]', errorCode, errorDescription, validatedURL);
    }
  });

  // Load the window with delay to avoid startup crashes
  const loadWindow = () => {
    if (isDev) {
      console.log('[Electron] Loading dev server at http://localhost:5173');
      mainWindow.loadURL('http://localhost:5173').catch((err) => {
        console.error('Failed to load dev server. Make sure to run "npm run dev"');
        console.error(err);
      });
      // Open DevTools automatically with a delay to allow window to fully load
      // This helps prevent potential crashes during initialization
      setTimeout(() => {
        console.log('[Electron] Opening DevTools automatically');
        try {
          mainWindow.webContents.openDevTools();
        } catch (err) {
          console.error('[Electron] Error opening DevTools:', err);
        }
      }, 2000); // 2 second delay to allow window to stabilize
    } else {
      const distPath = path.join(__dirname, '../dist/index.html');
      const fs = require('fs');
      if (!fs.existsSync(distPath)) {
        console.error('Production build not found! Please run "npm run build" first.');
        mainWindow.loadURL('http://localhost:5173').catch(() => {
          mainWindow.webContents.executeJavaScript(`
            document.body.innerHTML = \`
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: system-ui; padding: 20px; text-align: center; background: #fff; color: #333;">
              <h1 style="color: #f87171; margin-bottom: 16px;">Build Not Found</h1>
              <p style="color: #666; margin-bottom: 8px;">Production build not found.</p>
              <p style="color: #999; margin-bottom: 24px;">Please run:</p>
              <code style="background: #f5f5f5; padding: 12px 24px; border-radius: 6px; font-size: 14px; color: #06b6d4;">
                npm run build
              </code>
              <p style="color: #999; margin-top: 24px; font-size: 12px;">Or use "npm run dev" for development mode</p>
            </div>
          \`;
        `);
        });
        mainWindow.loadURL('data:text/html,<html><body></body></html>');
      } else {
        mainWindow.loadFile(distPath);
      }
    }
  };

  // Delay window loading to prevent exit code 11 crash
  setTimeout(loadWindow, 100);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  console.log('[Electron] App ready, creating window...');
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers for window controls
ipcMain.handle('window:minimize', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.handle('window:maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle('window:close', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});
