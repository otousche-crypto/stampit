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
  build: {
    // Home ≈ 510 kB and the lazy editor ≈ 550 kB before gzip (≈ 170 kB each).
    chunkSizeWarningLimit: 600,
  },
  test: {
    environment: 'node',
  },
})
