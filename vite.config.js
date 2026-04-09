import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/CarpeDiem/' : '/',
  optimizeDeps: {
    include: ["pdfjs-dist"]
  },
  plugins: [react(), tailwindcss()],
}))
