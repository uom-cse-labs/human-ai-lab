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
├── public/              # Static assets
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
│   ├── styles.css       # Global styles + Tailwind v4
│   └── routeTree.gen.ts # Auto-generated
├── CONTEXT.md           # Domain glossary
├── DESIGN.md            # Design system (single source of truth)
└── package.json
```

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
