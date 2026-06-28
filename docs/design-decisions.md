# Design decisions (ADR log) — Defence Portfolio

Append-only record of meaningful choices. Newest at top.

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
