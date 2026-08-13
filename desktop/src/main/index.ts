import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from 'fs'
import { fork, ChildProcess } from 'child_process'

let mainWindow: BrowserWindow | null = null;
let splashWindow: BrowserWindow | null = null;
let backendProcess: ChildProcess | null = null;

function startBackend() {
  if (is.dev) return; // In dev, we assume backend is running separately

  const userDataPath = app.getPath('userData');
  const dbPath = join(userDataPath, 'omnitrack.db');
  
  // If db doesn't exist, copy template from resources
  if (!fs.existsSync(dbPath)) {
    const templateDb = join(__dirname, '../../resources/backend/prisma/dev.db');
    if (fs.existsSync(templateDb)) {
      fs.copyFileSync(templateDb, dbPath);
    }
  }

  const serverPath = join(__dirname, '../../resources/backend/dist/server.js');
  if (fs.existsSync(serverPath)) {
    backendProcess = fork(serverPath, [], {
      env: {
        ...process.env,
        LOCAL_DATABASE_URL: `file:${dbPath}`,
        NODE_ENV: 'production'
      }
    });
    backendProcess.on('error', (err) => console.error('Backend Error:', err));
  }
}

function createWindow(): void {
  // Create Splash Window
  splashWindow = new BrowserWindow({
    width: 500,
    height: 350,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    show: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  splashWindow.loadFile(join(__dirname, '../../resources/splash.html'));

  splashWindow.once('ready-to-show', () => {
    splashWindow?.show();
    
    setTimeout(() => splashWindow?.webContents.send('loading-status', 'Starting database engine...'), 1000);
    setTimeout(() => {
      splashWindow?.webContents.send('loading-status', 'Starting local server...');
      startBackend();
    }, 2500);
    setTimeout(() => splashWindow?.webContents.send('loading-status', 'Loading user interface...'), 4000);
  });

  // Create the main browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  });

  mainWindow.on('ready-to-show', () => {
    // Add artificial delay for splash screen aesthetics if needed
    setTimeout(() => {
      if (splashWindow && !splashWindow.isDestroyed()) {
        splashWindow.close();
      }
      mainWindow?.show();
    }, 5000); // Guarantees splash shows for at least 5s so animation is seen
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(join(__dirname, '../../resources/frontend/index.html'));
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.omnitrack');

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  ipcMain.on('ping', () => console.log('pong'));

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
