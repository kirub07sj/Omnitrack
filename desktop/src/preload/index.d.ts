import { ElectronAPI } from '@electron-toolkit/preload'

export interface BackendInfo {
  isRunning: boolean;
  port: number;
  pid?: number;
  lastError: string | null;
  logFilePath: string;
  logs: string[];
  dbPath: string;
  userDataPath: string;
}

export interface CustomAPI {
  getBackendInfo: () => Promise<BackendInfo>;
  openLogFile: () => Promise<{ success: boolean; error?: string }>;
  openLogsDir: () => Promise<{ success: boolean; error?: string }>;
  restartBackend: () => Promise<{ success: boolean; error?: string }>;
  onBackendStatus: (callback: (data: any) => void) => () => void;
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: CustomAPI
  }
}
