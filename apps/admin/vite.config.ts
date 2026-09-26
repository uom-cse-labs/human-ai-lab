import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// In development the Content API runs on :8080. /api and /content are proxied so the dashboard is
// same-origin, exactly as behind CloudFront in AWS.
export default defineConfig({
  plugins: [tailwindcss(), viteReact()],
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
      '/content': 'http://localhost:8080',
    },
  },
})
