# Components

Inventory of reusable UI **actually shipped** across the portfolio. Implementations live
**inline** in each page (no build, no npm component library); this file is the contract.
Cross-cutting layout, theming, and motion: [`../patterns/patterns.md`](../patterns/patterns.md).

**Surfaces:** Interactive (`.dc.html` hub + homepage) · Case-study shell (`.cs` on `*-showcase.html`)
· CTOC (`styles.css`) · Dossier/Retro variants · Minimalist (`minimalist/styles.css`, separate tokens).

States: ● implemented · ○ n/a. Every interactive control exposes `:focus-visible`
(`outline: 2–3px solid` accent, `outline-offset: 2–3px`).

**Icons:** Material Symbols — `<span class="msi" aria-hidden="true">icon_name</span>`.

---

## Navigation & chrome

### Top nav — Interactive (`#int-nav`)
Sticky; RB logo box 34×34 r8 border `--line2`; `.nav-cm` links Inter 13/600 tracking 0.04em;
theme `<details class="int-switch">`; VIEW switcher; burger ≤860px. Height 72px (60px mobile).
Scrolled state: blurred/translucent background. Logo links `#top`.

### Top nav — Case-study shell (`nav.top`)
Sticky `.brand` wordmark; `.iconbtn` ghost buttons; `.burger` + `#mob` full-screen overlay ≤860px.
Uses `--c-*` tokens. Theme toggle adds `.cs.dark` on wrapper.

### Mobile menu
Full-viewport overlay `z-index:95`, ≤860px. Three-line → X morph (0.32s). Links are real `<a>`
tags (work without JS). `body.menu-open` toggles visibility. `aria-expanded` on trigger.

### VIEW switcher (`home-variants.js`)
Native `<details>/<summary>`; sheet min-width 252px lists Interactive / Dossier / Retro.
`data-home-variant` rows write `localStorage['rb-home-variant']`. Silent `location.replace()` on
load if saved variant ≠ current file.

### Theme toggle
40×40, border `--line` or `--c-b2`, r8. Material Symbols sun/moon glyph by mode.
Writes `localStorage['rba-int-dark']` (Interactive) or toggles `.cs.dark` (case studies).
`aria-label` required.

### Section TOC rail
Fixed right edge ≥1181px. Dot 10×2px; active widens to 22px `--ac`. Labels mono 10px uppercase on
hover. `scroll-margin-top: 92px` on targets. Case-study variant: `.toc`, `.dot`, `.lbl`.

### Footer / colophon
Footer: hairline `--line`, mono 11px links. **Colophon** (`colophon.js`): build-record strip —
deploy count, version, last-updated, toolchain. Regenerate via `python3 scripts/build-colophon.py`.

### Skip link
First focusable element (`scripts/a11y.js`): `.skip-link` → `#main` or `#top`.

---

## Actions

### Pill CTA (primary / secondary)
**All CTAs pill-shaped (999px).** Primary: filled `--ac` / `--c-accent`, mono 12–15/700, tracking
0.08em. Hover `translateY(-2px)` + soft shadow; active `translateY(1px)`. Secondary: 1.5px border,
transparent fill. Case-study: `.btn-primary`, `.btn-ghost`.

### Verb buttons (AEGIS rail)
Equal-flex, min-height 54px, r10. Color-coded top border (clear/hold/tag). Success flash teal;
error flash coral. Keys J/K/L; `#ag-live` `aria-live="polite"`.

### Dashboard buttons (CTOC `.btn`)
Mono 11px uppercase, r3. Variants: `--primary`, `--danger`, `--ghost`, `--xs`, `--active`.

### Icon nav (Minimalist)
`.icon-nav__link` with SVG assets from `assets/icon-*.svg`; text label beside icon in footer variant.

---

## Content blocks

### Project card / tile
Work coverflow: `<a>` aspect 3/2, r14, `--line2`, scale on focus. Case-study tiles: `.tile` with
`.tile__media`, `.tile__number`, `.tile__title`, `.tile__description`, `.tile__cue`.

### Case-study hero
`.sec-h` + `.lead` + `.eyebrow` + stat strip. Device collage optional. `.chip` / `.chips` tag rows.

### Stat / metric block
`.stat-strip` / `.results`: dark cells, mono `clamp(32–60px)` value, 10px uppercase label,
`tabular-nums`. Minimalist: `.stat-band`, `.metric`.

### Callout / pull quote
`.callout` on raised `--c-surface` or `--surface-raised`; r18; no stroke (fill-only separation).
`.callout__title` + body. Stack: `.callout-stack`.

### Screenshot frame
`.win` chrome bar + dots; `.shot` row with horizontal scroll; [`case-shot.css`](../../case-shot.css)
shadows. Heights fixed for mixed desktop/phone rows (`is-desktop` / `is-phone`).

### Spec / stakeholder table
2-col grid, r14, mono uppercase header, stacks ≤880px. CTOC: `.tbl` with sticky headers.

### Badges / eyebrows / chips
`.eyebrow`: mono 11px uppercase accent. `.chip`: pill border tag. `.ci-hl`: marker highlight on `<em>`.

### View key (Quick tour / Deep dive / Live demo)
Compact inline legend on homepages and work index; pill "Quick tour" accent + mono labels.

---

## Interactive embeds

### AEGIS Fusion Watch
Stage `min(70vh,620px)`, r16, `role="application"`. HUD · receipt · verb rail · state overlay ·
scoring modal (`role="dialog"`, stage-anchored per ADR-004). See [`../../docs/design-decisions.md`](../../docs/design-decisions.md).

### Light ARchitect scene
`.la-fx` draggable markers, isometric ground, telemetry HUD, `--la-*` sub-theme vars.

### Floor plan / mesh sims
`floor-plan-sim.js`, `mesh-sim.js` — inject dark-chrome interactive bands into showcase pages.

---

## Site-wide JS chrome

### Portfolio Concierge (`concierge.js`)
Deterministic chat retrieval over `search-index.js`. Floating trigger; section deep-links.
Regenerate index: `python3 scripts/build-search-index.py`.

### Custom cursor (`cursor.js`)
Reads `--ac` or `--c-accent`; disabled when reduced motion or coarse pointer.

### Cookie banner + analytics
`scripts/cookie-banner.js` before `scripts/analytics.js`. Consent-gated GA4. Never inline gtag.

### Page transition (`page-transition.js`)
Isometric block mask on navigation; first-visit intro counter.

### Text motion (`text-motion.js`)
Scroll velocity drift + marquee counter-motion; early-return under reduced motion.

---

## CTOC / SOC dashboard (`styles.css`)

Utilitarian skin on foundational tokens: `.topbar`, `.sidebar`, `.panel`, `.kpis`, `.sev` severity
pill, `.tag`, `.tbl`, `.kc` kill-chain, `.mitre`, `.map`, `.timeline`, `.drawer`, `.heat`, `.feed`.
`data-theme="dark"` re-tints all severity backgrounds. Severity always paired with square/label.

---

## Surface-specific

- **Dossier:** CONFIDENTIAL header, redacted text bars, VERIFIED stamp, case-file rows.
- **Retro:** CRT overlays (flicker/scan removed under reduced motion), VT323 prompt, DIR listing.
- **Minimalist:** Instrument Serif accent, `.case` featured card, `.work-group` grid — see
  [`../../minimalist/styles.css`](../../minimalist/styles.css).

> Reduced motion: retro CRT animation removed; AEGIS transitions gated; `scripts/a11y.js` zeroes
> global animation duration. See [`../patterns/patterns.md`](../patterns/patterns.md).
