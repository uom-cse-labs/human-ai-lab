# Editorial Academic Design System (DESIGN.md)

Single source of truth for all UI decisions. Blends an institutional, research-driven aesthetic with a modern, high-contrast editorial layout system.

---

## 1. Visual Hierarchy & Layout

### Grid System

Responsive 12-column structure with a preference for asymmetrical splits. Content is frequently divided into **1/3 and 2/3 ratios** (e.g., a large featured card on the left, paired with a stacked vertical list on the right).

### Container Width & Margins

Max-width container (between 1200px and 1440px) centers content on large screens. Generous macro-whitespace (outer margins) frames the interface.

### Wayfinding Anchors

High-level structural sections are heavily prioritized using **oversized, numbered indices** (e.g., "01", "02") combined with massive section headers. This acts as a distinct "chapter" marker to guide the user down the page.

---

## 2. Typography Rules

### Font Family

A modern, highly legible neo-grotesque or geometric sans-serif typeface used universally.

### Typographic Scale

Very high-contrast scale. Display headings for hero sections and section titles are massive, stepping down drastically to standard, highly readable body copy. This extreme variance creates immediate visual interest.

### Case & Tracking

- **Headings / Body:** Standard Sentence case or Title Case.
- **Metadata / Eyebrows:** Dates, small badges, and tags use **UPPERCASE** with increased letter-spacing (tracking) to remain legible at micro-sizes.

### Line Height

Body copy uses a relaxed line height (150-160%) to ensure readability for dense, academic, or research-heavy paragraphs.

---

## 3. Spacing & Atoms (Design Tokens)

### Border Radii (The "Squircle" & Pill)

This is a defining atomic rule of the system:

- **Maximum Radius (Pills):** All buttons, structural tags, and small badges are fully rounded pills.
- **Large Radius (Cards / Images):** Content cards, imagery, and accordions feature pronounced, soft corner radii (approximately 16px to 24px), avoiding harsh right angles entirely.

### Spatial Rhythm

Deep vertical padding between distinct sections (macro-whitespace). Within components (micro-whitespace), elements are given ample room to breathe, preventing clutter even in text-heavy lists.

### Separators & Depth

Strong preference for flat design with subtle background contrast over heavy drop shadows. Thin, low-opacity strokes (1px) are used selectively to delineate list items or bound accordion rows.

---

## 4. Component Logic

### Buttons (CTAs)

Exclusively pill-shaped. Almost always paired with a trailing icon (right-pointing arrow or play icon) to imply forward momentum. The system also supports complex nested buttons (e.g., housing an avatar/profile image alongside the text label inside the pill).

### Cards

Highly structural:

- **Feature Cards:** Image-dominant with text placed below or overlaid.
- **List Cards:** Compact, horizontal layouts with small thumbnail images floating to the right.

### Badges

Floating pill badges consistently anchored to the top-right corner of card imagery to denote categorization.

### Accordions

Enclosed in full-width, rounded bounding boxes. Rely on a trailing "+" icon aligned to the far right to indicate expandability.

---

## 5. Iconography & Imagery Guidelines

### Iconography

Icons use clean, monolinear strokes. Social links and navigational controls (like carousel arrows) are enclosed in perfect circles. Dropdowns utilize simple chevrons.

### Imagery

- **Masking:** All standalone photography and illustrations are strictly masked with the system's standard large border radius.
- **Style:** Blends high-quality human-centric photography, abstract 3D tech visualizations, and monochromatic overlays (specifically for background hero videos/images) to balance humanity with advanced technology.

---

## 6. Motion & Interaction

### Hover States

Given the flat nature of the UI, interactive states rely on smooth opacity fades, subtle background shifts (lightening or darkening), and icon translations (e.g., arrows moving a few pixels to the right on hover).

### Expansion

Accordions use a smooth vertical ease-in-out expansion, with the trailing "+" rotating 45 degrees into an "x".

### Carousels

Horizontal overflow managed via scrolling carousels, telegraphed to the user via floating circular arrow buttons intersecting the edge of the cards.

---

## 7. Accessibility (a11y) Standards

- **Touch Targets:** Exceptional adherence to mobile-friendly touch targets. Ubiquitous pill buttons and tall accordion rows easily exceed the standard 44x44px minimum touch area.
- **Visual Contrast:** Strong tonal variance. Typographic hierarchy and distinct background blocks ensure text remains readable against its container.

---

## 8. Design Patterns

### Progressive Disclosure

To handle dense, institutional information without overwhelming the user, the UI relies heavily on accordions. This keeps the initial page scan clean while offering deep-dives on demand.

### Bento / Grid Stacking

The "Latest News" layout pattern mixes one dominant feature story with a compacted list of secondary stories — a classic pattern for editorial and research hubs to prioritize reading flows.

---

## 9. Voice and Tone

- **Personality:** Authoritative, academic, forward-looking, and institutional, yet modernized through the UI.
- **Microcopy:** Direct, utilitarian, and action-oriented (e.g., "Watch Our Story," "Read the Report," "Engage"). Avoids playful or overly casual language, maintaining a credible, research-driven posture.

---

## 10. Tailwind Implementation Guidelines (Strict Standards)

### 10.1 Arbitrary Class Restriction

**Zero Arbitrary Passports:** Arbitrary template formatting statements (e.g., `w-[48px]`, `bg-[#8C1515]`) are completely prohibited in JSX files.

**Token Promotion Workflow:** If an explicit styling variable requirement manifests across multiple layout junctions, it must be added to the `@theme` architecture block housed in `src/styles.css`.

### 10.2 Core Theme Configurations (`src/styles.css`)

```css
@theme {
  --color-brand: #8C1515;
  --color-brand-hover: #7A1212;
  --color-brand-pressed: #651010;
  
  --color-bg-secondary: #FAFAFA;
  --color-bg-muted: #F5F5F5;
  
  --color-text-secondary: #374151;
  --color-text-muted: #6B7280;
  
  --color-border-token: #E5E7EB;
  --color-divider-token: #D1D5DB;
  
  --font-size-hero: 3.5rem;
  --font-size-lead: 1.375rem;
  --font-size-caption: 0.8125rem;
  
  --spacing-128: 32rem;
  --spacing-160: 40rem;
  
  --size-container-content: 72.5rem;
}
```

### 10.3 Canonical Tailwind Translation Maps

| Design Specification Target | Standard Tailwind Native Token | Notes / Constraints |
|---|---|---|
| **Primary Site Canvas Backing** | `bg-white` | Default clear application canvas |
| **Primary Base Typography Type** | `text-neutral-900` | Map location for raw color `#111827` |
| **Global Shell Max Width** | `max-w-7xl` | Standard 1280px layout engine wrapper |
| **Narrative Column Constraint** | `max-w-3xl` | Standardized 720px content container |
| **Section Layout Padding Vertical** | `py-24` / `py-32` | Matches standard institutional whitespace rules |
| **Standard Card Corners Radius** | `rounded-lg` | Maps to 8px corner standard |
| **Card Element Interior Cushion** | `p-8` | Translates to 32px standard |
| **Functional Control Element Height** | `h-12` | Ensures consistent interactive targets at 48px |
| **Pill Button Radius** | `rounded-full` | Fully rounded pills for all buttons/tags/badges |
| **Pronounced Card Radius** | `rounded-2xl` / `rounded-3xl` | 16px–24px radius for cards and images |

---

## 11. Prohibited & Banned Element Registers

### 🚫 DO NOT USE

- **Visual Styling Artifacts:** Glassmorphism, neumorphic shapes, glowing drop-shadows, floating color blobs, active background particle meshes, or animated mesh gradients.
- **Color Distributions:** Neon accent marks, multi-colored categorical systems, or saturated dark dashboard background themes.
- **Structural Mechanics:** Harsh right-angle corners on cards or imagery, heavy drop-shadow arrays, decorative separating icons.

### ✅ ALWAYS PREFER

- Generous structural whitespace to divide elements instead of graphic lines.
- High-contrast, clean sans-serif typography hierarchies.
- Pronounced border radii (pills for buttons/tags, 16–24px for cards/images).
- Flat design with subtle background contrast over shadow-based depth.
- Thin, low-opacity 1px strokes for delineation over heavy borders.
- Fixed, crisp layout bounds with clear, predictable interactive responses.
