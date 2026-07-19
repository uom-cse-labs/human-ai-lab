import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [devtools(), tailwindcss(), TanStackRouterVite(), viteReact()],
})
