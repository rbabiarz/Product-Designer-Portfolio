# Foundations

The visual primitives of the Product Designer Portfolio. Two layers:

1. **A shared foundational scale** — type, spacing, radius, shadow, transitions, and the brand
   color cards — defined in [`tokens.css`](../tokens.css) (Untitled-UI-derived, light-first).
   The SOC/CTOC dashboard skin in [`styles.css`](../styles.css) builds on it.
2. **Per-surface color palettes** layered on top, one per page family — declared inline in each
   prototype's `:root` / `.light`. The portable mirror of both layers is
   [`design-tokens.json`](../design-tokens.json) / [`tokens/`](../tokens/).

> Reference CSS custom properties (`var(--bg)`, `var(--ac2)`, `var(--spacing-lg)`); never
> hardcode a raw hex/px in component code.

---

## Color

### Foundational namespaces
- **`--color-*` / `--spacing-*` / `--rounded-*` / `--shadow-*`** — the Untitled-UI scale in
  `tokens.css`. Light-first (`--color-canvas:#fffcf5`, full gray ramp 50→900). Used by the
  case-study/dashboard pages.
- **`--bg/--fg/--ac/--line`** — the homepage/case-study surface palette, dark-first with a
  `.light` mirror (below).

### Surface palettes (one accent per screen, one color block per viewport)

| Surface | Canvas | Text | Accent | Use |
|---|---|---|---|---|
| **Interactive — dark** (default) | `--bg #070b12` → `--bg3 #121a28` | `--fg #e9eef7` / `--fg2 #8593a8` / `--fg3 #97a3b8` | `--ac #4ca88f` / `--ac2 #7dd3c0` | Primary homepage, About, Work, case studies |
| **Interactive — light** (`.light`) | `#fffcf5` → `#ebe6d6` | `#0a0a0a` / `#595959` / `#5e5e5e` | `#0d5350` / `#4ca88f` | Light "architect" mirror |
| **Dossier** | `#f4ead2` (cream) | `#0a0a0a` | `#b23a2e` (classified red) · `#1c6b39` status | "Classified case-file" homepage variant |
| **Retro** | `#040806` | `#6cf0a4` / bright `#cdffe2` / dim `#3f9e69` | `#6cf0a4` phosphor · `#ffb454` amber | "CRT terminal" homepage variant |
| **CTOC (SOC)** | `#fffefa` / dark `#0b0f14` | `--color-ink` | severity scale (below) | SOC/threat-ops dashboard |

Hairlines: `--line rgba(255,255,255,.08)` / `--line2 …,.15)` on dark; `rgba(0,0,0,.09 / .16)` on light.

### Brand color cards (`tokens.css`) — used sparingly
`pink #d63b75` · `teal #0d5350` · `lavender #8b6fd9` · `peach #ff9d66` · `ochre #d4a036` ·
`mint #4ca88f` · `coral #e64d3c`. Each ships a paired `--color-on-*` text color for AA contrast
(peach/ochre take ink `#0a0a0a`; the rest take white).

### Severity (CTOC only) — never hue alone
`critical #b91c1c` · `high #e64d3c` · `medium #d4a036` · `low #1570ef` · `resolved #15803d`.
Always paired with a square/label/icon and re-tinted for the dark dashboard theme.

> **Rule:** meaning never rides on hue alone, and the portfolio surfaces never use a saturated
> red/amber/stoplight-green *as status*. Coral `#e64d3c` is the strongest risk signal. The CTOC
> severity scale is the one domain-appropriate exception — and even there, color is paired with shape.

---

## Typography

**Families:** Inter (`--font-display`, headings), DM Sans (`--font-body`, prose),
JetBrains Mono (`--font-mono`, HUD/system labels), VT323 (retro CRT only).

**Display scale** (`tokens.css`, shrinks at ≤767px):

| Token | Size → mobile | Weight | Line-height | Tracking |
|---|---|---|---|---|
| display-xl | 72 → 36px | 500 | 1.25 | −1.44px |
| display-lg | 60 → 32px | 500 | 1.2 | −1.2px |
| display-md | 48 → 28px | 500 | 1.25 | −0.96px |
| display-sm | 36 → 24px | 500 | 1.22 | −0.72px |
| display-xs | 30px | 500 | 1.27 | 0 |

**Text scale:** text-xl 24 · lg 20 · md 18 · **sm 16 (body default)** · xs 14 · xxs 12px.

**Prototype heroes** use `clamp()` beyond the static scale: interactive hero
`clamp(40px, 7.4vw, 118px)`; retro VT323 `clamp(60px, 13vw, 168px)`.

**Conventions:** mono labels are UPPERCASE with `letter-spacing: 0.04–0.14em`; numeric readouts
use `font-variant-numeric: tabular-nums`.

---

## Spacing & layout

Base scale (`--spacing-*`): 2 · 4 · 8 · 12 · 16 · 20 · 24 · 32 · 48 · 64 · 96 · 128px, with a
`--spacing-section: 96px` rhythm. Section horizontal padding is typically `44px` (desktop),
collapsing to `~16–20px` on mobile. Common grids: `1fr 1fr`, `repeat(3,1fr)`, `repeat(4,1fr)`,
`repeat(6,1fr)` (KPI strip), and `repeat(auto-fit, minmax(160px,1fr))`. See
[`patterns.md`](./patterns.md) for breakpoints.

---

## Radius

Full scale (`--rounded-*`): 2 · 4 · 6 · 8 · 12 · 16 · 20 · 24 · 28px, plus `pill 9999px` and
`full 50%`. In practice: **pill (999px) for all CTAs**, `10–16px` for cards/stages/game panels,
`2–4px` for dense dashboard chips.

---

## Elevation

Light surfaces use the `--shadow-xs…3xl` ramp (`rgba(16,24,40,…)`). Dark surfaces use long, soft
shadows — e.g. cards/stages `0 30px 80px -40px rgba(0,0,0,0.8)`. Use elevation sparingly; one
raised layer per context.

---

## Motion tokens

Transitions: `--transition-fast 150ms` · `--transition-base 250ms` · `--transition-slow 350ms`
(all `ease`). Micro-interactions commonly run 0.12–0.22s; entrances 0.34–0.9s. Full motion
inventory and the `prefers-reduced-motion` contract live in [`patterns.md`](./patterns.md).

---

## Iconography

Lucide only — `<i data-lucide="name"></i>`. Never hand-author SVG paths. Icon-only controls
carry an `aria-label`.
