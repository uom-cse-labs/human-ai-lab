# Pioneers Page (`/pioneers`) — Change Checklist

**Source file:** `src/routes/pioneers.tsx`

---

| Location | Current (Dummy) | Need |
|---|---|---|
| `pioneers.tsx:24–26` | "Meet the minds shaping the future… Our interdisciplinary team consists of leading researchers in cognitive modeling, ethical AI, and interactive systems." | Review for accuracy |
| All content | Uses `TEAM_MEMBERS` from `src/data.json:2–59` | 1 real (Prof. Indika Perera), 3 fictional |
| `src/data.json:4–16` | **Prof. Indika Perera** — bio, expertise, image URL | Verify/keep; update image if needed |
| `src/data.json:19–30` | **Dr. Alex Chen** — fictional person, bio about Oxford PhD, policy panels | Replace with real team member |
| `src/data.json:33–44` | **Dr. Jordan Taylor** — fictional person, bio about robotics lab, low-cost sensors | Replace with real team member |
| `src/data.json:47–58` | **Prof. Emeritus Morgan Smith** — fictional person, pioneer of CS in Sri Lanka since 1980s | Replace with real team member |
| `src/data.json:10` | imageUrl: Cloudinary URL (Prof. Indika's image) | Verify/keep |
| `src/data.json:24` | imageUrl: Unsplash stock photo (Dr. Chen) | Replace |
| `src/data.json:38` | imageUrl: Unsplash stock photo (Dr. Taylor) | Replace |
| `src/data.json:52` | imageUrl: Unsplash stock photo (Prof. Smith) | Replace |
| All social links | Example emails (`alex.chen@uom.lk`, `jordan.taylor@uom.lk`, `morgan.smith@uom.lk`) | Replace with real emails |
