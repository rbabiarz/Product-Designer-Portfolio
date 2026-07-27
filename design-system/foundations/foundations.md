# Foundations

The visual primitives of the Product Designer Portfolio. The system runs **three runtime layers**:

1. **Foundational scale** — type, spacing, radius, shadow, transitions, brand cards — in
   [`tokens.css`](../../tokens.css). The SOC/CTOC dashboard skin in [`styles.css`](../../styles.css)
   builds on it.
2. **Per-surface palettes** — declared inline in each page family (`:root` / `.light`, `.cs` /
   `.cs.dark`, or hardcoded Dossier/Retro values). Not imported from JSON at runtime.
3. **Portable mirror** — [`design-tokens.json`](../../design-tokens.json) and [`tokens/`](../../tokens/)
   document the same values for tooling; regenerate after token edits.

> Reference CSS custom properties (`var(--bg)`, `var(--ac2)`, `var(--spacing-lg)`); never
> hardcode a raw hex/px in component code.

A fourth isolated system lives under [`minimalist/`](../../minimalist/) (Figma-export tokens) —
documented separately; do not mix with root tokens.

---

## Color

### Foundational namespaces (`tokens.css`)

- **`--color-*`** — brand cards, gray ramp 50→900, canvas/surface, ink/body/muted, semantic
  success/warning/error/info (+ `-bg`/`-text` pairs).
- **`--spacing-*` / `--rounded-*` / `--shadow-*` / `--transition-*`** — layout and elevation scale.
- **`--font-display` / `--font-body` / `--font-mono`** — Inter, DM Sans, SF Mono stack.

Used directly by CTOC (`styles.css`) and referenced in docs. Case-study showcase pages use a
parallel `--c-*` vocabulary (below) rather than importing `tokens.css`.

### Interactive surface (`:root` / `.light` on `#int-root`)

Dark is default; `.light` re-declares the same token names.

| Token | Dark | Light (`.light`) |
|---|---|---|
| `--bg` / `--bg2` / `--bg3` | `#070b12` / `#0c121e` / `#121a28` | `#fffcf5` / `#f7f2e6` / `#ebe6d6` |
| `--fg` / `--fg2` / `--fg3` | `#e9eef7` / `#8593a8` / `#97a3b8` | `#0a0a0a` / `#595959` / `#5e5e5e` |
| `--line` / `--line2` | `rgba(255,255,255,.08/.15)` | `rgba(0,0,0,.09/.16)` |
| `--ac` / `--ac2` | `#4ca88f` / `#7dd3c0` | `#0d5350` / `#4ca88f` |
| `--grid` | `rgba(76,168,143,.045)` | `rgba(13,83,80,.05)` |

Persisted via `localStorage['rba-int-dark']`. Mirror: [`tokens/themes/dark.json`](../../tokens/themes/dark.json),
[`tokens/themes/light.json`](../../tokens/themes/light.json).

### Case-study shell (`.cs` / `.cs.dark` on showcase pages)

Separate from Interactive tokens — uses `--c-*` prefix:

| Token | Light (`.cs`) | Dark (`.cs.dark`) |
|---|---|---|
| `--c-bg` / `--c-bg2` | `#fffcf5` / `#faf6ec` | `#0b1016` / `#0e141b` |
| `--c-surface` / `--c-card` | `#ffffff` / `#f4efe3` | `#121a23` / `#151d26` |
| `--c-ink` / `--c-body` | `#0a0a0a` / `#534f48` | `#f3f1ea` / `#bcb6aa` |
| `--c-accent` | `#0d5350` | `#5fc2a8` |
| `--c-navy` | `#0F2A4A` | `#0a1c30` |
| `--c-b1…b5` | ink hairlines at 6–28% | white hairlines at 5–28% |

Optional per-page tokens (e.g. `--c-risk: #e64d3c` on DALI-2). Screenshot frames use shared
[`case-shot.css`](../../case-shot.css) shadow tokens.

### Homepage variants (single-theme)

| Surface | Canvas | Text | Accent |
|---|---|---|---|
| **Dossier** | `#f4ead2` cream | `#0a0a0a` | `#b23a2e` classified red · `#1c6b39` status |
| **Retro** | `#040806` | phosphor `#6cf0a4` / bright `#cdffe2` | `#6cf0a4` · amber `#ffb454` |

### CTOC / SOC (`styles.css` on `tokens.css`)

Light canvas `#fffefa`; dark via `.app[data-theme="dark"]` → `#0b0f14`. Severity scale
(domain exception — always paired with label/shape):

`critical #b91c1c` · `high #e64d3c` · `medium #d4a036` · `low #1570ef` · `resolved #15803d`.

### Brand color cards — use sparingly

`pink #d63b75` · `teal #0d5350` · `lavender #8b6fd9` · `peach #ff9d66` · `ochre #d4a036` ·
`mint #4ca88f` · `coral #e64d3c`. Each has `--color-on-*` for AA contrast.

> **Rule:** meaning never rides on hue alone. Portfolio surfaces never use saturated
> red/amber/stoplight-green *as status*. Coral is the strongest risk signal.

---

## Typography

**Families loaded per page:**

| Role | Family | Token / usage |
|---|---|---|
| Headings | Inter 400–800 | `--font-display`; also loaded on case-study pages |
| Prose | DM Sans 400–700 | `--font-body` |
| HUD / system labels | JetBrains Mono 400–700 | Loaded via Google Fonts; UPPERCASE + tracking |
| Token default mono | SF Mono stack | `--font-mono` in `tokens.css` |
| Retro terminal only | VT323 | Never load outside `homepage-retro.dc.html` |

**Display scale** (`tokens.css`, shrinks at ≤767px): xl 72→36 · lg 60→32 · md 48→28 · sm 36→24 · xs 30px.

**Text scale:** xl 24 · lg 20 · md 18 · **sm 16 (body default)** · xs 14 · xxs 12px.

**Hero fluid type:** interactive `clamp(40px, 7.4vw, 118px)`; retro VT323 `clamp(60px, 13vw, 168px)`.

**Conventions:** mono labels UPPERCASE, `letter-spacing: 0.04–0.22em`; readouts use `tabular-nums`.

---

## Spacing & layout

`--spacing-*`: 0 · 2 · 4 · 8 · 12 · 16 · 20 · 24 · 32 · 48 · 64 · 96 · 128px; `--spacing-section: 96px`.

Section padding: ~44px desktop → 16–20px mobile. Grids: `1fr 1fr`, `repeat(3/4/6, 1fr)`,
`repeat(auto-fit, minmax(160px, 1fr))`. Breakpoints in [`../patterns/patterns.md`](../patterns/patterns.md).

---

## Radius

`--rounded-*`: 2 · 4 · 6 · 8 · 12 · 16 · 20 · 24 · 28px · `pill 9999px` · `full 50%`.

In practice: **pill for all CTAs**; case-study cards **18px**; game stages **10–16px**; CTOC chips **3px**.

---

## Elevation

Light: `--shadow-xs…3xl` (`rgba(16,24,40,…)`). Dark cards/stages: long soft shadows
(`0 30px 80px -40px rgba(0,0,0,.8)`). One raised layer per context.

---

## Motion tokens

`--transition-fast 150ms` · `--transition-base 250ms` · `--transition-slow 350ms` (all `ease`).

Full inventory and `prefers-reduced-motion` contract: [`../motion/README.md`](../motion/README.md),
[`../patterns/patterns.md`](../patterns/patterns.md).

---

## Iconography

**Material Symbols** (MUI kit) — the only icon system on shipped pages:

```html
<span class="msi" aria-hidden="true">download</span>
```

Each page loads a subsetted Google Fonts link + `.msi` class in `<head>`. Never hand-author SVG
paths. Icon-only controls need `aria-label` on the button/link, not on the glyph span.

Case-study SVG assets (DALI device icons, minimalist exports) are **illustrations**, not the UI
icon system.
