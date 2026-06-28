# Information architecture

## Sitemap / navigation
- `index.html` → primary homepage (GitHub Pages entry / redirect)
- **Homepage** (VIEW switcher — `home-variants.js`)
  - Interactive (primary) · Dossier · Retro
- **Work** (`Work.dc.html`) — project index
- **About** (`About.dc.html`) — bio + experience
- **Case studies / showcases:** AEGIS (DI / GIMS), CTOC, CORE Insights, DALI-2,
  Enterprise AI, Goals-driven fintech, Partitioning, Smart Lighting

## Key objects & relationships
- **Homepage variant** — a full read of the same narrative (Interactive / Dossier / Retro).
- **Case study** — a project with a thesis, an interactive proof, and supporting states.
- **Interactive proof** — the playable/▶ artifact embedded in a case (e.g. AEGIS Fusion Watch).
- **Shared runtime** — `support.js` et al., consumed by every `.dc.html` page.
