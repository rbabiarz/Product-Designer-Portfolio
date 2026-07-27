# Templates

Full-page templates assembled from patterns and components.

## Current approach

No standalone template files yet — **copy an existing shell** as the starting point:

| Template source | Use for |
|---|---|
| `*-showcase.html` with `.cs` wrapper | New quick-tour case study |
| `*.dc.html` hub pages | New deep-dive / multi-section doc page |
| `homepage-interactive.dc.html` | Homepage variant (rare) |
| `spotstudios/dali-2.html` | Spot Studios long-form case study |

## Extraction checklist (when promoting a template)

1. Strip case-specific content; keep nav, theme toggle, TOC, footer/colophon wiring
2. Preserve `:root` / `.cs` token block with placeholder comments
3. Include script loads: `scripts/a11y.js`, `scripts/cookie-banner.js`, `scripts/analytics.js`
4. Add Material Symbols font link + `.msi` class
5. Document in [`../components/components.md`](../components/components.md) if new chrome ships

See [`../workflows/adding-a-case-study.md`](../workflows/adding-a-case-study.md).
