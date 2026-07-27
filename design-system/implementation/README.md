# Implementation

How the design system lands in code for this portfolio.

## Stack

| Layer | Technology |
|---|---|
| Pages | Self-contained `.html` / `.dc.html` — inline CSS + JS |
| DC runtime | [`support.js`](../../support.js) + React from unpkg CDN |
| Icons | Material Symbols (`.msi`) — subsetted Google Fonts per page |
| Fonts | Inter, DM Sans, JetBrains Mono (+ VT323 on retro only) |
| Deploy | GitHub Pages — static, no server, `.nojekyll` at root |

**No build step.** Open any `.html` in a browser or `python3 -m http.server`.

## File layout

```
Repo root
├── *.html / *.dc.html          ← prototypes (tokens inline per surface)
├── support.js, concierge.js, … ← shared runtime (documented in src/components/)
├── tokens.css, styles.css      ← foundational CSS
├── scripts/                    ← a11y, analytics, cookie-banner, build helpers
├── design-system/              ← this documentation tree
└── minimalist/                ← sibling surface (separate tokens)
```

## Adding a page

1. Copy nearest showcase shell (`*-showcase.html` or `.dc.html` hub)
2. Declare surface tokens in `:root` / `.cs` block — don't import alien palettes
3. Load shared scripts: `scripts/a11y.js`, `scripts/cookie-banner.js`, `scripts/analytics.js`
4. Document new components in [`components/components.md`](../components/components.md)
5. Register in work index, sitemap, search index — see [`workflows/adding-a-case-study.md`](../workflows/adding-a-case-study.md)

## Component pattern

Components are **inline** in the page that uses them. Contracts live in
[`components/components.md`](../components/components.md); [`src/components/`](../../src/components/)
documents shared JS modules only (not a React/Vue library).

## Build helpers

```bash
python3 scripts/build-search-index.py   # → search-index.js (concierge)
python3 scripts/build-colophon.py     # → colophon.js (footer strip)
python3 build-deep-dive.py            # → deep-dive.html (optional)
```

Run from repo root. Scripts auto-`chdir` to root.

## Icons (canonical)

```html
<span class="msi" aria-hidden="true">download</span>
```

Never Lucide. Never hand-authored SVG for UI chrome.

## Testing

- Open file directly in browser
- Keyboard-only navigation pass
- Both themes if page has toggle
- `prefers-reduced-motion: reduce` in devtools
