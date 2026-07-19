# Re-enabling SSR (TanStack Start)

This project currently runs as a **client-side SPA** (no server). To switch back to full SSR with TanStack Start, follow these steps.

## Steps

### 1. Delete SPA entry files

```bash
rm index.html
rm src/main.tsx
```

These are only used in SPA mode. TanStack Start auto-generates the HTML shell.

### 2. Revert `vite.config.ts`

Replace the SPA plugin setup with the Start plugin:

```ts
import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [devtools(), tailwindcss(), tanstackStart(), viteReact()],
})
```

Remove the `TanStackRouterVite` import — Start handles route generation internally.

### 3. Revert `src/router.tsx`

Change back to a function export (Start expects a factory):

```ts
import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
  })
  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
```

### 4. Revert `src/routes/__root.tsx`

Switch back to the `shellComponent` pattern with the full document shell:

```tsx
import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import Header from '../components/Header'
import Footer from '../components/Footer'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Human AI Lab' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="font-sans antialiased">
        <Header />
        {children}
        <Footer />
        <TanStackDevtools
          config={{ position: 'bottom-right' }}
          plugins={[
            { name: 'Tanstack Router', render: <TanStackRouterDevtoolsPanel /> },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
```

Key changes:
- `component` → `shellComponent`
- Wrap children in `<html>`, `<head>`, `<body>` tags
- Add `<Scripts />` at the end of body

### 5. Regenerate route tree

```bash
npm run generate-routes
```

The generator will re-add the Start module augmentation:

```ts
declare module '@tanstack/react-start' {
  interface Register {
    ssr: true
    router: Awaited<ReturnType<typeof getRouter>>
  }
}
```

### 6. Verify the build

```bash
npm run build
```

Start will produce both client and server bundles.

### 7. Run with SSR

```bash
npm run dev
```

The dev server will now render pages on the server.

## Checking it works

- Pages render HTML server-side (view page source — content will be present)
- Client hydration attaches interactivity
- Route transitions are instant (client-side after initial load)

## Reverting back to SPA

To switch back, reverse the steps:
1. Create `index.html` and `src/main.tsx` (copy from this repo's history or re-scaffold)
2. Revert `vite.config.ts` to use `TanStackRouterVite` instead of `tanstackStart`
3. Revert `router.tsx` to export a singleton `router`
4. Revert `__root.tsx` to use `component` instead of `shellComponent` (no html/head/body wrapper)
5. Run `npm run generate-routes`
