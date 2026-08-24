import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import Login from './modules/auth/Login';
import ActivationPage from './modules/license/ActivationPage';
import CloudAuth from './modules/auth/CloudAuth';
import { AlertCircle, RefreshCw, FileText, FolderOpen, Terminal, Check, Copy } from 'lucide-react';

interface BackendDiagnostic {
  isRunning: boolean;
  port: number;
  pid?: number;
  lastError: string | null;
  logFilePath: string;
  logs: string[];
  dbPath: string;
  userDataPath: string;
}

export default function App() {
  const navigate = useNavigate();
  const {
    isSetupComplete,
    isLoadingStatus,
    hasConnectionError,
    connectionErrorMessage,
    checkSetupStatus,
    currentUser,
    isLicensed,
    isCloud
  } = useAppStore();

  const [diagnostic, setDiagnostic] = useState<BackendDiagnostic | null>(null);
  const [isRestarting, setIsRestarting] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchDiagnostics = useCallback(async () => {
    if (typeof window !== 'undefined' && (window as any).api?.getBackendInfo) {
      try {
        const info = await (window as any).api.getBackendInfo();
        setDiagnostic(info);
      } catch (err) {
        console.error('Failed to get backend diagnostics:', err);
      }
    }
  }, []);

  useEffect(() => {
    checkSetupStatus();
  }, [checkSetupStatus]);

  useEffect(() => {
    if (hasConnectionError) {
      fetchDiagnostics();
    }
  }, [hasConnectionError, fetchDiagnostics]);

  useEffect(() => {
    if (!isLoadingStatus && !hasConnectionError) {
      if (!isSetupComplete) {
        navigate('/setup');
      } else if (currentUser) {
        navigate(`/${currentUser.role.toLowerCase()}`);
      }
    }
  }, [isSetupComplete, isLoadingStatus, hasConnectionError, navigate, currentUser]);

  const handleRetry = async () => {
    const success = await checkSetupStatus(0);
    if (!success) {
      fetchDiagnostics();
    }
  };

  const handleRestartBackend = async () => {
    if ((window as any).api?.restartBackend) {
      setIsRestarting(true);
      try {
        await (window as any).api.restartBackend();
        await new Promise((r) => setTimeout(r, 1000));
        await checkSetupStatus(0);
      } catch (err) {
        console.error('Failed to restart backend:', err);
      } finally {
        setIsRestarting(false);
        fetchDiagnostics();
      }
    } else {
      handleRetry();
    }
  };

  const handleOpenLogFile = async () => {
    if ((window as any).api?.openLogFile) {
      await (window as any).api.openLogFile();
    }
  };

  const handleOpenLogsDir = async () => {
    if ((window as any).api?.openLogsDir) {
      await (window as any).api.openLogsDir();
    }
  };

  const handleCopyLogs = () => {
    const logsText = diagnostic?.logs?.join('\n') || connectionErrorMessage || 'No logs available';
    navigator.clipboard.writeText(logsText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoadingStatus) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
        {/* Ambient background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        </div>
        
        {/* Spinner */}
        <div className="relative z-10">
          <div className="w-14 h-14 border-4 border-primary/20 rounded-full" />
          <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin absolute inset-0" />
        </div>
        <p className="text-muted-foreground text-sm animate-pulse relative z-10">Initializing Omnitrack...</p>
      </div>
    );
  }

  if (hasConnectionError) {
    const isElectron = typeof window !== 'undefined' && !!(window as any).api;

    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-y-auto">
        {/* Background ambient lighting */}
        <div className="absolute inset-0 omni-bg-dots opacity-30 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-destructive/10 rounded-full blur-[140px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center max-w-2xl w-full my-auto">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-5 text-destructive shadow-lg shadow-destructive/10">
            <AlertCircle className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-bold mb-2 tracking-tight">Backend Connection Failed</h1>
          <p className="text-muted-foreground text-center max-w-md text-sm mb-6">
            Omnitrack could not establish a connection to the local service on port 5055. 
            The backend engine may still be starting, failed to load its database, or port 5055 is occupied.
          </p>

          {/* Diagnostic Box */}
          {(diagnostic?.lastError || connectionErrorMessage) && (
            <div className="w-full bg-destructive/5 border border-destructive/20 rounded-xl p-4 mb-6 text-left">
              <div className="flex items-center gap-2 text-xs font-semibold text-destructive uppercase tracking-wider mb-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Error Details
              </div>
              <p className="text-xs font-mono text-destructive/90 break-words whitespace-pre-wrap">
                {diagnostic?.lastError || connectionErrorMessage}
              </p>
              {diagnostic?.logFilePath && (
                <div className="mt-2.5 pt-2.5 border-t border-destructive/10 text-[11px] text-muted-foreground font-mono flex items-center justify-between">
                  <span>Log: {diagnostic.logFilePath}</span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <button
              onClick={handleRetry}
              disabled={isRestarting}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:bg-primary/90 transition-all duration-200 shadow-md shadow-primary/20 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRestarting ? 'animate-spin' : ''}`} />
              Retry Connection
            </button>

            {isElectron && (
              <>
                <button
                  onClick={handleRestartBackend}
                  disabled={isRestarting}
                  className="flex items-center gap-2 px-4 py-2.5 bg-secondary text-secondary-foreground border border-border rounded-xl font-medium text-sm hover:bg-secondary/80 transition-all duration-200"
                >
                  <RefreshCw className={`w-4 h-4 ${isRestarting ? 'animate-spin' : ''}`} />
                  Restart Server
                </button>

                <button
                  onClick={handleOpenLogFile}
                  className="flex items-center gap-2 px-4 py-2.5 bg-secondary text-secondary-foreground border border-border rounded-xl font-medium text-sm hover:bg-secondary/80 transition-all duration-200"
                >
                  <FileText className="w-4 h-4 text-primary" />
                  View Log File
                </button>

                <button
                  onClick={handleOpenLogsDir}
                  className="flex items-center gap-2 px-4 py-2.5 bg-secondary text-secondary-foreground border border-border rounded-xl font-medium text-sm hover:bg-secondary/80 transition-all duration-200"
                >
                  <FolderOpen className="w-4 h-4 text-primary" />
                  Open Logs Folder
                </button>
              </>
            )}
          </div>

          {/* Collapsible Logs View */}
          {diagnostic?.logs && diagnostic.logs.length > 0 && (
            <div className="w-full">
              <div className="flex items-center justify-between mb-2 px-1">
                <button
                  onClick={() => setShowLogs(!showLogs)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  {showLogs ? 'Hide Recent Server Logs' : 'Show Recent Server Logs'} ({diagnostic.logs.length} lines)
                </button>

                {showLogs && (
                  <button
                    onClick={handleCopyLogs}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span className="text-emerald-500">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Logs</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {showLogs && (
                <div className="w-full max-h-64 bg-black/90 text-emerald-400 font-mono text-[11px] p-3.5 rounded-xl border border-border overflow-y-auto select-text text-left leading-relaxed">
                  {diagnostic.logs.map((line, idx) => (
                    <div key={idx} className={line.includes('[ERROR]') || line.includes('FATAL') ? 'text-rose-400 font-semibold' : ''}>
                      {line}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Cloud mode: no license check, just authentication
  if (isCloud) {
    if (!currentUser) {
      return <CloudAuth />;
    }
    // User is logged in, continue to dashboard routing
    return null;
  }

  // Desktop mode: license check then local login
  if (!isLicensed) {
    return <ActivationPage />;
  }

  if (!currentUser) {
    return <Login />;
  }

  return null;
}
