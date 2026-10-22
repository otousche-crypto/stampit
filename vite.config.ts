/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
})
