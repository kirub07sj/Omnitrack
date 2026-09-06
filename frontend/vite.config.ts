import path from "path"
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isVercel = !!process.env.VERCEL;
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '');

  const effectiveMode = isVercel ? (process.env.VITE_MODE || env.VITE_MODE || 'cloud') : (env.VITE_MODE || 'desktop');
  const effectiveApiBaseUrl = isVercel
    ? (process.env.VITE_API_BASE_URL || env.VITE_API_BASE_URL || 'https://omnitrack-cloud-backend.vercel.app')
    : (env.VITE_API_BASE_URL || '/api');

  return {
    base: isVercel || effectiveMode === 'cloud' ? '/' : './',
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@shared": path.resolve(__dirname, "../shared"),
      },
    },
    server: {
      host: true,
      proxy: {
        '/api': {
          target: 'http://localhost:5055',
          changeOrigin: true,
        },
        '/uploads': {
          target: 'http://localhost:5055',
          changeOrigin: true,
        }
      }
    },
    define: {
      // Make env variables available to the app
      'import.meta.env.VITE_MODE': JSON.stringify(effectiveMode),
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(effectiveApiBaseUrl),
    }
  }
})
