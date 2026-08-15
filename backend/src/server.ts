import app from './app';
import { syncEngine } from './modules/sync/sync.engine';

const PORT = Number(process.env.PORT) || 5000;

console.log(`[BACKEND STARTUP] Initializing Omnitrack backend service...`);
console.log(`[BACKEND STARTUP] Node version: ${process.version}, Platform: ${process.platform}, Arch: ${process.arch}`);
console.log(`[BACKEND STARTUP] DATABASE_URL: ${process.env.DATABASE_URL || 'default'}`);
console.log(`[BACKEND STARTUP] UPLOAD_DIR: ${process.env.UPLOAD_DIR || 'default'}`);

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[BACKEND READY] Omnitrack backend server listening on port ${PORT}`);
  
  // Start the background synchronization engine (checks every 60 seconds)
  try {
    syncEngine.start(60000);
    console.log(`[BACKEND SYNC] Sync engine started successfully.`);
  } catch (syncErr) {
    console.error(`[BACKEND SYNC ERROR] Failed to start sync engine:`, syncErr);
  }
});

server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[BACKEND FATAL] Port ${PORT} is already in use by another application. Please free port ${PORT} or check running instances.`);
  } else {
    console.error(`[BACKEND FATAL] Server listener error:`, err);
  }
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error(`[BACKEND FATAL] Uncaught Exception:`, err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(`[BACKEND ERROR] Unhandled Promise Rejection at:`, promise, `reason:`, reason);
});

