# Documentation

| Folder | What's in it | Start here if you want to… |
|---|---|---|
| [`architecture/`](./architecture/) | How the platform is designed and deployed on AWS | understand or review the new platform |
| [`pages/`](./pages/) | Change checklists for each page of the current website | edit a page of the current site |
| [`guides/`](./guides/) | How-to guides | switch the app back to server-side rendering |
| [`agents/`](./agents/) | Configuration read by AI coding agents (referenced from `AGENTS.md`) | change how agents track issues or read domain docs |

## Architecture

| Document | Audience | Contents |
|---|---|---|
| [System Design](./architecture/system-design.md) ([PDF](./architecture/system-design.pdf)) | Lab, supervisors, reviewers | Short overview: users, architecture, key flows, deployment, security, decisions, roadmap |
| [Technical Design](./architecture/technical-design.md) | Developers, maintainers | Full 4+1 specification: requirements, API, data design, process/development/physical views, scenarios, ADRs, risks |

### Diagrams

```
architecture/diagrams/
├── system-design/        PNG figures used by system-design.md, numbered in figure order
│   ├── 01-use-cases.png … 03-domain-model.png
│   ├── 04-sd1-… … 09-sd6-…     sequence diagrams SD-1 to SD-6
│   └── 10-aws-deployment.png … 12-roadmap.png
└── technical-design/     SVGs used by technical-design.md, named by 4+1 view
    ├── build.mjs         generator: edit its data, then run the command below
    ├── logical-*.svg     components, domain model
    ├── process-*.svg     lifecycles, sequence diagrams (process-seq-*)
    ├── development-*.svg packages and dependencies
    ├── physical-*.svg    AWS deployment, accounts and delivery, growth path
    └── scenarios-*.svg   use cases
```

Regenerate the SVGs after editing `build.mjs`:

```bash
node docs/architecture/diagrams/technical-design/build.mjs
```

The PNG figures were produced with an external diagram tool. Replace a figure by keeping its file name, so `system-design.md` doesn't need editing.
