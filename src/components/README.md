# Components & shared modules

This portfolio is built as **single-file `.html` / `.dc.html` prototypes** — most "components"
live inline in the page that uses them, and their contracts are documented in
[`../../design-system/components/components.md`](../../design-system/components/components.md).

Shared, reused runtime modules:

**Repo root:**
- `support.js` — DC runtime: parses `<x-dc>` markup, renders with React
- `home-variants.js` — homepage VIEW switcher
- `page-transition.js` · `text-motion.js` — transitions and scroll type motion
- `concierge.js` · `cursor.js` · `case-back.js` — chat, cursor, back-link memory
- `colophon.js` — build record footer (**generated** by `scripts/build-colophon.py`)
- `search-index.js` — full-text index (**generated** by `scripts/build-search-index.py`)

**`scripts/`:**
- `a11y.js` — skip link, focus baseline, reduced-motion kill switch
- `analytics.js` · `cookie-banner.js` — GA4 (consent-gated)

Use `primitives/` and `patterns/` here only for genuinely extracted shared UI code (currently empty).
Conventions: inline-first, `var(--…)` tokens, Material Symbols (`.msi`), no build — see
[`../../.claude/rules/code-style.md`](../../.claude/rules/code-style.md) and
[`../../design-system/implementation/implementation.md`](../../design-system/implementation/implementation.md).
