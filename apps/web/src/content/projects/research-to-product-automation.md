---
title: "Multi-Agent Pipeline for Research to Product Software Automation"
date: "JUNE 18, 2026"
content: "Automating the path from a written problem statement to a tested implementation through four gated multi-agent stages — Research, Architecture, Development, and Testing — with verified evidence and full audit trails."
imageUrl: "https://snipboard.io/XhU0VH.jpg"
---

AI coding agents can produce plausible work quickly, but a survey of comparable systems shows that no trusted fully autonomous research-to-product pipeline exists: verification, not generation, is the bottleneck. This project automates the path from a written problem statement to a tested implementation through four stages: Research, Architecture, Development, and Testing.

This carries the problem from literature review, to design specification, to working code, to a validation report. Each stage is its own small multi-agent system with its own coordination topology — parallel or sequential as the work demands — and each ends at a gate where automated evaluation runs first and a human then approves, requests a revision, or rejects.

Stages expose one uniform interface and exchange data only through immutable, versioned artifacts keyed by run and attempt, so no output is overwritten and a run pauses between stages as a database status rather than a live process, surviving restarts and leaving a full audit trail.

Throughout, agent outputs must be traced to verified evidence rather than model assertion, so every claim the system produces can be checked against its source.

## Team

- Ashen Sandeep (Research Assistant, University of Moratuwa)
- Gayani Wickramarathna (Lecturer on Contract, University of Moratuwa)
- Indika Perera (Professor, University of Moratuwa) — Lead
