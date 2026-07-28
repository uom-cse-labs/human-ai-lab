# Dispatches Page (`/dispatches`) — Change Checklist

**Source file:** `src/routes/dispatches.tsx`

Also affects: `src/routes/news/$newsId.tsx` (news detail page)

---

| Location | Current (Dummy) | Need |
|---|---|---|
| `dispatches.tsx:27–29` | "Stay updated on the latest research breakthroughs, team announcements, conference attendances, and media features surrounding the Human AI Lab." | Can stay |
| All data | Uses `NEWS` from `src/data.ts:156–173` — 2 items, both fictional | Replace with real news |
| `src/data.ts:157–163` | **news-1**: "Human AI Lab hosts International Workshop on Responsible AI" — May 15, 2024 | Replace with real news, real date |
| `src/data.ts:161` | imageUrl: Unsplash stock | Replace with real image |
| `src/data.ts:163` | details: "The event hosted 120 policy makers, technologists, and researchers…" | Replace with real text |
| `src/data.ts:165–172` | **news-2**: "Dr. Alex Chen receives Presidential Award" — April 2, 2024 | Replace with real news, real date |
| `src/data.ts:169` | imageUrl: Unsplash stock | Replace with real image |
| `src/data.ts:171` | details: "The Presidential Commission awarded Dr. Chen for 'HITL Healthcare-Audit Protocol'…" | Replace with real text |
| `$newsId.tsx:106–108` | Fictional blockquote: "As we push the boundaries of automated systems, our primary directive remains unchanged…" | Replace with real quote from the event or remove |
| `$newsId.tsx:110–112` | "The lab continues to emphasize interdisciplinary research, integrating principles of cognitive modeling, sociology, and machine learning…" | Replace with real article body text |
