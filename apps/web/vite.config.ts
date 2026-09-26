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
  // With VITE_CONTENT_SOURCE=releases, published releases come from the local Content API,
  // as CloudFront serves them from S3 in AWS.
  server: {
    proxy: {
      "/content": "http://localhost:8080",
      "/media": "http://localhost:8080",
      "/api": "http://localhost:8080",
    },
  },
});
