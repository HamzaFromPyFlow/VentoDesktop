const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

const isDev = process.env.NODE_ENV !== 'production';

// FIX 1: Disable Hardware Acceleration 
// This is the #1 cause of "DevTools Disconnected" when playing video in Electron
app.disableHardwareAcceleration();

// Auto-reload in development
if (isDev) {
  try {
    require('electron-reloader')(module, {
      debug: true,
      watchRenderer: false, 
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
      // FIX 2: Enable background throttling if needed
      backgroundThrottling: false 
    }
  });

  // FIX 3: Crash Listener - This tells you WHY it crashed in your terminal
  mainWindow.webContents.on('render-process-gone', (event, detailed) => {
    console.error(`!!! Renderer Process Gone !!!`);
    console.error(`Reason: ${detailed.reason}`); 
    console.error(`Exit Code: ${detailed.exitCode}`);
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173').catch((err) => {
      console.error('Failed to load dev server.');
    });
    mainWindow.webContents.openDevTools();
  } else {
    const distPath = path.join(__dirname, '../dist/index.html');
    const fs = require('fs');
    if (!fs.existsSync(distPath)) {
      mainWindow.loadURL('data:text/html,<html><body>Build Not Found</body></html>');
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
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC handlers (keep these as you had them)
ipcMain.handle('window:minimize', () => mainWindow?.minimize());
ipcMain.handle('window:maximize', () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize();
  else mainWindow?.maximize();
});
ipcMain.handle('window:close', () => mainWindow?.close());