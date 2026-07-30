import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const rootDir = dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, rootDir, '')
  const base = env.VITE_BASE_PATH?.replace(/\/$/, '')
    ? `${env.VITE_BASE_PATH.replace(/\/$/, '')}/`
    : '/'

  return {
    base,
    plugins: [react(), tailwindcss()],
    server: {
      host: '127.0.0.1',
      port: 5174,
      proxy: {
        '/api': {
          // Prefer IPv4 so Windows localhost (::1) vs 127.0.0.1 mismatches don't break the proxy
          target: 'http://127.0.0.1:3001',
          changeOrigin: true,
        },
      },
    },
    build: {
      target: 'es2020',
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return
            if (id.includes('recharts') || id.includes('d3-') || id.includes('victory-vendor')) {
              return 'recharts'
            }
            if (id.includes('react-dom') || id.includes('react-router') || id.includes('/react/')) {
              return 'react-vendor'
            }
          },
        },
      },
    },
  }
})
