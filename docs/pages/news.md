# News Page (`/news`) — Change Checklist

**Source file:** `src/routes/news/index.tsx`

Also affects: `src/routes/news/$slug.tsx` (news detail page)

---

| Location               | Current (Dummy)                                                                                                                                   | Need                                             |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `news/index.tsx:30–32` | "Stay updated on the latest research breakthroughs, team announcements, conference attendances, and media features surrounding the Human AI Lab." | Can stay                                         |
| All data               | Uses `getAllArticles()` from `src/lib/news.ts` — backed by `src/content/news/*.md`                                                               | Replace with real news                           |
| `src/content/news/*.md` | **spinq-gemini-2-pro-quantum-computer**: "HumanAI Research Lab Welcomes SpinQ Gemini 2 Pro Quantum Computer" — July 28, 2026                     | Replace with real news, real date                |
| `imageUrl`             | Unsplash stock                                                                                                                                    | Replace with real image                          |
| `content`              | Short summary shown on listing cards                                                                                                              | Replace with real text                           |
| `$slug.tsx`            | Fictional blockquote and body copy                                                                                                                | Replace with real article body text              |
