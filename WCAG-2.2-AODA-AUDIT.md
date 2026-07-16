# WCAG 2.2 AA & AODA Accessibility Audit
**Site:** Robert Babiarz — Defence / Product-Design Portfolio
**Date:** 2026-06-27
**Pages audited:** 27 (12 `.dc.html` + 15 `.html`)
**Tooling:** axe-core 4.10.2 (headless Chrome, cache-disabled, same-origin iframes traversed) · static source analysis · manual review

---

## 1. Executive summary

| Standard | Technical reference | Verdict |
|---|---|---|
| **AODA** (Ontario IASR, Info & Comms Standard) | **WCAG 2.0 Level AA** | **Substantially conformant on primary pages; not fully conformant site-wide** — open items: 2 pages missing `lang`, contrast on the GIMS prototype + 1 case-study card, an unlabeled `<select>`. |
| **WCAG 2.2 Level AA** | WCAG 2.2 (Oct 2023) | **Not fully conformant** — additionally: dragging-movements (2.5.7), target-size (2.5.8), reflow (1.4.10), keyboard operability of two interactive widgets (2.1.1). |

**Automated result:** **23 of 27 pages pass** the WCAG 2.2 A+AA automated scan with **zero** violations. 17 automated issues remain, concentrated on **4 pages**. The bulk of the site's earlier automated debt (contrast, titles, target-size, keyboard-scrollable regions, reduced-motion) was remediated earlier in this engagement.

**The honest caveat:** automated tooling reliably catches only ~30–50% of WCAG criteria. A "pass" on the axe scan is necessary, not sufficient. The manual findings in §4 (keyboard, dragging, canvas semantics, reflow) are the load-bearing gaps and do **not** show up in the automated count.

---

## 2. Method & coverage

- **Automated:** axe-core 4.10.2 run on each page at 1440×1300, network cache disabled, tags `wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22a, wcag22aa`. React/Babel demo pages given 3 s to hydrate; render confirmed (non-blank) before scanning.
- **Static analysis:** every page's source scanned for `lang`, viewport/reflow lock, skip links, focus-removal (`outline:none`), landmark elements, `<iframe>` titles, and `<img>` alt.
- **Manual:** keyboard operation, drag alternatives, single-key-shortcut scoping, motion/`prefers-reduced-motion`, and canvas/AT exposure reviewed by reading source and driving the pages.
- **Not covered (recommend human/AT pass):** real screen-reader walkthrough (NVDA/VoiceOver), 200% zoom + 400% reflow on every page, text-spacing override, and cognitive-load review.

---

## 3. Conformance by WCAG 2.2 success criterion

Legend — ✅ Pass · ⚠️ Partial / needs review · ❌ Fail · ➖ Not applicable · 🆕 new in 2.2

### Perceivable
| SC | Level | Status | Notes |
|---|---|---|---|
| 1.1.1 Non-text Content | A | ⚠️ | `<img>` mostly have alt; **1 stray image missing alt** (enterprise-ai.dc.html). Canvas demos (games, 3D building, heat-map) have **no text alternative** for AT. |
| 1.2.1–1.2.5 Time-based media | A/AA | ➖ | No real audio/video. The "fintech walkthrough" is a CSS/JS animation, not media. |
| 1.3.1 Info & Relationships | A | ✅ | `dt`/`dd` now wrapped in `<dl>` (was failing on demo pages). Headings/lists semantic. |
| 1.3.2 Meaningful Sequence | A | ✅ | DOM order matches visual order. |
| 1.3.4 Orientation | AA | ✅ | No orientation lock. |
| 1.3.5 Identify Input Purpose | AA | ➖ | No personal-data input fields. |
| 1.4.1 Use of Color | A | ✅ | Affiliation/severity carried by **glyph + text**, not hue alone. |
| 1.4.3 Contrast (Minimum) | AA | ❌ | **Open:** aegis-gims & aegis-gims-standalone (6 each: `#5f726c`/`#727c79` on `#16211f`, 3.2–3.8); dali-2.dc.html (1: `#6e6a60` on card `#e7e4df`, 4.25). |
| 1.4.4 Resize Text | AA | ⚠️ | Fails where viewport is width-locked (see 1.4.10). |
| 1.4.5 Images of Text | AA | ✅ | Live text throughout. |
| 1.4.10 Reflow | AA | ❌ | **ctoc-dashboard.html declares `<meta viewport content="width=1440">`** → forced horizontal scroll on narrow screens. aegis-di-prototype & aegis-gims are desktop-grid dashboards likely to 2-D-scroll at 320 px. |
| 1.4.11 Non-text Contrast | AA | ⚠️ | UI-component/graphic contrast (focus rings, chart strokes, heat-map cells) not exhaustively verified. |
| 1.4.12 Text Spacing | AA | ⚠️ | No obvious clipping; not formally tested with the 1.5×/2× override. |
| 1.4.13 Content on Hover or Focus | AA | ⚠️ | TOC labels reveal on hover; game info popup. Verify dismissible + hoverable + persistent. |

### Operable
| SC | Level | Status | Notes |
|---|---|---|---|
| 2.1.1 Keyboard | A | ❌ | **Light ARchitect** planner (add/move/remove luminaires) and the **3-D building** rotation have **no keyboard path** (no `tabindex`/key handlers/`role`). AEGIS games **are** keyboard-operable; Hot-Desking desks are real `<button>`s. |
| 2.1.2 No Keyboard Trap | A | ✅ | — |
| 2.1.4 Character Key Shortcuts | AA | ✅ | Game `j/k/l` keys are bound to the **focused game stage only** (`this.on(stage,'keydown')`), satisfying the focus-scoped exception. |
| 2.2.1 Timing Adjustable | A | ✅ | Game timing is essential to the activity (exception applies). |
| 2.2.2 Pause, Stop, Hide | A | ⚠️ | Auto-motion (retro CRT flicker/scan, parallax, auto-playing fintech walkthrough) has **no explicit pause control** for users who have **not** set reduced-motion. |
| 2.3.1 Three Flashes | A | ⚠️ | Retro phosphor flicker (~5.5 Hz) is very low-contrast (likely sub-threshold) and is now disabled under `prefers-reduced-motion`; recommend a formal flash-analysis to confirm. |
| 2.4.1 Bypass Blocks | A | ⚠️ | **No skip link and no `<main>` landmark on any page** (0/27). Most pages have `<nav>` + headings (partial mitigation), but add skip-to-content + `<main>`. |
| 2.4.2 Page Titled | A | ✅ | All 27 pages now have a `<title>` (two were added this engagement). |
| 2.4.3 Focus Order | A | ✅ | — |
| 2.4.4 Link Purpose (In Context) | A | ✅ | — |
| 2.4.5 Multiple Ways | AA | ✅ | Global nav + in-page TOC on case studies. |
| 2.4.6 Headings and Labels | AA | ✅ | — |
| 2.4.7 Focus Visible | AA | ⚠️ | Homepages use `:focus-visible`. **aegis-gims / -standalone set `outline:none`** without a clear replacement — verify a visible indicator remains. |
| 2.4.11 Focus Not Obscured (Min) | AA 🆕 | ⚠️ | Sticky top navs could overlap a focused control when tabbing; not verified per-page. |
| 2.5.1 Pointer Gestures | A | ✅ | Interactions are single-pointer (no path/multipoint required). |
| 2.5.2 Pointer Cancellation | A | ✅ | — |
| 2.5.3 Label in Name | A | ✅ | — |
| 2.5.7 Dragging Movements | AA 🆕 | ❌ | **Light ARchitect** repositioning is **drag-only** with no single-pointer alternative (add-by-click exists; move/reposition does not). |
| 2.5.8 Target Size (Minimum) | AA 🆕 | ❌ | **Open:** aegis-di-prototype LAYERS checkboxes render <24 px. (Case-study TOC links were fixed this engagement.) |

### Understandable
| SC | Level | Status | Notes |
|---|---|---|---|
| 3.1.1 Language of Page | A | ❌ | **`<html lang>` missing on 2 pages:** ctoc-case-study.dc.html, homepage-retro.dc.html. |
| 3.1.2 Language of Parts | AA | ✅ | English throughout. |
| 3.2.1 / 3.2.2 On Focus / On Input | A | ✅ | No context change on focus/input. |
| 3.2.3 / 3.2.4 Consistent Nav / ID | AA | ✅ | — |
| 3.2.6 Consistent Help | A 🆕 | ➖ | No persistent help mechanism. |
| 3.3.1–3.3.4 Forms / errors | A/AA | ➖ | No real form-submission/validation flows. |
| 3.3.2 Labels or Instructions | A | ⚠️ | GIMS `<select>` has no label (see 4.1.2). |
| 3.3.7 Redundant Entry | A 🆕 | ➖ | — |
| 3.3.8 Accessible Authentication (Min) | AA 🆕 | ➖ | No authentication. |

### Robust
| SC | Level | Status | Notes |
|---|---|---|---|
| 4.1.2 Name, Role, Value | A | ❌ | **aegis-gims `<select>` has no accessible name** (axe *critical* `select-name`). Canvas widgets expose limited role/value to AT. Most other controls now named. |
| 4.1.3 Status Messages | AA | ⚠️ | AEGIS game uses `aria-live`; Light-Architect summary & Hot-Desking updates likely lack a live region. |

*(4.1.1 Parsing was removed in WCAG 2.2.)*

---

## 4. Findings & remediation — by priority

### P0 — Blocks AODA / WCAG 2.0 AA (fix first)
1. **Unlabeled `<select>` — `aegis-gims.html`, `aegis-gims-standalone.html`** (4.1.2, *critical*). Add `aria-label` (or a `<label>`).
2. **`<html lang>` missing — ctoc-case-study.dc.html, homepage-retro.dc.html** (3.1.1). Add `lang="en"`.
3. **Contrast — aegis-gims ×2 (12 instances) + dali-2.dc.html (1)** (1.4.3). Darken `#5f726c`/`#727c79` on `#16211f`; nudge `#6e6a60`→~`#646058` on the `#e7e4df` card.

### P1 — WCAG 2.2 AA (new criteria) + reflow
4. **Reflow — ctoc-dashboard.html** (1.4.10). Remove `width=1440`; use `width=device-width`. (Dense dashboard may need a responsive/scroll-container pass or a documented "desktop-only demo" notice.)
5. **Target size — aegis-di-prototype LAYERS checkboxes** (2.5.8). Enlarge hit area to ≥24×24 px.
6. **Dragging movements — Light ARchitect** (2.5.7) **and keyboard — Light ARchitect + 3-D building** (2.1.1). Add a single-pointer/keyboard alternative: arrow-key nudge + "Add light / Remove" buttons; arrow-key rotate for the building. *(Single fix closes both 2.5.7 and 2.1.1 for this widget.)*

### P2 — Structural & best-practice
7. **Skip link + `<main>` landmark — site-wide** (2.4.1). Add a visually-hidden "Skip to content" link and wrap primary content in `<main id="main">`.
8. **Focus indicator — aegis-gims** (2.4.7). Ensure `outline:none` is paired with a visible `:focus-visible` style.
9. **Pause control for auto-motion** (2.2.2) — fintech walkthrough autoplay + retro CRT for non-reduced-motion users.
10. **Canvas alternatives** (1.1.1 / 4.1.2 / 4.1.3) — add `aria-label`/off-screen text summaries and `aria-live` to the game/building/heat-map/Hot-Desking widgets.
11. **`<img>` alt — enterprise-ai.dc.html** (1.1.1) — supply alt text.

### Latent (not auto-flagged — single rendered state only)
- **aegis-di-prototype secondary screens** (Triage, Entity, Assessment…): the global chip/violet/CSS fixes already apply, but a few per-screen `div→dl` and inline timestamp colors will surface the same `dlitem`/contrast issues if a reviewer navigates into them.

---

## 5. Per-page status (automated WCAG 2.2 A+AA)

| Page | Result |
|---|---|
| about.dc.html | ✅ clean |
| aegis-di.dc.html | ✅ clean |
| aegis-di-prototype.html | ❌ target-size ×2 |
| aegis-gims.html | ❌ contrast ×6, select-name ×1 |
| aegis-gims-standalone.html | ❌ contrast ×6, select-name ×1 |
| aegis-showcase.html | ✅ clean |
| core-insights.dc.html | ✅ clean |
| core-insights-showcase.html | ✅ clean |
| ctoc-case-study.dc.html | ✅ clean (but `lang` missing — §4.2) |
| ctoc-dashboard.html | ✅ clean (but reflow lock — §4.4) |
| ctoc-showcase.html | ✅ clean |
| dali-2.dc.html | ❌ contrast ×1 |
| dali-2-showcase.html | ✅ clean |
| enterprise-ai.dc.html | ✅ clean (1 `<img>` alt — §4.11) |
| enterprise-ai-showcase.html | ✅ clean |
| fintech-walkthrough.html | ✅ clean |
| goals-driven-fintech.html | ✅ clean |
| goals-driven-fintech-showcase.html | ✅ clean |
| homepage-dossier.dc.html | ✅ clean |
| homepage-interactive.dc.html | ✅ clean |
| homepage-retro.dc.html | ✅ clean (but `lang` missing — §4.2) |
| index.html | ✅ clean |
| partitioning.dc.html | ✅ clean |
| partitioning-showcase.html | ✅ clean |
| smart-lighting.dc.html | ✅ clean |
| smart-lighting-showcase.html | ✅ clean |
| work.dc.html | ✅ clean |

**Automated totals:** 17 violations · 4 pages affected · 23/27 pages clean.

---

## 6. Bottom line
The portfolio is in good automated shape — most pages pass WCAG 2.2 AA scanning outright. To claim **AODA (WCAG 2.0 AA) conformance** the P0 list (unlabeled select, two `lang` attributes, three contrast fixes) must close. To claim **WCAG 2.2 AA** the P1 list adds reflow, target-size, and — most substantively — a **keyboard/non-drag path for the Light ARchitect** (2.1.1 + 2.5.7), which is the single biggest piece of real engineering in this audit. Everything in P0–P1 is fixable; P2 raises the floor from "passes tools" to "works with a screen reader and a keyboard."

---

## 7. Addendum — cookie consent banner + settings dialog (2026-07-03)

`cookie-banner.js` (loaded site-wide) gained a second layer: a preference-center dialog. Reviewed on all three homepage themes at build time:

- **Dialog semantics (4.1.2):** `role="dialog"` + `aria-modal="true"` + `aria-labelledby`; focus moves into the dialog on open and returns to the invoking button on close.
- **Keyboard (2.1.1 / 2.1.2):** full path — Tab is trapped inside the dialog, Escape closes, toggles are real `<button role="switch" aria-checked>` elements operable with Enter/Space; no focus trap persists after close.
- **Expand/collapse (4.1.2):** per-category info uses `aria-expanded` + `aria-controls`; panels toggle the `hidden` attribute.
- **Meaning without color (1.4.1):** every switch pairs the track with a mono ON/OFF text label and knob position; "ALWAYS ON" is text, not a color chip.
- **Target size (2.5.8):** switch and expand rows are ≥44px tall hit areas.
- **Reduced motion (2.3.3):** banner slide and switch transitions are gated on `prefers-reduced-motion`.
- **Residual risk:** dialog copy relies on the page's theme palette; the muted text tokens were chosen to stay ≥4.5:1 on each theme's card surface, but the next full axe sweep should include the dialog open state on all three homepages.

## 8. Addendum — mesh node-map simulation (2026-07-03)

`mesh-sim.js` replaces the static P1 screenshot on both smart-lighting pages with an interactive drag-to-repeater simulation. Reviewed at build time:

- **Keyboard (2.1.1):** the map is a single focusable `role="application"` stop with an instruction label; arrow keys cycle devices, Enter promotes, T tests, R resets — the full drag interaction has a keyboard equivalent.
- **Status messages (4.1.3):** promotion/test/reset outcomes announce via the visible `role="status"` toast plus a visually-hidden `aria-live` region for device-by-device selection feedback.
- **Meaning without color (1.4.1):** low-reliability devices pair coral with a "!" badge and dashed link lines; repeaters are a filled shape; the legend carries counts as text.
- **Reduced motion (2.3.3):** the TEST radar sweep and node snap-back transitions gate on `prefers-reduced-motion`.
- **Pointer gestures (2.5.7):** dragging is path-based, but the keyboard path and AUTO SELECT provide non-drag equivalents for the same outcomes.
- **Known limitation:** individual node hit targets are ~20–27px inside the phone frame (below 24×24 target-size guidance); the keyboard path is the documented alternative, consistent with the site's other games.
- **Site-wide fix:** the page-transition overlay (`#rb-pt`) was hit-testable during its entrance animation, intercepting the first ~1.5s of pointer input on every page; it is now `pointer-events:none` except while deliberately covering for navigation.
