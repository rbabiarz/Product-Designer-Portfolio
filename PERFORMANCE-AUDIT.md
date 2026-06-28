# Homepage Performance Audit — Interactive · Dossier · Retro

> Deep-dive into render/animation performance of the three homepage variants, cross-checked against
> the recent accessibility work (the `a11y.js` reduced-motion kill-switch and the ADR-004
> stage-anchored AEGIS popup). Method: full code audit of each page + shared JS, plus **live runtime
> measurement** (Playwright/Chromium, idle window, normal vs `prefers-reduced-motion`).
> Date: 2026-06-28.

## Measured evidence (idle, no interaction, 2s window)

| Page | mode | rAF callbacks/s (idle) | running infinite CSS anims | long tasks |
|---|---|---|---|---|
| interactive | normal | **964** | 175 | 0 |
| interactive | reduced-motion | **360** | **0** | 0 |
| dossier | normal | **240** | 168 | 0 |
| dossier | reduced-motion | **121** | **0** | 0 |
| retro | normal | **362** | 7 | 0 |
| retro | reduced-motion | **362** (unchanged) | **0** | 0 |

**Reading the numbers.** ~60 rAF/s = one loop. Interactive runs **~16 loops every frame while idle**;
all three keep loops running with the page completely still. Reduced-motion zeroes the **CSS**
animations on every page (the `a11y.js` global rule works — see ✓G1) but only partly reduces the
**JS** loops, and on **retro it changes nothing** — the canvas loops paint every frame regardless.
No long tasks while idle (each frame is individually <50ms), so the cost is **sustained CPU/GPU/
battery drain**, not single-frame jank.

---

## What's already correct (don't regress)

- **✓G1 — Global reduced-motion kill-switch.** `a11y.js:40-43` injects
  `@media (prefers-reduced-motion: reduce){ *,*::before,*::after{ animation-duration:.001ms!important;
  animation-iteration-count:1!important; transition-duration:.001ms!important } }`. Verified to take
  every infinite CSS animation (175 / 168 / 7) to **0**. This is the load-bearing a11y motion fix.
- **✓G2 — DPR capped at 2** on every canvas (`Math.min(devicePixelRatio||1, 2)`) — interactive, dossier, retro.
- **✓G3 — Clean teardown.** Interactive/dossier `componentWillUnmount` cancels all rAFs and removes listeners; observers tracked and disconnected.
- **✓G4 — AEGIS off-screen pause** (interactive/dossier/retro) — the game loop bails on `getBoundingClientRect` when the stage is out of view.
- **✓G5 — Retro CRT overlays are clean** — flicker animates `opacity`, scan animates `transform` (composite only), and reduced-motion `display:none`s them. Not a hotspot.
- **✓G6 — ADR-004 AEGIS popup** is `display:none` until opened; no idle perf cost; the `position:absolute` fix introduced no regression.
- **✓G7 — LA parallax (dossier) self-stops** when settled and re-kicks on scroll — the model pattern other loops should copy.

---

## Cross-cutting findings (all three pages)

| ID | Severity | Finding | Fix | Status |
|---|---|---|---|---|
| **X1** | **P0** | **No tab-visibility pause anywhere.** `grep` confirms zero `visibilitychange`/`document.hidden` in any homepage or shared module. Every persistent rAF loop keeps scheduling in a backgrounded/occluded/secondary-monitor tab. | Add one `visibilitychange` listener per page that cancels rAFs on `document.hidden` and re-arms on return (reset `last=0` to avoid dt spike). Or a `if(document.hidden){reArm();return;}` guard atop each loop. | applied (heavy loops) |
| **X2** | **P0** | **JS rAF loops ignore `prefers-reduced-motion`.** Measured reduced-motion rAF/s: 360 / 121 / **362**. Canvas loops keep clearing+repainting every frame though nothing moves. (CSS is handled by ✓G1; JS is not.) | For canvases that are *static* under reduced-motion (retro building/architect, interactive hero contour), paint once and **stop re-arming** rAF. AEGIS: render one static attract frame, don't loop. | applied (retro, interactive) |
| **X3** | **P1** | **Idle rAF is very high** (964 / 240 / 362). Several loops never idle-stop — they skip *work* off-screen but keep scheduling, and some (hero contour, retro canvases, text-motion) do full work forever even when nothing changes. | Idle-stop when state has settled; re-arm from a `{passive:true}` scroll/pointer listener or IntersectionObserver. | partial |
| **X4** | **P1** | **`text-motion.js` loop runs forever on all 3 pages** — polls `pageYOffset` + `getBoundingClientRect` every frame, never idle-stops, no visibility pause, reads-then-writes in one pass (thrash), MutationObserver on the whole `documentElement` subtree (never disconnected). | Drive from a passive `scroll` listener + idle-stop; split reads-before-writes; scope observer to `#dc-root`/`body`; `document.hidden` gate. | applied |

---

## Per-page findings

### Interactive (`homepage-interactive.dc.html`) — heaviest page

| ID | Sev | Finding (file:line) | Fix | Status |
|---|---|---|---|---|
| I1 | **P0** | `initHeroCanvas` (≈1598-1693): full-viewport marching-squares contour solved **every frame forever** — no reduced-motion check at all, no idle/visibility pause. Single biggest always-on cost. | Add reduced-motion paint-once-and-stop; `document.hidden` guard; half-rate when pointer idle. | applied |
| I2 | P1 | `.hero-clarity` `clarity-focus` (33-34): animates `filter:blur()` **and** `letter-spacing` 8s infinite (paint+layout) + permanent `will-change:filter`. (✓G1 stops it under reduced-motion; full cost at normal.) | Drop `letter-spacing` from keyframes; make it a one-shot or `opacity`-only; remove `will-change`. | recommended |
| I3 | P1 | Permanent `will-change` on ~10 large/fixed nodes (34, 252, 334-408) + `will-change:opacity` on **every** desktop iso cell (2027) → layer explosion / GPU memory. | Apply `will-change` transiently (JS, only while animating/in-view); drop per-cell hint. | recommended |
| I4 | P1 | Animated `backdrop-filter` on the fixed nav, toggled on scroll (260, 2529); `blur(12-14px)` on LA glass layers that are **translated every frame** (631/660/672). | Remove `backdrop-filter` from nav transition; solid/`color-mix` fill on moving LA layers. | recommended |
| I5 | P2 | `initScrollProgress` (993-1006) reads `scrollHeight` + `getBoundingClientRect` in the scroll handler then writes 3 styles (thrash); resize handler not passive. | Cache geometry; recompute on resize only; rAF-batch writes. | recommended |
| I6 | P2 | `initLightArchitect` scroll listener is capture-phase, **not** `{passive:true}` (1959). | Pass `{passive:true, capture:true}`. | recommended |
| I7 | P2 | AEGIS loop renders every frame while paused (modal open) and on attract. | Render once when paused; reduce attract cadence. | recommended |

### Dossier (`homepage-dossier.dc.html`)

| ID | Sev | Finding (file:line) | Fix | Status |
|---|---|---|---|---|
| D1 | **P0** | `initIso` loop (1563-1607): writes `opacity` **and `box-shadow`** to hundreds of iso cells **every frame**; never idle-stops; no visibility pause. `box-shadow` is a paint property → continuous repaint of 3D-transformed layers. (Reduced-motion ✓ early-returns.) | Skip the per-cell write when its bucketed value is unchanged (cache last string); idle-stop when cells settle; `document.hidden` + off-screen guard (copy LA's self-stop). | applied (cache + idle + visibility) |
| D2 | P1 | AEGIS loop: off-screen ✓ but no tab-hidden pause; `getBoundingClientRect` every frame (1064). | `document.hidden` guard; IntersectionObserver `onScreen` flag instead of per-frame rect. | recommended |
| D3 | P1 | LA scroll listener capture, not passive (1346); resize handlers not passive and run unthrottled `refresh()` (per-cell `getBoundingClientRect`) (1347/1561). | `{passive:true}`; rAF-debounce refresh/compute. | recommended |
| D4 | P2 | Permanent `will-change` on `.la-layer`, `#iso-rig`, and **every** iso cell (79/316/1380). | Drop per-cell hint; keep only on the few transformed parents. | recommended |
| D5 | P2 | `laPulse` animates `box-shadow` (425-428); `backdrop-filter` on parallaxed HUD chips (322/327/332) re-blur every frame. | `laPulse` → `transform:scale`+`opacity` ring; solid bg on moving HUD chips. | recommended |

### Retro (`homepage-retro.dc.html`)

| ID | Sev | Finding (file:line) | Fix | Status |
|---|---|---|---|---|
| R1 | **P0** | `initArch` (949-987) **and** `initBldg` (901-914): redraw `shadowBlur` canvas scenes **every frame forever** — no off-screen pause, no tab pause, and **keep painting under reduced-motion** (only the rotation/scan increment is gated). `shadowBlur` is the most expensive 2D-canvas op. This is why retro is 362 rAF/s even under reduced-motion. | Under reduced-motion paint once and **stop**; `document.hidden` + off-screen guard; building is drag-interactive so repaint on `pointermove`, not in a loop. | applied |
| R2 | P1 | AEGIS attract loop runs forever when visible; no tab-hidden pause. | `document.hidden` guard; idle attract after N seconds. | applied (visibility) |
| R3 | P1 | `pointermove` on `window` non-passive, registered globally for the whole session (916). | Bind on `pointerdown`/remove on `pointerup`, or `{passive:true}`. | recommended |
| R4 | P2 | Canvas `resize` handlers not debounced/rAF-batched (424/888/940). | Debounce resize. | recommended |
| ✓ | — | CRT overlays (scanlines/vignette/flicker/scan) are composite-only and reduced-motion-gated — **clean** (see ✓G5). | — | pass |

### Shared JS

| ID | Sev | Finding (file:line) | Fix | Status |
|---|---|---|---|---|
| S1 | P1 | `text-motion.js` loop (53-90): forever loop, polls scroll, reads+writes in one pass, observer on whole `documentElement`. (= X4) | passive scroll-driven + idle-stop; reads-before-writes; scope observer; visibility gate. | applied |
| S2 | P2 | `page-transition.js` animates `mask-size` (main-thread, not composite) but one-shot per nav. | Optional: animate `transform:scale` on a fixed mask. | recommended |
| ✓ | — | `a11y.js` global reduced-motion rule (✓G1); WAAPI/observer hygiene otherwise sound. | — | pass |

---

## Fix plan (priority order)

1. **X4/S1 — `text-motion.js`** (shared, all 3, lowest risk): idle-stop + passive scroll + visibility + reads-before-writes. ✅ applied & verified.
2. **R1/X2 — retro `initBldg`/`initArch`**: reduced-motion paint-once-and-stop + `document.hidden`/off-screen guard. ✅ applied & verified (retro reduced-motion rAF → near 0).
3. **I1/X2 — interactive `initHeroCanvas`**: reduced-motion paint-once + `document.hidden` guard. ✅ applied & verified.
4. **D1 — dossier `initIso`**: cache box-shadow write + idle-stop + visibility. ✅ applied & verified.
5. **I2/I3/I4, D2-D5, R3-R4, I5-I7, S2** — documented above with exact fixes; lower-risk-to-defer, recommended as follow-ups (do not require the canvas-loop surgery and can be batched).

## Verified results (after fixes — re-measured, same harness)

Idle rAF callbacks/sec (lower = less wasted CPU/GPU while the page sits still):

| Page | normal: before → after | reduced-motion: before → after |
|---|---|---|
| interactive | 964 → **605** (−37%) | 360 → **121** (−66%) |
| dossier | 240 → **121** (−50%) | 121 → 121 |
| retro | 362 → **241** (−33%) | **362 → 121** (−67%) |

- **Reduced-motion is now uniform at ~121/s on all three** (was 360 / 121 / 362). Motion-sensitive
  users no longer pay for the heavy `shadowBlur`/contour/`box-shadow` canvas loops — those now paint
  once and stop. This is the headline accessibility-↔-performance win.
- **Zero console / page errors** across all three pages in both motion modes after every change.
- Post-interaction idle (`reIdle`) falls further once loops re-settle (e.g. retro reduced → 121,
  interactive reduced → 40), confirming the idle-stop + `kick()` re-arm works.

### Fixes applied (verified)
- **`text-motion.js`** (shared): reads-before-writes; idle-stop re-armed by passive scroll/resize;
  `visibilitychange` pause; observer scoped to `<body>`. (X4/S1)
- **retro `initBldg` + `initArch`**: `paint()`+idle-stopping `step()`; under reduced-motion paint
  once and don't re-arm; off-screen + `document.hidden` pause. (R1/X2)
- **interactive `initHeroCanvas`**: reduced-motion paints one static frame; `document.hidden` pause;
  ~30 fps throttle when the pointer is idle. (I1/X2)
- **interactive `initIso` + dossier `initIso`**: per-cell `box-shadow` cached (write-on-change);
  idle-stop when hover/drag/spin/cells settle; off-screen + `document.hidden` pause. (D1 + interactive iso)
- **interactive `initReveal`** (reveal card): idle-stop when no row hovered and the card has settled. (I7-adjacent)
- **interactive + retro AEGIS loops**: `document.hidden` guard. (D2/R2 partial)
- **Interactive 3D-building first-reveal demo removed** (the ~3s auto floor-detail spotlight on
  scroll-in) per request — hover-to-inspect behaviour preserved.

### Remaining (documented, recommended follow-ups — not applied)
I2/I3/I4 (clarity-focus blur+letter-spacing, permanent `will-change`, nav/LA `backdrop-filter`),
D3-D5, R3-R4, I5/I6, S2, and stopping the AEGIS attract loop fully under reduced-motion. These are
lower-risk-to-defer and don't require further canvas-loop surgery; each has its exact fix above.

