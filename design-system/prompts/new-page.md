# Prompt: New page

**Command:** `/new-page` · **Alias of:** [`new-case-study.md`](./new-case-study.md)

## Goal

Scaffold any new public page — case study, hub page, or homepage variant.

## Routing

| Page type | Follow |
|---|---|
| Case study (default) | [`new-case-study.md`](./new-case-study.md) — full workflow |
| Homepage variant | This file § Homepage variant below |
| About / Work hub update | Edit existing `.dc.html`; no new file unless restructuring |

## Homepage variant (Interactive / Dossier / Retro)

1. Copy nearest `homepage-*.dc.html`
2. Update `:root` palette if new theme (document in [`../foundations/foundations.md`](../foundations/foundations.md))
3. Add entry to `HOME_VARIANTS` in [`home-variants.js`](../../home-variants.js)
4. Update VIEW switcher labels in **all three** homepage files
5. Test `localStorage['rb-home-variant']` redirect
6. Register in changelogs + `/sync-scaffold`

## All pages

Regardless of type, every new `.html` page must:

```html
<script src="scripts/a11y.js"></script>
<script src="scripts/cookie-banner.js" defer></script>
<script src="scripts/analytics.js" defer></script>
```

Icons: Material Symbols `.msi` in `<head>`. Tokens: surface-appropriate `var(--…)`.
