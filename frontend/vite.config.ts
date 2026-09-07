import path from "path"
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '');

  // Desktop builds explicitly pass --mode desktop, which loads .env.desktop
  // Vercel runs `vite build`, which uses mode=production. Since .env.production is gone, it defaults to cloud.
  const isDesktop = env.VITE_MODE === 'desktop';
  
  const effectiveMode = isDesktop ? 'desktop' : 'cloud';
  const effectiveApiBaseUrl = isDesktop 
    ? (env.VITE_API_BASE_URL || '/api') 
    : (process.env.VITE_API_BASE_URL || env.VITE_API_BASE_URL || 'https://omnitrack-cloud-backend.vercel.app');

  return {
    base: isDesktop ? './' : '/',
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
