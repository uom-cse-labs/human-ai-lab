# Homepage (`/`) — Change Checklist

**Source files:**
- `src/routes/index.tsx` (composition only)
- `src/components/sections/home/HeroSection.tsx`
- `src/components/sections/home/MissionSection.tsx`
- `src/components/sections/home/ResearchThemesSection.tsx`
- `src/components/sections/home/PublicationsSection.tsx`
- `src/components/sections/home/MembersSection.tsx`
- `src/components/sections/home/NewsSection.tsx`
- `src/components/sections/home/ContactSection.tsx`

---

## 1. HeroSection

| Location | Current (Dummy) | Need |
|---|---|---|
| `HeroSection.tsx:23` | Unsplash stock photo (`images.unsplash.com/...f3f`) | Real lab/team photo |
| `HeroSection.tsx:36` | "SRI LANKA'S PREMIER HUB FOR AI RESEARCH" | Verify subtitle |
| `HeroSection.tsx:41–45` | "Advancing the Human Dimension of AI." | Title can stay |
| `HeroSection.tsx:49` | "Advancing Human-Centered AI through interdisciplinary research." | Tagline can stay |

---

## 2. MissionSection

| Location | Current (Dummy) | Need |
|---|---|---|
| `MissionSection.tsx:5` | `{ value: '12+', label: 'ACTIVE PROJECTS' }` | Replace with real counts |
| `MissionSection.tsx:6` | `{ value: '45', label: 'PUBLICATIONS' }` | Replace with real counts |
| `MissionSection.tsx:7` | `{ value: '08', label: 'PHD FELLOWS' }` | Replace with real counts |
| `MissionSection.tsx:25–35` | Three generic paragraphs about mission | Review/rewrite with actual lab description |
| `MissionSection.tsx:17` | "Pioneering ethical AI for a human-centric future." | Title can stay |

---

## 3. ResearchThemesSection

| Location | Current (Dummy) | Need |
|---|---|---|
| `ResearchThemesSection.tsx:43` | Uses `FOCUS_AREAS` from `src/data.ts` | Replace all 4 focus area entries with real themes |
| `src/data.ts:85–152` | **FOCUS_AREAS**: Human-Robot Interaction, Cognitive Modeling, Algorithmic Ethics, Explainable Systems — with dummy descriptions, dummy project lists, dummy lead researchers | Replace all descriptions, projects, and lead researchers with real data |
| `src/data.ts:96–99` | Dummy projects like "Ayu-Node: Tangible wooden controls…" | Replace with real projects |
| `src/data.ts:101` | Lead: "Dr. Jordan Taylor" | Replace with real lead |
| `src/data.ts:117` | Lead: "Dr. Alex Chen" | Replace with real lead |
| `src/data.ts:133` | Lead: "Dr. Alex Chen" | Replace with real lead |
| `src/data.ts:150` | Lead: "Prof. Emeritus Morgan Smith" | Replace with real lead |

---

## 4. PublicationsSection

| Location | Current (Dummy) | Need |
|---|---|---|
| `PublicationsSection.tsx:40–41` | "Our latest peer-reviewed research presented at leading global conferences including NeurIPS, CHI, and AAAI." | Verify conference mentions |
| `src/data.ts:4–83` | **PUBLICATIONS**: 5 papers (pub-1 through pub-5) — all with dummy titles like "Cross-Cultural Bias in Sentiment Analysis…", dummy authors (Chen, Taylor, Patel, Davis, White), dummy abstracts, dummy key findings, dummy citations | Replace ALL 5 publications with real papers from the lab |
| `src/data.ts:7` | `category: 'INTELLIGENCE'` | Update categories if needed (INTELLIGENCE, ETHICS, DESIGN, ROBOTICS) |
| `PublicationsSection.tsx:23` | Category filter: `["ALL", "INTELLIGENCE", "ETHICS", "DESIGN", "ROBOTICS"]` | Update category list if real papers use different categories |

---

## 5. MembersSection

| Location | Current (Dummy) | Need |
|---|---|---|
| `MembersSection.tsx` | Uses `TEAM_MEMBERS`, `FOUNDING_RAS`, `STUDENT_RESEARCHERS`, `ALUMNI` from `src/data.json` | Replace all dummy entries |
| `src/data.json:19–29` | "Dr. Alex Chen" — fictional person | Replace with real team member |
| `src/data.json:33–43` | "Dr. Jordan Taylor" — fictional person | Replace with real team member |
| `src/data.json:47–57` | "Prof. Emeritus Morgan Smith" — fictional person | Replace with real team member |
| `src/data.json:60–117` | **4 Founding RAs**: Samuel Green, Emily Brooks, David Kim, Olivia Parker — all fictional | Replace with real RAs or remove section |
| `src/data.json:118–158` | **4 Student Researchers**: Liam Wilson, Sophia Lee, Noah Brown, Ava Davis — all fictional | Replace with real students or remove section |
| `src/data.json:159–198` | **4 Alumni**: Dr. Michael Clark, Isabella White, Ethan Harris, Charlotte Miller — all fictional | Replace with real alumni or remove section |
| All images | Unsplash stock photos | Replace with real photos |

---

## 6. NewsSection

| Location | Current (Dummy) | Need |
|---|---|---|
| `NewsSection.tsx` | Uses `NEWS` from `src/data.ts` | Replace with real news |
| `src/data.ts:156–173` | 2 news items: "Human AI Lab hosts Workshop on Responsible AI" and "Dr. Alex Chen receives Presidential Award" — both fictional | Replace with real news articles |
| `src/data.ts:163` | "The event hosted 120 policy makers…" | Replace with real details |
| `src/data.ts:171` | "Dr. Chen for her groundbreaking HITL Healthcare-Audit Protocol" | Replace with real details |

---

## 7. ContactSection

| Location | Current (Dummy) | Need |
|---|---|---|
| `ContactSection.tsx:31` | Email: `humanai@cse.mrt.ac.lk` | Verify/keep if real |
| `ContactSection.tsx:41–43` | Address (University of Moratuwa) | Verify/keep if real |
| `ContactSection.tsx:54–56` | **"Dr. Robert Johnson"** — fictional person, phone `+94 11 234 5678` | Replace with real contact person |
| `ContactSection.tsx:65–67` | **"Dr. Sarah Williams"** — fictional person, phone `+94 11 234 5679` | Replace with real contact person |
| `ContactSection.tsx:82` | Office hours: Mon–Fri 9:00 AM – 5:00 PM (SLST) | Verify |
| `ContactSection.tsx:87–89` | Google Scholar href: `#`, ResearchGate href: `#`, LinkedIn href: `#` | Replace with real profile URLs |
