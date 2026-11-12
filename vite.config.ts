/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { embedDevServer } from './src/embed/devServer.ts'

const root = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    // The embed API (/api/publish, /e/{id}.js) without Vercel.
    embedDevServer({ root, token: loadEnv(mode, root, '').STAMPIT_PUBLISH_TOKEN }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  // 5173 is Décadi's; Vite moves to the next free port if 5180 is taken.
  server: { port: 5180 },
  build: {
    // Home ≈ 510 kB and the lazy editor ≈ 550 kB before gzip (≈ 170 kB each).
    chunkSizeWarningLimit: 600,
  },
  test: {
    environment: 'node',
  },
}))
