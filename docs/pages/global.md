# Global / Cross-Page Changes

## 1. `src/data.ts` — Centralized data source (HIGHEST PRIORITY)

| Data | Lines | Status |
|---|---|---|
| `PUBLICATIONS` | `4–83` | ALL 5 papers are dummy — replace entirely |
| `FOCUS_AREAS` | `85–152` | ALL 4 areas are placeholder — replace entirely |
| `NEWS` | `156–173` | ALL 2 items are fictional — replace entirely |

## 2. `src/data.json` — Team data

| Data | Lines | Status |
|---|---|---|
| `teamMembers` | `2–59` | Prof. Indika Perera (real); Dr. Alex Chen, Dr. Jordan Taylor, Prof. Morgan Smith (fictional) — replace 3 members |
| `foundingRAs` | `60–117` | ALL 4 RAs are fictional — replace or remove section |
| `studentResearchers` | `118–158` | ALL 4 students are fictional — replace or remove section |
| `alumni` | `159–198` | ALL 4 alumni are fictional — replace or remove section |
| All images | Throughout | Unsplash stock photos — replace with real photos |
| All socials | Throughout | Example emails (`*.uom.lk`) — replace with real |

## 3. `src/components/sections/home/ContactSection.tsx`

See [contact.md](./contact.md) for full details. Key: dummy names, dummy phones, `#` profile links.

## 4. `src/components/sections/about/AboutIntroSection.tsx`

Not currently rendered on any route (old component, may be dead code). Check if used before updating.

## 5. `src/components/sections/home/FeaturedResearchSection.tsx`

Not currently rendered on any route. Dead code unless planned for use.

## 6. `src/components/sections/home/StatisticsSection.tsx`

Not currently rendered on any route. Dead code unless planned for use.

## 7. `src/components/sections/home/CollaborationSection.tsx`

Not currently rendered on any route. Dead code unless planned for use.

## 8. `src/components/sections/home/EquipmentSection.tsx`

Not currently rendered on any route. Dead code unless planned for use.

## 9. `src/components/sections/about/JoinUsSection.tsx`

Not currently rendered on any route. Dead code unless planned for use.

## 10. `src/components/sections/about/ResearchAreasSection.tsx`

Not currently rendered on any route. Dead code unless planned for use.

## 11. All Unsplash Images

**Every image across the entire site** uses Unsplash stock photography. These need to be replaced with real lab photos:

| File | Line | Current URL |
|---|---|---|
| `HeroSection.tsx` | `23` | `images.unsplash.com/photo-1541339907198-e08756dedf3f` |
| `about.tsx` | `92` | `images.unsplash.com/photo-1517245386807-bb43f82c33c4` |
| `$newsId.tsx` | `33` | From news data (2 Unsplash URLs) |
| All team member images in `data.json` | Various | Unsplash stock face photos |
| All publication images in `data.ts` | Various | Unsplash stock photos |
| All focus area images in `data.ts` | Various | Unsplash stock photos |
| `AboutSection.tsx` | `22` | `images.unsplash.com/photo-1562774053-701939374585` (dead code) |
| `CollaborationSection.tsx` | `18` | `images.unsplash.com/photo-1522071820081-009f0129c71c` (dead code) |
| `EquipmentSection.tsx` | `17` | `images.unsplash.com/photo-1532094349884-543bc11b234d` (dead code) |
| `AboutIntroSection.tsx` | `46` | `images.unsplash.com/photo-1562774053-701939374585` (dead code) |
