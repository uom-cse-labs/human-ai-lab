> **Design reference:** Read `DESIGN.md` before generating any UI — it is the single source of truth for all visual and interaction decisions.

<!-- intent-skills:start -->
## Skill Loading

Before editing files for a substantial task:
- Run `npx @tanstack/intent@latest list` from the workspace root to see available local skills.
- If a listed skill matches the task, run `npx @tanstack/intent@latest load <package>#<skill>` before changing files.
- Use the loaded `SKILL.md` guidance while making the change.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.
<!-- intent-skills:end -->

# Project Context

## Scaffolding Command

```bash
npx @tanstack/cli@latest create my-tanstack-app --agent --package-manager pnpm --tailwind
```

Note: The `--tailwind` flag is deprecated and ignored — Tailwind is always enabled in TanStack Start scaffolds.

## Stack

| Concern       | Choice                        |
|---------------|-------------------------------|
| Framework     | React 19                      |
| Router        | TanStack React Router         |
| Meta-framework| TanStack Start                |
| Styling       | Tailwind CSS v4               |
| Build tool    | Vite                          |
| Language      | TypeScript                    |
| Package mgr   | npm (migrated from pnpm)      |
| Testing       | Vitest + Testing Library      |
| Devtools      | TanStack Devtools             |

## Environment Variables

None required by default. Standard Vite conventions apply:
- `VITE_*` variables are exposed to the client at build time.
- Variables for server-side use should be accessed via `process.env` in server functions.

## Dev Scripts

| Command                    | Description                     |
|----------------------------|---------------------------------|
| `npm run dev`              | Start dev server on port 6014   |
| `npm run build`            | Build for production            |
| `npm run preview`          | Preview production build        |
| `npm run generate-routes`  | Regenerate route tree           |
| `npm run test`             | Run Vitest tests                |

## Project Structure

```
.
├── public/              # Static assets
│   ├── favicon.ico
│   ├── logo192.png
│   ├── logo512.png
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── components/      # Shared UI components
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   └── ThemeToggle.tsx
│   ├── routes/          # File-based routing
│   │   ├── __root.tsx   # Root layout / shell
│   │   ├── about.tsx    # /about
│   │   └── index.tsx    # /
│   ├── router.tsx       # Router factory
│   ├── styles.css       # Global styles + Tailwind import
│   └── routeTree.gen.ts # Auto-generated (do not edit)
├── .cta.json            # CLI scaffolding metadata
├── .gitignore
├── .vscode/settings.json
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsr.config.json
├── vite.config.ts
├── AGENTS.md
└── README.md
```

## Follow-Up TanStack Intent Commands

```bash
npx @tanstack/intent@latest install   # Sets up AGENTS.md + skill mappings
npx @tanstack/intent@latest list      # Shows available skills (31 skills across 9 packages)
```

## Key Architectural Decisions

1. **Blank starter with examples** — The CLI generates demo pages (routes, components) as starting points. These are safe to delete once they are replaced.
2. **File-based routing** via `@tanstack/react-router` — routes live under `src/routes/`; `tsr generate` produces `routeTree.gen.ts`.
3. **Vite plugin order matters** — `devtools()` is first, then `tailwindcss()`, then `tanstackStart()`, then `viteReact()`.
4. **Tailwind v4** — uses `@import "tailwindcss"` in CSS (no `tailwind.config.*`). The `@tailwindcss/typography` plugin is installed.
5. **Theme toggle** — built-in with localStorage persistence (`light`/`dark`/`auto` modes).
6. **TanStack Devtools** — configured in the root layout (`__root.tsx`), positioned bottom-right, with Router plugin.

## Component Architecture

1. **Extract loop internals** — Every `.map()` in a section component must delegate to a named component file. The section owns the layout/grid, and the extracted component owns a single item's rendering. Keep these extracted components as simple as possible: one file, one default export, no internal state unless required.

## Known Gotchas

- The route tree file (`routeTree.gen.ts`) is auto-generated and must not be edited manually.
- `verbatimModuleSyntax` is enabled in tsconfig — `import type` is required for type-only imports.
- `onlyBuiltDependencies` was present in the pnpm-managed package.json; not applicable under npm.
- `--tailwind` flag is deprecated in the CLI (Tailwind is always included by default).
- Route tree generation runs automatically via the Vite plugin during dev/build, but `npm run generate-routes` is available for manual regeneration.

## Next Steps

1. Verify the app runs: `npm run dev`
2. Customize `src/routes/index.tsx` for the home page
3. Update `src/components/Header.tsx` and `Footer.tsx` with brand links
4. Add new routes in `src/routes/`
5. Tweak visual tokens in `src/styles.css`
6. Remove demo content when ready for production
7. Configure deployment target (Vercel, Netlify, Cloudflare, etc.)
