import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import http from 'http'
import fs from 'fs'
import { fork, ChildProcess, execSync } from 'child_process'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

// Fallback for Linux AppImage timezone bug
try {
  if (process.platform === 'linux' && !process.env.TZ) {
    const localtimePath = execSync('readlink /etc/localtime', { encoding: 'utf8' }).trim()
    if (localtimePath.includes('zoneinfo/')) {
      process.env.TZ = localtimePath.split('zoneinfo/')[1]
    }
  }
} catch (e) {}

let mainWindow: BrowserWindow | null = null
let splashWindow: BrowserWindow | null = null
let backendProcess: ChildProcess | null = null

// Logging and Diagnostics
const maxLogHistory = 250
const recentLogs: string[] = []
let lastBackendError: string | null = null
const userDataPath = app.getPath('userData')
const logsDir = join(userDataPath, 'logs')
const backendLogFile = join(logsDir, 'backend.log')

function ensureLogsDir(): void {
  try {
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true })
    }
  } catch (err) {
    console.error('Failed to create logs directory:', err)
  }
}

function appendLog(level: 'INFO' | 'WARN' | 'ERROR', message: string): void {
  const timestamp = new Date().toISOString()
  const formatted = `[${timestamp}] [${level}] ${message}`
  
  // Keep in memory
  recentLogs.push(formatted)
  if (recentLogs.length > maxLogHistory) {
    recentLogs.shift()
  }

  // Console output
  if (level === 'ERROR') {
    console.error(formatted)
  } else {
    console.log(formatted)
  }

  // Append to disk
  try {
    ensureLogsDir()
    fs.appendFileSync(backendLogFile, formatted + '\n', 'utf8')
  } catch (err) {
    console.error('Failed writing to log file:', err)
  }
}

function findExistingPath(candidates: string[]): string | null {
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate
    }
  }
  return null
}

function checkBackendHealth(timeoutMs = 12000): Promise<boolean> {
  return new Promise((resolve) => {
    const startTime = Date.now()

    const interval = setInterval(() => {
      const req = http.get('http://127.0.0.1:5000/api/health', (res) => {
        if (res.statusCode === 200) {
          clearInterval(interval)
          appendLog('INFO', 'Backend health check passed (status 200 OK)')
          resolve(true)
        }
      })

      req.on('error', () => {
        if (Date.now() - startTime >= timeoutMs) {
          clearInterval(interval)
          appendLog('WARN', `Backend health check timed out after ${timeoutMs}ms`)
          resolve(false)
        }
      })

      req.setTimeout(500, () => {
        req.destroy()
      })
    }, 400)
  })
}

function startBackend(): void {
  if (is.dev) {
    appendLog('INFO', 'Running in dev mode: skipping embedded backend fork')
    return
  }

  if (backendProcess && !backendProcess.killed) {
    appendLog('INFO', 'Backend process is already running (PID: ' + backendProcess.pid + ')')
    return
  }

  appendLog('INFO', 'Starting backend engine...')
  appendLog('INFO', `OS: ${process.platform} (${process.arch}), Node: ${process.version}`)
  appendLog('INFO', `User Data Path: ${userDataPath}`)

  const dbPath = join(userDataPath, 'omnitrack.db')
  const uploadDir = join(userDataPath, 'uploads')

  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
  } catch (err) {
    appendLog('ERROR', `Failed to create uploads directory: ${err}`)
  }

  // Copy empty template database if not present
  if (!fs.existsSync(dbPath)) {
    const templateCandidates = [
      join(__dirname, '../../resources/backend/prisma/empty.db'),
      join(process.resourcesPath, 'backend/prisma/empty.db'),
      join(process.resourcesPath, 'app/resources/backend/prisma/empty.db'),
      join(app.getAppPath(), 'resources/backend/prisma/empty.db')
    ]
    const templateDb = findExistingPath(templateCandidates)
    if (templateDb) {
      try {
        fs.copyFileSync(templateDb, dbPath)
        appendLog('INFO', `Initialized database from template: ${templateDb}`)
      } catch (err) {
        appendLog('ERROR', `Failed to copy template database: ${err}`)
      }
    } else {
      appendLog('WARN', 'Template empty.db not found in search paths, SQLite will auto-create database')
    }
  } else {
    appendLog('INFO', `Using existing database at ${dbPath}`)
  }

  // Find server.js executable bundle
  const serverCandidates = [
    join(__dirname, '../../resources/backend/dist/server.js'),
    join(process.resourcesPath, 'backend/dist/server.js'),
    join(process.resourcesPath, 'app/resources/backend/dist/server.js'),
    join(app.getAppPath(), 'resources/backend/dist/server.js')
  ]
  const serverPath = findExistingPath(serverCandidates)

  if (!serverPath) {
    const notFoundMsg = `Backend server.js not found in candidates: ${JSON.stringify(serverCandidates)}`
    lastBackendError = notFoundMsg
    appendLog('ERROR', notFoundMsg)
    return
  }

  appendLog('INFO', `Found backend entry script at: ${serverPath}`)

  // Normalize SQLite database URL for Windows/Linux
  const normalizedDbPath = dbPath.replace(/\\/g, '/')
  const databaseUrl = `file:${normalizedDbPath}`
  appendLog('INFO', `Using database URL: ${databaseUrl}`)

  try {
    backendProcess = fork(serverPath, [], {
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl,
        UPLOAD_DIR: uploadDir,
        NODE_ENV: 'production',
        PORT: '5000'
      },
      stdio: ['ignore', 'pipe', 'pipe', 'ipc']
    })

    appendLog('INFO', `Backend process spawned with PID: ${backendProcess.pid}`)

    backendProcess.stdout?.on('data', (data) => {
      const msg = data.toString().trim()
      if (msg) appendLog('INFO', `[Backend stdout] ${msg}`)
    })

    backendProcess.stderr?.on('data', (data) => {
      const msg = data.toString().trim()
      if (msg) {
        lastBackendError = msg
        appendLog('ERROR', `[Backend stderr] ${msg}`)
      }
    })

    backendProcess.on('error', (err) => {
      lastBackendError = `Spawn Error: ${err.message}`
      appendLog('ERROR', `Backend process error: ${err.message}`)
    })

    backendProcess.on('exit', (code, signal) => {
      appendLog('WARN', `Backend process exited with code ${code}, signal ${signal}`)
      if (code !== 0 && code !== null) {
        lastBackendError = `Backend service stopped unexpectedly (exit code ${code})`
      }
    })
  } catch (err: any) {
    lastBackendError = `Failed to spawn backend process: ${err?.message || err}`
    appendLog('ERROR', lastBackendError)
  }
}

function stopBackend(): Promise<void> {
  return new Promise((resolve) => {
    if (!backendProcess || backendProcess.killed) {
      backendProcess = null
      resolve()
      return
    }

    appendLog('INFO', `Stopping backend process (PID ${backendProcess.pid})...`)
    const proc = backendProcess
    backendProcess = null

    proc.once('exit', () => {
      appendLog('INFO', 'Backend process terminated')
      resolve()
    })

    try {
      proc.kill('SIGTERM')
      setTimeout(() => {
        if (!proc.killed) {
          try { proc.kill('SIGKILL') } catch (_) {}
        }
        resolve()
      }, 2000)
    } catch (_) {
      resolve()
    }
  })
}

function setupIpc(): void {
  ipcMain.handle('get-backend-info', () => {
    const isRunning = is.dev ? true : !!backendProcess && !backendProcess.killed
    return {
      isRunning,
      port: 5000,
      pid: backendProcess?.pid,
      lastError: lastBackendError,
      logFilePath: backendLogFile,
      logs: recentLogs,
      dbPath: join(userDataPath, 'omnitrack.db'),
      userDataPath
    }
  })

  ipcMain.handle('open-log-file', async () => {
    try {
      ensureLogsDir()
      if (!fs.existsSync(backendLogFile)) {
        fs.writeFileSync(backendLogFile, '=== Omnitrack Log File Initialized ===\n', 'utf8')
      }
      await shell.openPath(backendLogFile)
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('open-logs-dir', async () => {
    try {
      ensureLogsDir()
      await shell.openPath(logsDir)
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('restart-backend', async () => {
    appendLog('INFO', 'Restarting backend triggered by user/renderer request...')
    await stopBackend()
    startBackend()
    const healthy = await checkBackendHealth(8000)
    return {
      success: healthy,
      lastError: lastBackendError
    }
  })
}

async function createWindow(): Promise<void> {
  // Create Splash Window
  splashWindow = new BrowserWindow({
    width: 520,
    height: 380,
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
  })

  splashWindow.loadFile(join(__dirname, '../../resources/splash.html'))

  splashWindow.once('ready-to-show', async () => {
    splashWindow?.show()
    
    splashWindow?.webContents.send('loading-status', 'Starting database and local server...')
    startBackend()

    splashWindow?.webContents.send('loading-status', 'Connecting to backend service...')
    const isHealthy = await checkBackendHealth(is.dev ? 2000 : 12000)

    if (isHealthy) {
      splashWindow?.webContents.send('loading-status', 'Workspace ready, opening Omnitrack...')
    } else {
      splashWindow?.webContents.send('loading-status', 'Loading user interface...')
    }

    setTimeout(() => {
      if (splashWindow && !splashWindow.isDestroyed()) {
        splashWindow.close()
      }
      mainWindow?.show()
    }, 1200)
  })

  // Create the main browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 650,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev) {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(join(__dirname, '../../resources/frontend/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.omnitrack')
  ensureLogsDir()
  appendLog('INFO', 'Omnitrack Desktop application starting...')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  setupIpc()
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('before-quit', async () => {
  await stopBackend()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
