/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],
    server: {
      // In development the browser talks to /api on the Vite origin and Vite forwards it to the backend,
      // so no CORS setup is needed locally. Override the target with VITE_API_PROXY_TARGET (see .env.example).
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY_TARGET || 'https://localhost:7030',
          changeOrigin: true,
          secure: false, // the ASP.NET dev certificate is self-signed
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
    },
  }
})
