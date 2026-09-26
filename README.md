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
| API           | Java 21 · Spring Boot 4 · AWS Lambda (behind an internal ALB) |
| Infrastructure| AWS CDK (TypeScript)          |

## Repository layout

A monorepo: npm workspaces for TypeScript, Gradle for Java. The design is in [`docs/architecture/`](./docs/architecture/).

```
├── apps/
│   ├── web/                  public website (React SPA) — deployed to Netlify today, AWS from phase 6
│   └── admin/                content dashboard (React SPA)
├── services/
│   └── content-api/          Content API: Java 21 · Spring Boot 4 on AWS Lambda behind an internal ALB
├── contracts/
│   └── openapi.yaml          single source of truth for the API and release files
├── packages/
│   └── content-schema/       TypeScript types generated from contracts/
├── infra/                    AWS CDK app (all stacks, staging and prod)
├── docs/                     architecture, page checklists, guides
├── CONTEXT.md                domain glossary
└── DESIGN.md                 design system (single source of truth for UI)
```

`apps/admin` holds the dashboard (news editing, publishing and rollback so far). Planned next, per the roadmap: `services/media` (media processor) and `packages/ui` (shared components).

## Try the dashboard locally

One command runs the Content API, the dashboard and the website together. No AWS account is needed (Node 22 and Java 21 required):

```bash
npm install
npm run dev:local
```

| Open | What you'll find |
|---|---|
| http://localhost:6015 | **Dashboard**: edit news, publish, roll back. Sign-in is simulated; switch between Admin and Editor in the sidebar |
| http://localhost:6014 | **Website**, reading whatever was last published |

On first start, the API imports the site's existing news articles and publishes them. Data lives in `.local-data/` (git-ignored); delete that folder to start again.

The dashboard manages **news, publications, research themes and people** (everyone on the About page). Projects, media uploads, real sign-in (Cognito) and the AWS storage adapters come next (see the roadmap).

## Commands

Run from the repository root unless noted. Node 22 and, for the API, Java 21 are required.

| Command | What it does |
|---|---|
| `npm install` | Install all workspaces |
| `npm run dev:local` | API + dashboard + website together, no AWS needed |
| `npm run dev` | Website dev server on port 6014 |
| `npm run build` | Build the website (`apps/web/dist`) |
| `npm test` | Run every workspace's tests |
| `npm run contracts:generate` | Regenerate TypeScript types after editing `contracts/openapi.yaml` |
| `npm run diagrams` | Regenerate the technical-design SVG diagrams |
| `cd services/content-api && ./gradlew build` | Build and test the API, and package the Lambda zip |
| `cd services/content-api && ./gradlew bootRun` | Run the API locally on port 8080 (no AWS needed) |
| `cd infra && npx cdk synth -c env=staging` | Synthesize the staging stacks (build the API first) |

See [`infra/README.md`](./infra/README.md) for first-time AWS setup and deployment.

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
