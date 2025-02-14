import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  server: {
    host: false,
    port: 5700,
    watch: {
      usePolling: true, // Forzar detección de cambios en archivos
    }
  },
  plugins: [react()]
})