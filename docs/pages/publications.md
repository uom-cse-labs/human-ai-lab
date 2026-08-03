# Publications Page (`/publications`) — Change Checklist

**Source file:** `src/routes/publications.tsx`

---

| Location | Current (Dummy) | Need |
|---|---|---|
| `publications.tsx:63–65` | "Explore our complete archive of peer-reviewed research presented at leading global conferences including NeurIPS, CHI, and AAAI." | Verify conference mentions for real publications |
| All paper data | Uses `PUBLICATIONS` from `src/data.ts:4–83` — 5 dummy papers | Replace ALL with real publications |
| `src/data.ts:7` | `Cross-Cultural Bias in Sentiment Analysis: A Sri Lankan Case Study` | Replace title |
| `src/data.ts:8` | Author: `Chen, A., Taylor, J., & Patel, R.` | Replace authors |
| `src/data.ts:9` | PublishedIn: `ICLR 2024, Vienna` | Replace with real venue |
| `src/data.ts:10` | Year: `2024` | Replace |
| `src/data.ts:12` | ImageUrl: Unsplash stock photo | Replace or remove |
| `src/data.ts:13` | Abstract (dummy) | Replace with real abstract |
| `src/data.ts:14–18` | Key findings (dummy) | Replace with real findings |
| `src/data.ts:19` | Citation (dummy) | Replace with real citation |
| **Same pattern for pub-2 through pub-5** (`src/data.ts:21–83`) | All dummy | Replace all 4 |
| `publications.tsx:23` | Categories: `['ALL', 'INTELLIGENCE', 'ETHICS', 'DESIGN', 'ROBOTICS']` | Update if real papers use different categories |
