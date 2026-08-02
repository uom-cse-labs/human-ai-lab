---
title: "Formally-Constrained Self-Evolution for Multi-Agent Systems via Verified Memory Containment and Causal Safety Verification"
date: "MAY 30, 2026"
content: "Building self-evolving enterprise multi-agent architectures that remain formally safe as they improve, with formally verified automaton changes, full skill-lineage quarantine, and automatic rollback."
imageUrl: "https://snipboard.io/uYVzWt.jpg"
---

A system for building self-evolving enterprise multi-agent architectures that remain formally safe as they improve. Agent behaviour is modelled as a finite automaton — a structured, verifiable representation of workflow states and transitions that makes self-modification both inspectable and provably bounded.

As agents evolve, every proposed change to this automaton is formally verified against safety invariants before it is committed — ensuring the system never trades security for performance.

A skill memory layer prevents agents from forgetting hard-won capabilities across sessions, but exposes the archive paradox: skills the safety policy removed can silently return, indistinguishable from safe ones. The system identifies, characterises, and contains this paradox by tracking the full ancestry of every skill — when a skill is flagged unsafe, its entire lineage is quarantined with it.

Across the evolution lifetime, security trajectories are continuously monitored alongside capability trajectories, and the system automatically rolls back when the two begin to couple.

## Team

- Isurumuni Wijesooriya (Final Year Undergraduate, University of Moratuwa)
- Erandathee Wijeratne (Final Year Undergraduate, University of Moratuwa)
- Himadree Gallage (Final Year Undergraduate, University of Moratuwa)
- Umen Samaranayake (Final Year Undergraduate, University of Moratuwa)
- Gayani Wickramarathna (Lecturer on Contract, University of Moratuwa)
- Indika Perera (Professor, University of Moratuwa) — Lead
