# Patterns

Composed, cross-cutting solutions: layout, theming, the homepage variant system, icons, scroll
reveal, motion (and the reduced-motion contract), states, and robustness. Grounded in shipped
prototypes and shared modules at repo root + [`scripts/`](../../scripts/).

---

## Layout

- **Page scaffold:** `min-height:100vh`; max-width wrapper ~1180–1480px centered; hero often full
  viewport; section padding 44px desktop → 16–20px mobile.
- **Scroll anchors:** `scroll-margin-top: 92px` (clears sticky nav).
- **Grids:** `1fr 1fr`, `repeat(3/4/6, 1fr)`, `repeat(auto-fit, minmax(160px, 1fr))`.

### Breakpoints (px)

| Breakpoint | Effect |
|---|---|
| ≤520 | Hero clamp floor; multi-col → 1 col |
| ≤760 | AEGIS mobile layout (78vh stage; receipt bottom strip) |
| ≤860 | Desktop nav hidden; burger; 2-col → 1; TOC hidden |
| 861–1080 | 3-col → 2-col |
| ≥1181 | Section TOC rail visible |

---

## Theming

### Interactive (dark default)
`:root` = dark palette; `.light` on `#int-root` re-declares same `--bg/--fg/--ac/--line` names.
Toggle persists `localStorage['rba-int-dark']`.

### Case-study shell
`.cs` wrapper = light; `.cs.dark` = dark. Uses `--c-*` tokens (separate from Interactive `--bg`).
Toggle on `nav.top` icon button. Cursor reads `--c-accent`.

### Single-theme variants
Dossier (cream + classified red) and Retro (phosphor + VT323) do not share the Interactive toggle.

### CTOC
`data-theme="dark"` on `.app`; severity colors re-tint via rgba overlays.

### Minimalist
Isolated Figma-export tokens in `minimalist/styles.css` — do not inherit root `:root`.

---

## Homepage variants

Three interchangeable portfolio reads (`home-variants.js`):

| Variant | File | Tone |
|---|---|---|
| **Interactive** (primary) | `homepage-interactive.dc.html` | Analytical, teal, live demos |
| **Dossier** | `homepage-dossier.dc.html` | Classified case-file, cream, redaction |
| **Retro** | `homepage-retro.dc.html` | CRT terminal, phosphor green |

`localStorage['rb-home-variant']` + silent redirect. `index.html` → Interactive. About/Work shared.

---

## Icon pattern

**Material Symbols only** — subsetted per page:

```html
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:…" rel="stylesheet">
<span class="msi" aria-hidden="true">arrow_forward</span>
```

`.msi` class sets size/alignment. MUI Figma kit is source of truth for glyph names. Never Lucide,
never hand-authored SVG paths for UI chrome. Illustration SVGs (device icons, minimalist assets)
are exempt.

---

## Scroll reveal (`data-reveal`)

Case-study showcase pages: elements with `data-reveal` fade/slide in on scroll. Optional `data-d`
stagger delay. CSS-driven; respects reduced motion (opacity/transform snap to final). Used for
section headings, cards, and stat bands — not on critical navigation.

---

## Motion

Motion explains state change or directs attention — never decoration.

**Durations:** 150/250/350ms tokens; micro 0.12–0.22s; entrances 0.34–0.9s.

**Keyframe inventory:**
- **Hero:** `rise`, `fade-up`, `hero-hl-draw`, `clarity-focus`, `scrolldot`, `marquee`
- **Light ARchitect:** `cityFloat`, `cityWin`, `laPulse`, `laBeam`, `laScan`
- **Dossier:** `dossier-up`, `dossier-blink`
- **Retro:** `rt-pwr`, `rt-in`, `rt-flicker`, `rt-scan`, `rt-blink` (flicker/scan killed under PRM)
- **CTOC:** `pulse`, `pulse-red`, `highlight`, `fade`, `slidein`

**Modules:**
- `text-motion.js` — velocity drift, marquee counter-motion; early-return under PRM
- `page-transition.js` — isometric block mask; intro counter on first visit
- `scripts/a11y.js` — global animation ≈0ms + `scroll-behavior:auto` under PRM

### `prefers-reduced-motion` contract (required)

Every new animated surface must gate on it. Add `@media (prefers-reduced-motion: reduce)` or
early-return in JS. Retro CRT overlays use `display:none`; boot/power-on snap to final state.

Details: [`../motion/README.md`](../motion/README.md).

---

## State patterns

- **AEGIS:** attract → playing → game-over (+ modal pause)
- **Light ARchitect:** empty → fixtures placed → live recompute
- **Empty / loading / error:** never a blank frame — show what precedes and during failure
- **Longest content:** tables and labels hold max real value; `text-overflow: ellipsis` when bounded

---

## Robustness

- **Isolated init:** each enhancement in `try/catch`; missing nodes fail silently
- **Stage-anchored overlays:** in-stage modals `position:absolute` on positioned stage (ADR-004);
  body-level menu/transition use `fixed` deliberately
- **Focus:** skip link first; modal focus trap; `:focus-visible` on all controls
- **Persistence:** all `localStorage` wrapped; failure non-fatal
- **No build:** single-file HTML; only declared CDN deps (React on `.dc.html`, Google Fonts)

---

## DC runtime pattern (`.dc.html`)

Markup lives in `<x-dc>` template; [`support.js`](../../support.js) parses and renders with React
from unpkg CDN. Enables component-style authoring without a build step. Shared modules loaded
after render.
