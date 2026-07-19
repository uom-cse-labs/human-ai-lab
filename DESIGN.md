# Editorial Academic UI Context

Strict **Editorial Academic** design language — Stanford HAI, Apple Newsroom, MIT News, Swiss editorial design. Single source of truth for all UI.

## Philosophy

Interface presents information, not effects. Communicate: credibility, intelligence, professionalism, calmness, clarity, trust. Feel like a premium research publication, not a SaaS dashboard. Content is hero. Never design around visual effects.

## Core Principles

**Content First:** Typography carries design. Whitespace creates hierarchy. Photography creates emotion. Layout guides attention. UI chrome disappears.

**Calm Interfaces:** Quiet pages. No visual noise. One focal point per screen.

**Institutional Quality:** Design like Stanford, MIT, Harvard, Apple Newsroom, Nature, Financial Times, Stripe Docs. Never like crypto pages, startup templates, gaming, AI hype, dashboard SaaS.

**Keywords:** Editorial, Academic, Minimal, Research, Swiss, Human-centered, Modern, Institutional, Professional, Timeless.

## Layout

- Container: 1280px / Content: 1160px / Reading: 680–720px
- Never stretch article text full-width
- Section spacing: 96–160px
- Grid: 12 cols / 32px gutter (desktop), 8 cols / 24px (tablet), 4 cols / 16px (mobile)

## Typography

Primary: **DM Sans**. Editorial: **Source Serif 4** (article titles, long-form, research only).

| Token | Size |
|-------|------|
| Display XL | 72px |
| Display | 64px |
| Hero | 56px |
| H1 | 48px |
| H2 | 40px |
| H3 | 32px |
| H4 | 28px |
| H5 | 24px |
| H6 | 20px |
| Lead | 22px |
| Body Large | 18px |
| Body | 16px |
| Small | 14px |
| Caption | 13px |
| Label | 12px |

Body leading: 1.7. Headings: 1.1–1.3. Max paragraph width: 75ch.

## Color

| Token | Hex |
|-------|-----|
| Primary BG | #FFFFFF |
| Secondary BG | #FAFAFA |
| Muted BG | #F5F5F5 |
| Primary Text | #111827 |
| Secondary Text | #374151 |
| Muted Text | #6B7280 |
| Border | #E5E7EB |
| Divider | #D1D5DB |
| Brand | #8C1515 |
| Brand Hover | #7A1212 |
| Brand Pressed | #651010 |

Mostly grayscale. Brand used sparingly. Color directs attention, not decoration.

## Whitespace

Feature, not something to fill. Scale: 4, 8, 12, 16, 24, 32, 48, 64, 80, 96, 128, 160. Major sections ≥96px.

## Components

**Buttons:** Primary = solid brand, white text, 48px h, 6px radius, medium weight. Secondary = white, gray border, dark text. Text = transparent, brand, underline on hover. No glow, no gradients.

**Cards:** White bg, subtle border, almost no shadow, 8px radius, 32px padding, subtle hover. No color/glass cards.

**Navigation:** Logo, nav, search, CTA. Max 80px. No oversized sticky headers. Lightweight dropdowns.

**Hero:** Large statement + copy + CTA + image/video. No overlapping floats, no decorative graphics.

**Images:** Authentic photography — research, people, labs, universities, architecture, books, conferences. Natural light, minimal filters, no excessive overlays.

**Forms:** 48px height, 6px radius, visible labels (never floating), clear validation, simple spacing.

**Icons:** Outline only (Lucide, Heroicons, Phosphor). 24px default. Never mix styles.

**Shadows:** Default none. Hover very subtle. Large shadows prohibited. Use borders instead.

**Borders:** 1px solid #E5E7EB. Focus: 2px brand.

## Motion

Only to improve comprehension. Allowed: fade, opacity, small translateY, small scale. Duration: 150–250ms, max 300ms. Never: bounce, elastic, long parallax, particle effects, background animations, spinning, large page transitions.

## Accessibility

Contrast ≥4.5:1. Touch targets ≥44px. Keyboard nav, visible focus, semantic HTML, reduced motion — all required.

## Component Rule

For every component ask: What info is most important? Can whitespace solve this instead of another component? Can typography solve this instead of color? Would removing decoration improve clarity? If yes, remove it.

## Page Structure

Hero → Introduction → Featured Content → Supporting Sections → Related Articles → CTA → Footer. Maintain rhythm. Never skip hierarchy.

**Card pattern:** Image → Category → Headline → Summary → Metadata → Read More.
**Section pattern:** Title → Description → Grid/Content → CTA.

## Responsive

Recompose, don't just shrink. Preserve whitespace, reading width, typography hierarchy.

## Design Language

Quiet, Calm, Confident, Professional, Measured, Readable, Human, Intentional. Never flashy, trendy, or over-designed.

## Never Use

Glassmorphism, neumorphism, animated gradients, glow effects, floating blobs, particle systems, heavy shadows, rainbow/neon colors, over-rounded UI, oversized pills, excessive badges, busy dashboards, frosted panels, huge icons, multiple accent colors, decorative separators, complex backgrounds.

## Always Prefer

Large whitespace, large typography, readable paragraphs, minimal nav, simple cards, subtle borders, editorial rhythm, professional photography, consistent spacing, clear hierarchy, accessible interfaces, institutional credibility.

## Inspiration

Stanford HAI, Apple Newsroom, MIT News, Harvard Research, Nature, Stripe Docs, Linear, Financial Times Digital, Swiss Editorial Design, modern university websites.

## Tailwind Design System (Strict)

**Never use arbitrary values** (`[48px]`, `[#8C1515]`, `[1.375rem]`) in JSX or templates. Every value must be a theme token.

If the same value appears in 2+ places, add it to `@theme` in `styles.css` first, then use the token.

### Custom tokens available in `@theme`

| Token | Value | Usage |
|-------|-------|-------|
| `brand` / `brand-hover` / `brand-pressed` | #8C1515 / #7A1212 / #651010 | `bg-brand`, `text-brand`, `border-brand` |
| `bg-secondary` | #FAFAFA | `bg-bg-secondary` |
| `bg-muted` | #F5F5F5 | `bg-bg-muted` |
| `text-secondary` | #374151 | `text-text-secondary` |
| `text-muted` | #6B7280 | `text-text-muted` |
| `border` | #E5E7EB | `border-border` |
| `divider` | #D1D5DB | `border-divider` |
| `text-hero` | 3.5rem | `text-hero` |
| `text-lead` | 1.375rem | `text-lead` |
| `text-caption` | 0.8125rem | `text-caption` |
| `spacing-128` | 32rem | `p-128`, `mt-128` |
| `spacing-160` | 40rem | `p-160`, `gap-160` |
| `container-content` | 72.5rem | `max-w-content` |

### Preferred default tokens (no config needed)

| Need | Token |
|------|-------|
| Primary bg (white) | `bg-white` |
| Primary text (#111827) | `text-neutral-900` |
| Container (1280px) | `max-w-7xl` |
| Reading width | `max-w-3xl` |
| Section spacing | `py-24` or `py-32` |
| Button radius (6px) | `rounded-md` |
| Card radius (8px) | `rounded-lg` |
| Body text (16px) | `text-base` |
| H1 (48px) | `text-5xl` |
| H2 (40px) | `text-4xl` |
| H3 (32px) | `text-3xl` |
| H4 (28px) | `text-2xl` |
| H5 (24px) | `text-2xl` |
| H6 (20px) | `text-xl` |
| Body large (18px) | `text-lg` |
| Small (14px) | `text-sm` |
| Label (12px) | `text-xs` |
| Button height (48px) | `h-12` |
| Input height (48px) | `h-12` |
| Card padding (32px) | `p-8` |

### Adding new tokens

If a value repeats across components:

1. Add it to the `@theme {}` block in `src/styles.css`
2. Use the `--<category>-<name>` convention (e.g. `--color-surface-raised`)
3. Reference it with the corresponding Tailwind utility (e.g. `bg-surface-raised`)

### Ban

- `style=` props with ad-hoc values
- Tailwind arbitrary values `[x]` in JSX
- Inline `px`/`rem` values outside of `@theme`
- Per-component CSS files or CSS modules — all design tokens live in `styles.css` @theme

## Code Quality

Small, reusable, semantic, accessible, typed, predictable components. Composition over monolithic. No unnecessary abstractions.

## Final Rule

If a choice makes the interface more exciting but less readable, trustworthy, or more distracting — reject it. Every decision should reinforce reading a premium academic publication, not a marketing site or SaaS product.
