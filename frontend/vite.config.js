import path from "path";
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    // Load env file based on mode
    const env = loadEnv(mode, process.cwd(), '');
    return {
        base: './',
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
            'import.meta.env.VITE_MODE': JSON.stringify(env.VITE_MODE || 'desktop'),
            'import.meta.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL || '/api'),
        }
    };
});
