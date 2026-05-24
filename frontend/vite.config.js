import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://parlour-vr34.onrender.com',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'https://parlour-vr34.onrender.com',
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
