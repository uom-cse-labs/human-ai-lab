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

## Agent skills

### Issue tracker

Issues and specs are local markdown files under `.scratch/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical roles with default label strings (e.g. `ready-for-agent`, `needs-info`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — `CONTEXT.md` at the repo root, no `CONTEXT-MAP.md`. See `docs/agents/domain.md`.

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

## Repository layout (monorepo)

npm workspaces (TypeScript) + Gradle (Java). The architecture is in `docs/architecture/technical-design.md`; read it before changing anything outside `apps/web`.

```
apps/web/                 public website (this React app; everything under "src/" below lives here)
services/content-api/     Content API: Java 21, Spring Boot 4, AWS Lambda behind an internal ALB
contracts/openapi.yaml    API + release-file contract; generated code is never edited by hand
packages/content-schema/  TypeScript types generated from contracts/
infra/                    AWS CDK app
docs/                     architecture, page checklists, guides, agent config
```

## Dev Scripts

Run from the repository root. Website scripts not listed here run with `-w @hai/web`, e.g. `npm run generate-routes -w @hai/web`.

| Command                        | Description                              |
|--------------------------------|------------------------------------------|
| `npm run dev`                  | Website dev server on port 6014          |
| `npm run build`                | Build the website (`apps/web/dist`)      |
| `npm test`                     | Tests in every workspace                 |
| `npm run contracts:generate`   | Regenerate TS types from the contract    |
| `./gradlew build` (in `services/content-api`) | Build, test and package the API |

## Website structure (`apps/web`)

```
apps/web/
├── public/              # Static assets
├── src/
│   ├── components/      # Shared UI components
│   ├── routes/          # File-based routing (__root.tsx, index.tsx, about.tsx, news/, projects/, …)
│   ├── lib/             # Content loaders (news, projects)
│   ├── content/         # Markdown news and projects + generated indexes
│   ├── router.tsx       # Router factory
│   ├── styles.css       # Global styles + Tailwind import
│   └── routeTree.gen.ts # Auto-generated (do not edit)
├── scripts/             # Content index generators (run before dev/build)
├── index.html, vite.config.ts, tsconfig.json, tsr.config.json, components.json
└── package.json         # @hai/web
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
