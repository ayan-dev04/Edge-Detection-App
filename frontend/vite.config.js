// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/static/', // Tells Vite to prefix all asset URLs with /static/
  build: {
    outDir: 'dist', // Build output directory
  },
})