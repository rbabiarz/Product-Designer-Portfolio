# Components

Inventory of the reusable UI actually shipped across the prototypes, with variants, states, and
the tokens each uses. Components are realized **inline** in the page that uses them (no build,
no component library); this file documents their contract. Cross-cutting motion and layout live
in [`patterns.md`](./patterns.md).

States legend: ● implemented · ○ n/a. Every interactive element exposes a visible
`:focus-visible` ring (`outline: 2–3px solid` accent, `outline-offset: 2–3px`).

---

## Navigation & chrome

### Top nav / header
Sticky bar; logo (RB box, 34×34, radius 8, border `--line2`), section links, theme toggle, VIEW
switcher, mobile burger. Height **72px** (60px ≤860px). Links Inter 13/600, tracking 0.04em;
background goes blurred/translucent on scroll. Logo is a real link to `#top`.
States: default ● · hover ● · focus-visible ● · scrolled ●.

### Mobile burger menu
Full-viewport overlay (`position:fixed; inset:0; z-index:95`), shown ≤860px. Three-line → X morph
(`transform` on spans, 0.32s). Links are **real `<a>` tags** (work without JS), staggered fade-up
entrance. Closed = opacity 0 / visibility hidden / pointer-events none; open = `.menu-open`.
`aria-expanded` toggled on the trigger.

### VIEW switcher (homepage variant selector)
Native `<details>/<summary>`; opens a sheet (min-width 252px, `--bg2`, border `--line2`, soft
shadow) listing Interactive / Dossier / Retro. Each row has `data-home-variant`; selection writes
`localStorage['rb-home-variant']`. Mono 10.5px label. No custom ARIA needed (native disclosure).

### Theme toggle
40×40 button, border `--line`, radius 8; sun/moon Lucide glyph by mode. Writes
`localStorage['rba-int-dark']`. `aria-label` present; hover shifts border to `--line2`.

### Section TOC rail (desktop ≥1181px)
Fixed right-edge dot nav. Dot 10×2px `--fg3`; on rail-hover labels fade in (mono 10px, uppercase);
active dot widens to 22px and turns `--ac`, label `--ac`. `aria-label="Sections"`; links use
`scroll-margin-top: 92px`. Hidden on mobile.

### Footer
Top hairline `--line`, padding 28×44; flex space-between, wraps. Mono 11px; links `--fg2` → `--fg`
on hover (0.15s).

### Scroll-progress bar (About)
Fixed top, height 3px, `linear-gradient(90deg, --ac, --ac2)`; width set by JS, `transition: width .1s linear`.

---

## Actions

### Pill CTA (primary / secondary)
All CTAs are **pill-shaped (999px)**. Primary: filled accent (`--ac` / surface accent), mono
12–15/700, tracking 0.08em, padding ~13–15×24–28. Hover lifts (`translateY(-2px)` + soft accent
shadow); active `translateY(1px)`; focus-visible `outline 2px` accent, offset 3.
Secondary/ghost: 1.5px border, transparent fill, tinted hover.
States: default ● hover ● active ● focus-visible ● · disabled ○ (rare).

### Verb buttons (AEGIS rail — CLEAR / HOLD / TAG)
Equal-flex, min-height 54px (60 mobile), radius 10. Fill `rgba(12,18,28,.82)`, border
`rgba(255,255,255,.12)`. Color-coded top border (clear=blue, hold=amber, tag=red). Hover brightens;
active `translateY(1px)`; success flash `.ag-flash-ok` (teal), error flash `.ag-flash-bad` (coral);
focus-visible teal ring. `-webkit-tap-highlight-color: transparent`. Keys J/K/L; descriptive
`aria-label`s; outcomes announced via `#ag-live` (`aria-live="polite"`).

### Dashboard buttons (CTOC, `styles.css`)
`.btn` mono 11px uppercase, radius 3, with `--primary` (ink fill), `--danger` (critical fill),
`--ghost`, `--xs`, `--active` variants. Hover/focus contrast verified AA (see comments in
`styles.css`).

---

## Content blocks

### Project card (Work coverflow)
Clickable `<a>`, aspect 3/2, radius 14, border `--line2`, bg `--bg3`, big soft shadow. Center
(focused) = full scale/opacity; side (`data-state="side"`) = scaled/rotated/blurred with a veil
gradient. Transition 0.62s `cubic-bezier(.2,.85,.25,1)`. Badge hidden ≤560px.

### Case-study hero card (CORE Insights)
Device collage (browser chrome + phone), floating "live" chip (`ci-float` 6s), vignette. Desktop
uses absolute/perspective layout; mobile switches to a flex stack. Images carry alt text; the chip
is `aria-hidden`.

### Stat / metric block
Grid cells, dark fill `#0b1016`, centered. Number mono `clamp(32–60px)`/500; label mono 10px
uppercase, tracking 0.12em. Tabular numerals.

### Spec / stakeholder table (case studies)
2-col grid (`0.34fr 0.66fr` or `0.3fr 0.7fr`), radius 14, hairline row separators, mono uppercase
header. Stacks to 1 column ≤880px.

### Badges / eyebrows / chips
Section eyebrow: mono 11px uppercase, tracking 0.14em, accent color (e.g. `01 · Project Overview`).
Pulse-dot eyebrow (CTOC) adds a `ct-pulse` ring. Tag chip: pill, mono 10.5px, border `--line`.
Inline highlight (`.ci-hl`): hand-drawn marker sweep behind `<em>` (`ci-marker`, scaleX 0→1).

---

## AEGIS Fusion Watch (interactive classification game)

Embedded on all three homepages. Stage: `position:relative`, `height: min(70vh,620px)`
(78vh mobile), radius 16, radial-gradient field, `role="application" tabindex="0"` with a full
`aria-label`. Stacking: hud z4 · receipt z4–5 · rail z5 · state overlay z6 · info modal z200.

- **HUD rail** (top): SCORE / COMBO / ACC / LIVES / BEST, mono 11px uppercase; active values brighten.
- **Receipt panel** (`#ag-receipt`): track id, AI assessment, confidence bar, source pips
  (`.cor` correct / `.con` conflict / `.off` offline-stripe), dissent line. `position:absolute`
  to the stage (mobile: repositioned to a bottom strip). Opacity-gated; `pointer-events:none`.
- **Verb rail**: the CLEAR/HOLD/TAG buttons (above).
- **State overlay** (`#ag-screen`): attract / game-over; eyebrow + title + sub + pill start button.
- **Scoring info modal** (`#ag-info`): `role="dialog" aria-modal="true"`; **anchored to the stage
  with `position:absolute`** (not viewport-fixed) so it survives transformed host ancestors, and
  the stage is framed into view on open (see ADR-004). Closes via ✕, Esc, or backdrop click.

States: attract ● · playing ● · game-over ● · paused (modal open) ● · graceful no-canvas fallback ●.

---

## Light ARchitect (interactive photometric scene)

Draggable fixture markers (`.la-fx`, 18×7, lime border, glow on `.on`/hover; 44×44 touch target;
focus-visible ring). Pill hint popup (`#la-hint`, glass + blur, mono, accent dot), isometric ground
plane (`rotateX(74deg)` + radial mask), floating telemetry HUD labels (`cityFloat`, `pointer-events:none`),
recalc button. Themed via `--la-*` vars (light default; dark override under `#int-root:not(.light)`).

---

## CTOC / SOC dashboard (styles.css)

A utilitarian skin on the foundational tokens, with its own component set: `.panel` (head/body),
`.kpis` strip, `.sev` severity pill, `.tag`, `.tbl` data tables (sticky mono headers, hover rows,
tabular nums), `.kc` kill-chain stages, `.mitre` tactics grid, `.map` asset graph (nodes/edges/pulse),
`.timeline`, `.drawer` (slide-in detail), `.heat` heatmap, `.bar-row`, `.feed` (new-item highlight),
and a `data-theme="dark"` variant that re-tints every severity background. All severity is paired
with a square/label — never hue alone.

---

## Surface-specific components

- **Dossier:** CONFIDENTIAL file header (red badge + blinking status dot), Subject ID card (photo
  placeholder, offset hard shadow, rotated VERIFIED stamp), **redacted text** (black bar → reveals
  on hover), case-file list rows.
- **Retro:** CRT scanline/vignette/phosphor-flicker/drifting-scan overlays (z9000–9002), VT323
  power-on heading (`rt-pwr`), boot log, `C:\>` command prompt with blinking block cursor, DIR-style
  directory listing.

> Reduced-motion note: the retro CRT flicker and scan-beam are **removed** (`display:none`) under
> `prefers-reduced-motion`; the boot/power-on jumps to its final state. See [`patterns.md`](./patterns.md).
