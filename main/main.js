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
    }
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173').catch((err) => {
      console.error('Failed to load dev server. Make sure to run "npm run dev"');
      console.error(err);
    });
    mainWindow.webContents.openDevTools();
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

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
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
