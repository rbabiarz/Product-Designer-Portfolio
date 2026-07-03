# Design decisions (ADR log) — Product Designer Portfolio

Append-only record of meaningful choices. Newest at top.

## ADR-006 — No homepage reader poll; cross-visitor state stays keyless
- **Date:** 2026-07-03
- **Status:** Accepted
- **Context:** A "which homepage did you like best?" poll was scaffolded (`poll.js` +
  Firebase Firestore config) but never enabled. It required a real backend and a vendor
  account, contradicting ADR-002's no-build / no-backend stance, and it asked visitors a
  question the VIEW switcher already answers behaviorally.
- **Decision:** Remove the homepage poll and all Firebase scaffolding
  (`poll.js`, `firebase-config.js`, `firebase.json`, `firestore.rules`). The work-page
  carousel poll stays — its tally uses a keyless public counter (Abacus), which fits the
  static-host architecture.
- **Consequences:** No homepage vote data; variant preference is inferred from the saved
  VIEW choice instead. If a poll returns someday, it should use a keyless store, not a
  vendor backend. Recoverable from git history (`ce08e02`).

## ADR-005 — The dropped P1 node map ships as a live simulation, not a screenshot
- **Date:** 2026-07-03
- **Status:** Accepted
- **Context:** The Smart Lighting mesh section showed four proposals as static screenshots. P1
  (drag-to-repeater node map) is the strongest demonstration of interaction craft, and the
  portfolio thesis is interactive, code-level prototypes — a screenshot undersells it.
- **Decision:** Rebuild the P1 screen as a working sim (`mesh-sim.js`, shared by both smart-lighting
  pages via `[data-mesh-sim]`): distance-based signal model, drag-a-bulb-onto-the-gateway
  promotion, TEST sweep that reveals marginal devices with where-to-work guidance, and AUTO
  SELECT that performs the shipped P4 behavior — making the P1→P4 argument playable. Low
  reliability is coral **plus** a "!" badge and dashed links (never hue alone); full keyboard path
  (arrows/Enter/T/R) with `aria-live` announcements; sim state survives `.dc` re-renders.
- **Consequences:** One more shared runtime module to maintain; the P2/P3/P4 tabs remain
  screenshots layered above the sim (which goes inert while covered). Fixing pointer delivery
  surfaced a site-wide bug: the page-transition overlay stayed hit-testable during its entrance
  animation — it is now `pointer-events:none` except during the deliberate exit cover.

## ADR-004 — In-game overlays anchor to their stage, not the viewport
- **Date:** 2026-06-28
- **Status:** Accepted
- **Context:** The AEGIS "how scoring works" popup used `position:fixed`; inside a host wrapper
  with a `transform`, fixed resolves against that ancestor, so on mobile it flew off-screen.
- **Decision:** Anchor in-game overlays with `position:absolute` to the game stage and frame the
  stage into view on open.
- **Consequences:** Robust in any embed; dim is stage-scoped rather than full-page (acceptable).

## ADR-003 — Three switchable homepage variants
- **Date:** 2026-06-28
- **Status:** Accepted
- **Context:** One homepage can't serve both the "interactive proof" and "classified dossier" reads.
- **Decision:** Ship Interactive (primary), Dossier, and Retro variants behind a VIEW switcher
  (`home-variants.js`) that remembers the choice.
- **Consequences:** More surface to maintain; each variant must stay token- and a11y-consistent.

## ADR-002 — No-build, self-contained HTML via the DC runtime
- **Date:** 2026-06-28
- **Status:** Accepted
- **Context:** Portability and longevity beat tooling for a portfolio.
- **Decision:** Single-file pages; `.dc.html` rendered by `support.js` (React via CDN). No server.
- **Consequences:** Deploys anywhere static; first load needs the CDN; degrades gracefully.

## ADR-001 — Dark-first defense aesthetic, monochrome + one accent
- **Date:** 2026-06-28
- **Status:** Accepted
- **Context:** The work is SOC / defense; meaning must not ride on hue.
- **Decision:** `#070b12` canvas, teal accent (`#4ca88f`/`#7dd3c0`), one color block per viewport,
  a light architect mirror. No stoplight colors as status.
- **Consequences:** Strong, coherent read; requires discipline on accent usage and contrast.
