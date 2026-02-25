import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import process from 'node:process';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // load env file based on `mode` (development/production)
  const env = loadEnv(mode, process.cwd());
  const API_URL = env.VITE_API_URL;

  return {
    server: {
      proxy: {
        '/list': {
          target: API_URL,
          changeOrigin: true,
        }
      }
    },
    plugins: [react()],
  };
});
