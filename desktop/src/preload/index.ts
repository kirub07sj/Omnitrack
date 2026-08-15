import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  getBackendInfo: () => ipcRenderer.invoke('get-backend-info'),
  openLogFile: () => ipcRenderer.invoke('open-log-file'),
  openLogsDir: () => ipcRenderer.invoke('open-logs-dir'),
  restartBackend: () => ipcRenderer.invoke('restart-backend'),
  onBackendStatus: (callback: (data: any) => void) => {
    const subscription = (_: any, data: any) => callback(data);
    ipcRenderer.on('backend-status', subscription);
    return () => ipcRenderer.removeListener('backend-status', subscription);
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
