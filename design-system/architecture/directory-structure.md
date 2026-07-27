# Directory structure

Canonical map of the portfolio repository. The annotated visual lives in
[`design-system.html`](../../design-system.html) § Architecture. When this tree
changes, update that block and run `/sync-scaffold`.

```
project-root/
├── CONTEXT CLAUDE LOADS
│   ├── CLAUDE.md
│   ├── CLAUDE.local.md          (gitignored)
│   ├── DESIGN.md
│   ├── PRODUCT.md
│   ├── .mcp.json
│   ├── README.md
│   ├── .gitignore
│   └── .env.example
│
├── TEAM TOOLKIT
│   └── .claude/
│       ├── agents/
│       ├── commands/
│       ├── rules/
│       ├── skills/
│       ├── settings.json
│       └── settings.local.json  (gitignored)
│
├── DESIGN SYSTEM
│   ├── design-system/           ← you are here
│   ├── design-tokens.json
│   ├── tokens.css
│   └── styles.css
│
├── DOCUMENTATION
│   └── docs/
│
├── SOURCE
│   └── src/components/
│
├── STATIC / SUPPORT / SEO
│   ├── public/images/
│   ├── robots.txt, sitemap.xml, site.webmanifest
│   ├── .nojekyll, CNAME
│   ├── SEO.md, PERFORMANCE-AUDIT.md, WCAG-2.2-AODA-AUDIT.md
│   └── scripts/                 analytics, a11y, cookie-banner, build helpers
│
└── REFERENCE
    └── reference/
        ├── screenshots/
        ├── competitors/
        ├── moodboards/
        ├── flows/
        └── research/
```

## Relocated design-system files (2026-07-27)

| Was | Now |
|---|---|
| `design-system/foundations.md` | `design-system/foundations/foundations.md` |
| `design-system/colors_and_type.css` | `design-system/foundations/colors_and_type.css` |
| `design-system/components.md` | `design-system/components/components.md` |
| `design-system/patterns.md` | `design-system/patterns/patterns.md` |
| `design-system/usage-guidelines.md` | `design-system/governance/usage-guidelines.md` |

## Relocated support scripts (2026-07-27)

| Was (repo root) | Now |
|---|---|
| `analytics.js` | `scripts/analytics.js` |
| `a11y.js` | `scripts/a11y.js` |
| `cookie-banner.js` | `scripts/cookie-banner.js` |
| `build-search-index.py` | `scripts/build-search-index.py` |
| `build-colophon.py` | `scripts/build-colophon.py` |

Shared runtime modules (`support.js`, `page-transition.js`, `text-motion.js`,
`home-variants.js`, `colophon.js`, `concierge.js`) remain at repo root — loaded directly by pages.

## Spot Studios (sibling surface)

```
spotstudios/
├── styles.css, case-study.css
├── index.html, work.html, dali-2.html, …
└── assets/
```

Separate Figma-export tokens — not merged with root `tokens.css`.
