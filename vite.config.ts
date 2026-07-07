import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Windowsホスト + Docker 環境のためポーリング監視を有効化
  server: {
    host: true,
    watch: { usePolling: true },
  },
})
