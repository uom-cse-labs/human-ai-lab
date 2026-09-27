# Human-AI Lab — Website

Informational website for the Human-AI Lab at University of Moratuwa, Department of Computer Science and Engineering.

The lab studies and advances human-centered artificial intelligence. This site communicates the lab's identity, mission, research, members, publications, and equipment to a general public audience.

## Project Understanding

For a complete domain glossary, read [`CONTEXT.md`](./CONTEXT.md) — it defines every term specific to this project (lab, member, publication, equipment, etc.) and is the single source of truth for any agent working here.

For design decisions, read [`DESIGN.md`](./DESIGN.md) — it enforces a Stanford HAI / editorial-academic visual language.

## Stack

| Concern       | Choice                        |
|---------------|-------------------------------|
| Framework     | React 19                      |
| Router        | TanStack React Router         |
| Meta-framework| TanStack Start                |
| Styling       | Tailwind CSS v4               |
| Build tool    | Vite                          |
| Language      | TypeScript                    |
| Testing       | Vitest + Testing Library      |
| API           | TypeScript on Cloudflare Workers, with a SQLite Durable Object ([cloudflare/](./cloudflare/)) |
| Hosting       | Cloudflare free plan: Workers, Durable Objects, R2, Images and Access ([deploy guide](./cloudflare/README.md)) |

## Repository layout

A monorepo of npm workspaces. The design is in [`docs/architecture/`](./docs/architecture/); the deployed platform is described in [`cloudflare/README.md`](./cloudflare/README.md).

```
├── apps/
│   ├── web/                  public website (React SPA), deployed as the hai-site Worker
│   └── admin/                content dashboard (React SPA)
├── services/
│   └── content-api/          the previous Content API (Java 21 · Spring Boot 4); kept for reference, not deployed
├── cloudflare/               the deployed platform: site and dashboard Workers, the Content API (src/api), deploy script, guide
├── contracts/
│   └── openapi.yaml          single source of truth for the API and release files
├── packages/
│   └── content-schema/       TypeScript types generated from contracts/
├── infra/                    AWS CDK app from the earlier AWS plan (not used by the Cloudflare deployment)
├── docs/                     architecture, page checklists, guides
├── CONTEXT.md                domain glossary
└── DESIGN.md                 design system (single source of truth for UI)
```

`apps/admin` holds the dashboard (news editing, publishing and rollback so far). Planned next, per the roadmap: `services/media` (media processor) and `packages/ui` (shared components).

## Deploy

Everything deploys to Cloudflare with one command, `npm run cf:deploy`, or the **Deploy to Cloudflare** GitHub workflow. Start with **[cloudflare/README.md](./cloudflare/README.md)**: it walks a newcomer through the one-time setup.

## Try the dashboard locally

One command runs the Content API, the dashboard and the website together. No Cloudflare account is needed, only Node 22:

```bash
npm install
npm run dev:local
```

| Open | What you'll find |
|---|---|
| http://localhost:6015 | **Dashboard**: edit news, publish, roll back. Sign-in is simulated; switch between Admin and Editor in the sidebar |
| http://localhost:6014 | **Website**, reading whatever was last published |

On first start, the API imports the site's existing content and publishes it. Data lives in `.local-data/cloudflare/` (git-ignored); delete that folder to start again.

The dashboard manages **news, publications, research themes and people** (everyone on the About page), with **photo upload** and a media library everywhere a photo appears. Photos get web sizes locally too, but only on Cloudflare are sideways phone photos turned upright. Projects and video come next (see the roadmap).

## Commands

Run from the repository root unless noted. Node 22 is required (Java 21 only for the old Java API).

| Command | What it does |
|---|---|
| `npm install` | Install all workspaces |
| `npm run dev:local` | API + dashboard + website together, no Cloudflare account needed |
| `npm run dev` | Website dev server on port 6014 |
| `npm run build` | Build the website (`apps/web/dist`) |
| `npm test` | Run every workspace's tests |
| `npm run contracts:generate` | Regenerate TypeScript types after editing `contracts/openapi.yaml` |
| `npm run diagrams` | Regenerate the technical-design SVG diagrams |
| `npm run cf:deploy` | Deploy everything to Cloudflare ([guide](./cloudflare/README.md)) |
| `npm test -w @hai/cloudflare` | Test the Content API and the Workers |
| `cd services/content-api && ./gradlew build` | Build and test the old Java API (not deployed) |
| `cd infra && npx cdk synth -c env=staging` | Synthesize the staging stacks (build the API first) |

See [`cloudflare/README.md`](./cloudflare/README.md) for first-time setup and deployment.

## Domain Model

See [`CONTEXT.md`](./CONTEXT.md) for the authoritative glossary. Key terms:

- **Human-AI Lab** — the lab itself; do not write as "HumanAI" or "Human AI"
- **Lab Director** — Eng. Prof. Indika Perera
- **Lab Member** — faculty, researcher, PhD/MSc/undergrad student
- **Research Publication** — peer-reviewed output by lab members
- **News Item** — announcement sourced from Markdown files
- **Physical Lab Equipment** — hardware in the lab's physical space

Several terms are placeholders (mission statement, research themes, partnerships, lab space, logo) — the design must accommodate them when they become concrete.

## Next Steps

1. Verify the app runs: `npm run dev`
2. Build the page structure (home, about, people, publications, facilities, news, contact)
3. Implement a Markdown-driven news section
4. Add real content as the lab materialises
