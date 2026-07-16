# Design — Product Designer Portfolio

The complete design-system reference for Robert Babiarz's senior product-design portfolio: the
north star, principles, and **every token, style, component, and motion** actually shipped across
the self-contained `.html` / `.dc.html` prototypes (AEGIS, CTOC, Light ARchitect, DALI-2, CORE
Insights).

> **Source of truth.** Live values come from [`tokens.css`](./tokens.css) (foundational scale),
> [`styles.css`](./styles.css) (SOC/CTOC skin), and the per-surface `:root` / `.light` blocks inline
> in each prototype. [`design-tokens.json`](./design-tokens.json) + [`tokens/`](./tokens/) are a
> portable mirror. The split-by-concern version of this doc lives in
> [`design-system/`](./design-system/). **Reference `var(--…)` tokens — never hardcode a hex/px.**

## Contents
1. [North star & principles](#1--north-star--principles)
2. [Color](#2--color)
3. [Typography](#3--typography)
4. [Spacing, radius, elevation](#4--spacing-radius-elevation)
5. [Motion](#5--motion)
6. [Components](#6--components)
7. [Patterns](#7--patterns)
8. [Accessibility](#8--accessibility)
9. [Build & tokens](#9--build--tokens)

---

## 1 · North star & principles

> **Prove senior product-design judgment by *showing it working*, not asserting it.** Systems
> thinking, real states, accessible craft. Where the work is decision-support (AEGIS), the thesis
> carries through: the model brings receipts, the operator keeps the decision.

1. **Read the trace, not the number.** Show evidence and sources, not just a verdict.
2. **Systems, not screens.** Every value traces to a token; design the empty / loading / error /
   longest-content state, not just the happy path.
3. **One idea per view; one accent per screen.** If a screen needs a legend, it's doing too much.
4. **Meaning survives without color.** Never signal status by hue alone; no saturated
   red / amber / stoplight-green as status. Coral is the strongest risk signal.
5. **Accessible by default** — WCAG 2.2 AA / AODA (see `WCAG-2.2-AODA-AUDIT.md`).
6. **Motion with intent.** Animate to explain a state change; gate every animation on
   `prefers-reduced-motion`.
7. **Robust by construction.** Self-contained, no build; isolated inits; overlays anchored to their
   stage so they survive transformed host wrappers.

---

## 2 · Color

The system is **two layers**: a shared foundational palette/scale (`tokens.css`) and a color skin
layered per page family. One accent per screen; one color block per viewport; meaning never rides on
hue alone.

### 2.1 Surface palettes (per page family)

**Interactive** — primary homepage, About, Work, case studies. Dark default + `.light` "architect" mirror.

| Role | `:root` (dark) | `.light` |
|---|---|---|
| `--bg` canvas | `#070b12` | `#fffcf5` |
| `--bg2` surface | `#0c121e` | `#f7f2e6` |
| `--bg3` raised | `#121a28` | `#ebe6d6` |
| `--fg` text | `#e9eef7` | `#0a0a0a` |
| `--fg2` muted | `#8593a8` | `#595959` |
| `--fg3` subtle | `#97a3b8` | `#5e5e5e` |
| `--line` hairline | `rgba(255,255,255,.08)` | `rgba(0,0,0,.09)` |
| `--line2` strong | `rgba(255,255,255,.15)` | `rgba(0,0,0,.16)` |
| `--ac` accent | `#4ca88f` | `#0d5350` |
| `--ac2` accent bright | `#7dd3c0` | `#4ca88f` |
| `--grid` | `rgba(76,168,143,.045)` | `rgba(13,83,80,.05)` |

**Dossier** (classified case-file): bg `#f4ead2` · ink `#0a0a0a` · accent `#b23a2e` · status `#1c6b39`.
**Retro** (CRT terminal): bg `#040806` · phosphor `#6cf0a4` · bright `#cdffe2` · dim `#3f9e69` · amber `#ffb454`.

### 2.2 Foundational palette (`tokens.css`)

**Gray ramp:** `900 #101828` · `800 #1d2939` · `700 #344054` · `600 #475467` · `500 #667085` ·
`400 #98a2b3` · `300 #d0d5dd` · `200 #e4e7ec` · `100 #f2f4f7` · `50 #f9fafb`.

**Light surfaces:** canvas `#fffcf5` · surface-soft `#faf5e8` · surface-card `#f5f0e0` ·
surface-strong `#ebe6d6` · surface-dark `#1a2825` · surface-dark-elevated `#243532` · hairline `#d4d4d4`.

**Text:** ink `#0a0a0a` · body-strong `#1a1a1a` · body `#2a2a2a` · muted `#595959` ·
muted-soft `#636363` · on-primary/on-dark `#ffffff`.

### 2.3 Brand color cards (used sparingly, one block per viewport)

| Card | BG | On-text |
|---|---|---|
| pink | `#d63b75` | `#ffffff` |
| teal | `#0d5350` | `#ffffff` |
| lavender | `#8b6fd9` | `#ffffff` |
| peach | `#ff9d66` | `#0a0a0a` |
| ochre | `#d4a036` | `#0a0a0a` |
| mint | `#4ca88f` | `#ffffff` |
| coral | `#e64d3c` | `#ffffff` |

### 2.4 Status & severity

`tokens.css` defines Untitled-UI semantic colors (success `#15803d`, warning `#d97706`,
error `#dc2626`, info `#3b82f6`, each with `-bg`/`-text`). **Portfolio surfaces avoid these as
status** (no stoplight signaling). The **CTOC/SOC dashboard** is the one domain-appropriate place
that uses a severity scale — always paired with a square/label, re-tinted for dark:

| Severity | Color | Source token |
|---|---|---|
| critical | `#b91c1c` | `--sev-critical` |
| high | `#e64d3c` | brand-coral |
| medium | `#d4a036` | brand-ochre |
| low | `#1570ef` | primary-blue |
| resolved | `#15803d` | success |
| info | `#595959` | muted |

> **Rule:** coral `#e64d3c` is the strongest risk signal on portfolio surfaces. Pair every signal
> with text/shape/icon. The CTOC dark theme (`--data-theme="dark"`, canvas `#0b0f14`, ink `#f3f1ea`)
> re-declares every severity background.

---

## 3 · Typography

**Families:** Inter (`--font-display`, headings) · DM Sans (`--font-body`, prose) ·
JetBrains Mono (HUD/system labels; `tokens.css` default is `'SF Mono'`) · VT323 (retro CRT only).

**Display scale** (`tokens.css`, shrinks at ≤767px):

| Token | Size → mobile | Weight | Line-height | Tracking |
|---|---|---|---|---|
| display-xl | 72 → 36px | 500 | 1.25 | −1.44px |
| display-lg | 60 → 32px | 500 | 1.2 | −1.2px |
| display-md | 48 → 28px | 500 | 1.25 | −0.96px |
| display-sm | 36 → 24px | 500 | 1.22 | −0.72px |
| display-xs | 30px | 500 | 1.27 | 0 |

**Text scale:** text-xl 24/1.33 · lg 20/1.5 · md 18/1.56 · **sm 16/1.5 (body default)** ·
xs 14/1.43 · xxs 12/1.5.

**Prototype hero `clamp()`s:** interactive `clamp(40px, 7.4vw, 118px)`;
retro VT323 `clamp(60px, 13vw, 168px)`.

**Conventions:** mono labels are UPPERCASE, `letter-spacing 0.04–0.14em`; numeric readouts use
`font-variant-numeric: tabular-nums`; headings `letter-spacing −0.02 to −0.04em`.

---

## 4 · Spacing, radius, elevation

**Spacing** (`--spacing-*`): `none 0 · xxs 2 · xs 4 · sm 8 · md 12 · lg 16 · xl 20 · 2xl 24 ·
3xl 32 · 4xl 48 · 5xl 64 · 6xl 96 · 7xl 128px`, with `--spacing-section 96px`. Section H-padding
~`44px` desktop → `16–20px` mobile.

**Radius** (`--rounded-*`): `2 · 4 · 6 · 8 · 12 · 16 · 20 · 24 · 28px`, plus `pill 9999px`,
`full 50%`. In practice: **pill for all CTAs**, `10–16px` cards/stages, `2–4px` dense dashboard chips.

**Elevation.** Light ramp (`tokens.css`):

| Token | Value |
|---|---|
| xs | `0 1px 2px rgba(16,24,40,.05)` |
| sm | `0 1px 3px rgba(16,24,40,.1), 0 1px 2px rgba(16,24,40,.06)` |
| md | `0 4px 8px -2px rgba(16,24,40,.1), 0 2px 4px -2px rgba(16,24,40,.06)` |
| lg | `0 12px 16px -4px rgba(16,24,40,.08), 0 4px 6px -2px rgba(16,24,40,.03)` |
| xl | `0 20px 24px -4px rgba(16,24,40,.08), 0 8px 8px -4px rgba(16,24,40,.03)` |
| 2xl | `0 24px 48px -12px rgba(16,24,40,.18)` |
| 3xl | `0 32px 64px -12px rgba(16,24,40,.14)` |

Dark surfaces use long, soft shadows — e.g. cards/stages `0 30px 80px -40px rgba(0,0,0,.8)`. One
raised layer per context.

**Transitions:** `--transition-fast 150ms` · `--transition-base 250ms` · `--transition-slow 350ms`
(all `ease`). Micro-interactions 0.12–0.22s; entrances 0.34–0.9s.

**Icons:** Lucide only — `<i data-lucide="name"></i>`. Never hand-author SVG paths.

---

## 5 · Motion

Motion explains a state change or directs attention — never decoration.

**Keyframe inventory (by surface):**

| Surface | Keyframes |
|---|---|
| Hero / global | `rise`, `fade-up` (line-by-line entrance), `hero-hl-draw` (highlight underline, `cubic-bezier(.62,0,.34,1)`), `clarity-focus` (8s blur-in loop), `scrolldot`, `marquee` (+ scroll counter-motion), `hl-swipe`, `blink` |
| Isometric / Light ARchitect | `cityFloat`, `cityWin`, `cityBeacon`, `laPulse`, `laBeam`, `laScan` |
| Dossier | `dossier-up` (section entrance), `dossier-blink` (status dot) |
| Retro | `rt-pwr` (VT323 power-on), `rt-in` (boot stagger), `rt-flicker` (phosphor), `rt-scan` (drifting beam), `rt-blink` (cursor) |
| CTOC | `pulse` / `pulse-red` (live & critical dots), `highlight` (new feed item), `fade`, `slidein` (drawer) |

**Scroll engine (`text-motion.js`):** reveals headings on entry (rise ~38px), velocity-aware drift
(±22px) and skew (±2.4°), marquee counter-drift; settles to `transform:none`; `MutationObserver`
re-registers new DOM.

**Page transitions (`page-transition.js`):** isometric-block CSS mask grows/shrinks across
navigations (`cubic-bezier(.76,0,.24,1)`; entrance ~980ms, exit ~660ms); one-time first-visit intro
counter (~1650ms).

### `prefers-reduced-motion` contract (required)
- `text-motion.js` / `page-transition.js` early-return or jump to final state.
- `a11y.js` injects a global rule forcing animation/transition ≈0ms and `scroll-behavior:auto`.
- Per-file media queries kill AEGIS button transitions and **remove the retro CRT flicker/scan**
  (`display:none`), snapping boot/power-on to final state.
- **Add `@media (prefers-reduced-motion: reduce)` to every new animated component.**

---

## 6 · Components

Realized **inline** per page (no build, no component library). Every interactive element has a
visible `:focus-visible` ring (`outline 2–3px solid` accent, offset 2–3px).

### Navigation & chrome
- **Top nav / header** — sticky; logo (RB box 34×34, radius 8, border `--line2`), section links
  (Inter 13/600, tracking 0.04em), theme toggle, VIEW switcher, burger. Height **72px** (60 ≤860px);
  blurs on scroll. Logo links `#top`.
- **Mobile burger menu** — full-viewport overlay (`fixed; inset:0; z-index:95`) ≤860px; 3-line→X
  morph (0.32s); **real `<a>` links** with staggered fade-up; `aria-expanded` toggled.
- **VIEW switcher** — native `<details>/<summary>` sheet (min-width 252, `--bg2`, border `--line2`)
  listing Interactive/Dossier/Retro; each row `data-home-variant` → `localStorage['rb-home-variant']`.
- **Theme toggle** — 40×40, border `--line`, radius 8; sun/moon Lucide; writes
  `localStorage['rba-int-dark']`; `aria-label` present.
- **Section TOC rail** (≥1181px) — fixed right dots (10×2px `--fg3`); active widens to 22px, turns
  `--ac`; labels fade in on hover; `scroll-margin-top 92px`.
- **Footer** — top hairline, padding 28×44, flex wrap, mono 11px, links `--fg2`→`--fg`.
- **Scroll-progress bar** (About) — fixed top, 3px, `linear-gradient(90deg,--ac,--ac2)`, JS width.

### Actions
- **Pill CTA** — all CTAs pill (999px). Primary: filled accent, mono 12–15/700, tracking 0.08em,
  pad ~13–15×24–28; hover `translateY(-2px)` + accent shadow; active `translateY(1px)`;
  focus-visible accent ring. Secondary/ghost: 1.5px border, transparent, tinted hover.
- **Verb buttons** (AEGIS CLEAR/HOLD/TAG) — equal-flex, min-height 54px (60 mobile), radius 10,
  fill `rgba(12,18,28,.82)`, color-coded top border (blue/amber/red); success/error flash (teal/coral);
  keys J/K/L; outcomes via `#ag-live` (`aria-live="polite"`); `-webkit-tap-highlight-color:transparent`.
- **Dashboard `.btn`** (CTOC) — mono 11px uppercase, radius 3; `--primary`/`--danger`/`--ghost`/`--xs`/`--active`.

### Content blocks
- **Project card** (Work coverflow) — `<a>`, aspect 3/2, radius 14, border `--line2`, bg `--bg3`;
  center focused vs side (`data-state="side"`) scaled/rotated/blurred + veil; 0.62s `cubic-bezier(.2,.85,.25,1)`.
- **Case-study hero card** — device collage + chrome dots + floating live chip (`ci-float` 6s) + vignette.
- **Stat / metric block** — dark fill `#0b1016`, number mono `clamp(32–60px)`/500, label mono 10px uppercase, tabular nums.
- **Spec / stakeholder table** — 2-col grid (`0.34fr 0.66fr`), radius 14, hairline rows, mono header; stacks ≤880px.
- **Badges / eyebrows / chips** — eyebrow mono 11px uppercase tracking 0.14em accent; pulse-dot eyebrow
  (`ct-pulse`); tag chip pill mono 10.5px border `--line`; inline highlight `.ci-hl` (`ci-marker` sweep).

### AEGIS Fusion Watch (interactive classification game — all 3 homepages)
Stage `position:relative`, `height:min(70vh,620px)` (78vh mobile), radius 16, radial field,
`role="application" tabindex="0"`. Z-order: hud 4 · receipt 4–5 · rail 5 · overlay 6 · modal 200.
- **HUD rail** SCORE/COMBO/ACC/LIVES/BEST (mono 11px uppercase).
- **Receipt panel** (`#ag-receipt`) track id, AI assessment, confidence bar, source pips
  (`.cor`/`.con`/`.off`), dissent; `position:absolute` to stage (mobile → bottom strip), `pointer-events:none`.
- **Verb rail** (above) · **State overlay** (`#ag-screen`: attract / game-over).
- **Scoring modal** (`#ag-info`, `role="dialog" aria-modal="true"`) — **anchored to the stage with
  `position:absolute`**, not viewport-fixed, so it survives transformed host ancestors; stage framed
  into view on open (**ADR-004**); closes on ✕/Esc/backdrop.

### Light ARchitect (interactive photometric scene)
Draggable fixture markers (`.la-fx` 18×7, lime border, glow on `.on`/hover, 44×44 touch target,
focus ring); pill hint popup (`#la-hint` glass+blur, accent dot); isometric ground plane
(`rotateX(74deg)` + radial mask); floating telemetry HUD (`cityFloat`, `pointer-events:none`);
recalc button. Themed via `--la-*` (light default, dark under `#int-root:not(.light)`).

### CTOC / SOC dashboard (`styles.css`)
Utilitarian skin on the foundational tokens: `.panel`, `.kpis` strip, `.sev` severity pill, `.tag`,
`.tbl` tables (sticky mono headers, hover rows, tabular nums), `.kc` kill-chain, `.mitre` tactics
grid, `.map` asset graph (nodes/edges/pulse), `.timeline`, `.drawer` (slide-in detail), `.heat`
heatmap, `.bar-row`, `.feed` (new-item highlight), and a `data-theme="dark"` variant re-tinting all
severity. Color always paired with shape/label.

### Surface-specific
- **Dossier** — CONFIDENTIAL file header (red badge + blinking dot), Subject ID card (photo
  placeholder, offset hard shadow, rotated VERIFIED stamp), **redacted text** (black bar → hover reveal).
- **Retro** — CRT scanline/vignette/phosphor-flicker/drifting-scan overlays (z9000–9002), VT323
  power-on heading, boot log, `C:\>` prompt with blinking block cursor, DIR-style listing.

---

## 7 · Patterns

**Layout** — `min-height:100vh`; centered wrapper (~1180–1480px); hero often `100vh`; section anchors
`scroll-margin-top:92px`. Grids: `1fr 1fr`, `repeat(3,1fr)`, `repeat(4,1fr)`, `repeat(6,1fr)` (KPI),
`repeat(auto-fit,minmax(160px,1fr))`.

**Breakpoints (px):** **≤520** hero floor + grids→1 · **≤760** AEGIS mobile (stage 78vh, receipt→bottom)
· **≤860** nav→burger, 2-col→1, TOC hidden · **861–1080** 3-col→2 · **≥1181** TOC rail appears.

**Theming** — `:root` = dark; `.light` re-declares the same `--bg/--fg/--ac/--line`. Toggle persists
`localStorage['rba-int-dark']`; dark default. Light ARchitect has its own `--la-*` set.

**Homepage variants** — VIEW switcher swaps Interactive (primary) / Dossier / Retro; writes
`localStorage['rb-home-variant']`; on load `home-variants.js` silently `location.replace()`s to the
saved variant (preserving the hash). `index.html` redirects into Interactive.

**States** — AEGIS attract→playing→game-over (+paused with modal); Light ARchitect empty→hint→recompute;
always design empty/loading/error and the longest-content case (truncate where bounded).

**Robustness** — isolated `try/catch` inits (one failure can't cascade; missing nodes fail silently);
in-stage overlays use `position:absolute` to a positioned stage (not viewport `fixed`) so a transformed
host can't push them off-screen (ADR-004); skip link first; guarded `localStorage`.

---

## 8 · Accessibility

Target **WCAG 2.2 AA / AODA** (audit: `WCAG-2.2-AODA-AUDIT.md`).
- Text contrast ≥ 4.5:1 (≥ 3:1 large/UI). Dark `#e9eef7` on `#070b12` and the light mirror are both AA.
- Every control keyboard-reachable with a visible `:focus-visible` ring (3px accent). Games expose
  keys **and** on-screen buttons; a skip link (`a11y.js`) is the first focusable element.
- Hit targets ≥ 44×44px.
- `prefers-reduced-motion` respected everywhere (see §5).
- Meaning survives without color; label all controls; `aria-live` for score/state; meaningful alt text.

---

## 9 · Build & tokens

Self-contained `.html` / `.dc.html` — inline CSS/JS, only declared CDN deps (React, fonts), no build,
no server. `.dc.html` markup lives in `<x-dc>` and renders via `support.js`. Shared modules:
`support.js`, `home-variants.js`, `page-transition.js`, `text-motion.js`, `a11y.js`.

**Token sources:** [`tokens.css`](./tokens.css) (foundational scale) · [`styles.css`](./styles.css)
(CTOC skin) · per-page `:root`/`.light`. **Mirror:** [`design-tokens.json`](./design-tokens.json) +
[`tokens/`](./tokens/) (`primitives` → `semantic` → `themes/{dark,light}`). Modular docs:
[`design-system/`](./design-system/). Decisions: [`docs/design-decisions.md`](./docs/design-decisions.md).
