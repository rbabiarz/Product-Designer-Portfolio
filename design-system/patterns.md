# Patterns

Composed, cross-cutting solutions: layout, theming, the homepage variant system, motion (and the
reduced-motion contract), states, and robustness. Grounded in the shipped prototypes and the shared
JS modules (`support.js`, `text-motion.js`, `page-transition.js`, `a11y.js`, `home-variants.js`).

---

## Layout

- **Page scaffold:** `min-height:100vh`, max-width wrapper (~1180–1480px) centered; hero often
  `min-height:100vh`, section padding `44px` desktop → `16–20px` mobile; section anchors carry
  `scroll-margin-top: 92px` so deep links clear the sticky nav.
- **Grids:** `1fr 1fr`, `repeat(3,1fr)`, `repeat(4,1fr)`, `repeat(6,1fr)` (KPI), and
  `repeat(auto-fit, minmax(160px,1fr))`.
- **Breakpoints (px):**
  - **≤520** — hero clamp floor; multi-col grids collapse to 1.
  - **≤760** — AEGIS game mobile layout (`#ag-stage` 78vh; receipt moves to a bottom strip).
  - **≤860** — desktop nav hidden / burger shown; 2-col → 1-col; section TOC hidden.
  - **861–1080** — 3-col grids step down to 2.
  - **≥1181** — section TOC rail appears.

---

## Theming (dark / light)

CSS-variable override, no duplicated styles: `:root` defines the **dark** palette; a `.light` class
on the root re-declares the same `--bg/--fg/--ac/--line` tokens. The nav theme toggle flips the class
and persists `localStorage['rba-int-dark']`; **dark is the default**. The Light Architect scene gets
its own `--la-*` set (light default, dark override under `#int-root:not(.light)`). Dossier and Retro
are single-theme surfaces with their own palettes.

---

## Homepage variants

Three interchangeable full reads of the same portfolio, swapped by the VIEW switcher
(`home-variants.js`):

| Variant | File | Tone |
|---|---|---|
| **Interactive** (primary) | `homepage-interactive.dc.html` | Analytical, teal-accented, live demos |
| **Dossier** | `homepage-dossier.dc.html` | Classified case-file — cream paper, red stamp, redaction |
| **Retro** | `homepage-retro.dc.html` | CRT terminal / "RB-OS" — phosphor green, `C:\>` prompt |

Selection writes `localStorage['rb-home-variant']`; on load, if the saved variant differs from the
current file, `home-variants.js` silently `location.replace()`s to it (preserving the hash). Case
studies, About, and Work are shared across variants. `index.html` redirects into Interactive, where
this logic takes over.

---

## Motion

Motion explains a state change or directs attention — never decoration. Tokens: 150/250/350ms
`ease`; micro-interactions 0.12–0.22s; entrances 0.34–0.9s.

**Keyframe inventory (by surface):**
- **Hero / global:** `rise` + `fade-up` (line-by-line hero entrance), `hero-hl-draw` (highlight
  underline scaleX, `cubic-bezier(.62,0,.34,1)`), `clarity-focus` (8s blur-in loop on a hero word),
  `scrolldot` (scroll cue), `marquee` (keyword loop with scroll counter-motion).
- **Isometric building / Light Architect:** `cityFloat`, `cityWin`, `cityBeacon`, `laPulse`,
  `laBeam`, `laScan`.
- **Dossier:** `dossier-up` (section entrance), `dossier-blink` (status dot).
- **Retro:** `rt-pwr` (VT323 power-on), `rt-in` (boot-log stagger), `rt-flicker` (phosphor),
  `rt-scan` (drifting beam), `rt-blink` (cursor).
- **CTOC:** `pulse` / `pulse-red` (live & critical dots), `highlight` (new feed item),
  `fade`/`slidein` (drawer).

**Scroll behaviour (`text-motion.js`):** an IntersectionObserver-style engine reveals headings on
entry (rise ~38px), adds velocity-aware drift (±22px) and skew (±2.4°), and counter-drifts the
marquee. Settles to `transform:none`. A `MutationObserver` re-registers new DOM.

**Page transitions (`page-transition.js`):** an isometric-block CSS mask grows/shrinks across
navigations (`cubic-bezier(.76,0,.24,1)`; entrance ~980ms, exit ~660ms); first visit shows a
one-time intro counter (~1650ms).

### `prefers-reduced-motion` contract (required)
Every motion path gates on it:
- `text-motion.js` and `page-transition.js` **early-return** / jump to final state.
- `a11y.js` injects a global rule forcing animation/transition durations to ~0 and `scroll-behavior:auto`.
- Per-file media queries kill AEGIS button transitions and **remove the retro CRT flicker/scan**
  (`display:none`), snapping boot/power-on to final state.
- Add `@media (prefers-reduced-motion: reduce)` to any new animated component.

---

## State patterns

Design every state, not just the happy path:
- **AEGIS state machine:** attract → playing → game-over, plus a paused state while the scoring
  modal is open. HUD/receipt opacity-gate per state.
- **Light Architect:** empty plate → place-fixtures hint → live recompute; degrades if imagery is absent.
- **Empty / loading / error:** show what precedes data, during, and on failure; never a blank frame.
- **Longest content:** labels, names, and tables must hold their longest real value (truncate with
  `text-overflow: ellipsis` where bounded).

---

## Robustness (embed- and failure-safe)

- **Isolated init:** each enhancement runs in its own `try/catch`; one failing init (canvas, missing
  node) must not abort the rest. Missing elements fail silently, the page still renders.
- **Overlays anchor to their stage:** in-stage overlays use `position:absolute` relative to a
  positioned stage rather than viewport `fixed`, so a transformed host ancestor can't push them
  off-screen (ADR-004). Body-level overlays (page transition, mobile menu) use `fixed` deliberately.
- **Focus management:** a skip link (`a11y.js`) is the first focusable element; `:focus-visible`
  rings (3px accent) on all controls; the scoring modal moves focus to its close button on open.
- **Persistence guards:** all `localStorage` access is wrapped; failure is non-fatal.
