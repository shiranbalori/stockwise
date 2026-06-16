import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3003,
    strictPort: true,
  },
  preview: {
    port: 3001,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
