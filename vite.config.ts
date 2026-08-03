import { defineConfig } from "vite";
import { devtools } from "@tanstack/devtools-vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

export default defineConfig({
  base: process.env.BASE_URL || "/",
  resolve: { tsconfigPaths: true },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          minSize: 100,
          groups: [
            {
              name: "vendor",
              test: /node_modules/,
            },
          ],
        },
      },
    },
  },
  plugins: [devtools(), tailwindcss(), TanStackRouterVite(), viteReact()],
});
