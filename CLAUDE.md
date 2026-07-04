# Product Designer Portfolio

> Robert Babiarz's senior product-design portfolio — the connected-lighting (IoT security) → defense-AI narrative, told through interactive, code-level prototypes (AEGIS, CTOC, Light Architect, DALI-2, CORE Insights).

This file is the entry point for context. Read it first, then follow the links.

## What this project is
Robert Babiarz's senior product-design portfolio — the connected-lighting (IoT security) → defense-AI narrative, told through interactive, code-level prototypes (AEGIS, CTOC, Light Architect, DALI-2, CORE Insights).

Owner / lead designer: Robert Babiarz · Live: https://robertbabiarz.com/

## How it runs (the load-bearing fact)
Self-contained HTML — single-file pages with inline CSS/JS, no build step and no server. `.dc.html` pages embed markup in an `<x-dc>` template that `support.js` renders with React (loaded from the unpkg CDN). Icons via Material Symbols from the MUI kit (`<span class="msi" aria-hidden="true">icon_name</span>`; subsetted Google Fonts link + `.msi` class in each page's head). No build, no server, no backend — every page opens directly in a
browser and deploys to any static host (GitHub Pages). The only runtime dependency is
the React CDN + Google Fonts; both degrade gracefully offline.

## How to work in this repo
- **Design philosophy & principles** live in [`DESIGN.md`](./DESIGN.md). Honor them.
- **Rules** Claude must follow are in [`.claude/rules/`](./.claude/rules/):
  design-system, accessibility, code-style, content-voice.
- **Design tokens** are the source of truth for visual values. The live CSS variables
  ship in `tokens.css` / `styles.css`; the portable mirror is
  [`design-tokens.json`](./design-tokens.json) and the three-tier split in
  [`tokens/`](./tokens/). Never hardcode a hex/px/radius in prototype code — reference a
  CSS custom property (`var(--bg)`, `var(--ac2)`).
- **Design-system docs** describe foundations, components, and patterns in
  [`design-system/`](./design-system/) (the live CSS reference is
  `design-system/colors_and_type.css`).
- **Product context** (brief, PRD, decisions, personas, IA) lives in [`docs/`](./docs/).
- **Inspiration & research** live in [`reference/`](./reference/).

## Conventions
- Prototypes are single-file `.html` / `.dc.html` (markup + inline CSS/JS). Shared runtime
  modules (`support.js`, `a11y.js`, `text-motion.js`, `page-transition.js`,
  `home-variants.js`) live at the repo root; documented in [`src/components/`](./src/components/).
- Icons: Material Symbols via `<span class="msi" aria-hidden="true">icon_name</span>` (MUI for Figma kit is the source of truth) — never hand-author SVG paths.
- Status/meaning never rides on hue alone; never use saturated red/amber/stoplight-green
  as status (see [`DESIGN.md`](./DESIGN.md)).
- Decisions get logged in [`docs/design-decisions.md`](./docs/design-decisions.md) (ADR style);
  open threads in [`docs/open-questions.md`](./docs/open-questions.md).

## Personal / machine-local context
See [`CLAUDE.local.md`](./CLAUDE.local.md) — gitignored, for machine-specific notes.
