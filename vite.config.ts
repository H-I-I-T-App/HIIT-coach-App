import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/HIIT-coach-App/',
  server: {
    host: '0.0.0.0',
    port: 8105,
  },
})
