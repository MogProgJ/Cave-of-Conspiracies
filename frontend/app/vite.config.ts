import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],

    // Built assets are served at /app/ so PHP can route /app/* to the SPA.
    base: '/app/',

    build: {
      // Production build lands in public/app at the repo root.
      // Apache serves /app/* from this directory.
      outDir: path.resolve(__dirname, '../../public/app'),
      emptyOutDir: true,
    },

    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },

    server: {
      hmr: process.env.DISABLE_HMR !== 'true',

      // In dev mode proxy /api to the PHP backend.
      // Override VITE_PHP_BACKEND in .env if your port differs.
      proxy: {
        '/api': {
          target: env.VITE_PHP_BACKEND || 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
  };
});
