import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/log-a-load-mn/' : '/',
  plugins: [react()],
  server: {
    allowedHosts: ['localhost', '127.0.0.1', '10.0.1.120'],
  },
})
