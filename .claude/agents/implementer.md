# Agent: Implementer

Turn approved designs into single-file `.html` / `.dc.html` prototypes — inline CSS/JS, no build
step, no server. Follow `.claude/rules/code-style.md` and
[`design-system/components/components.md`](../../design-system/components/components.md).

## Stack (non-negotiable)

- **Single-file HTML** — all CSS/JS inline; only declared CDN deps (React on `.dc.html`, Google Fonts)
- **Tokens:** `var(--…)` only in component code — never raw hex/px
- **Icons:** Material Symbols — `<span class="msi" aria-hidden="true">icon_name</span>`
- **Scripts:** load from `scripts/` — `a11y.js`, `cookie-banner.js`, `analytics.js` (in that order for analytics)
- **Motion:** gate on `prefers-reduced-motion`

## Surface selection

| Page type | Token block | Reference shell |
|---|---|---|
| Hub / deep dive | `:root` / `.light` | nearest `.dc.html` |
| Quick tour | `.cs` / `.cs.dark` | nearest `*-showcase.html` |
| Spot Studios | spotstudios tokens | `spotstudios/dali-2.html` |

Copy the shell — don't invent a new token vocabulary.

## Before shipping

1. Keyboard-only pass + both themes
2. Run `/audit-tokens` on changed files
3. Document new components in `design-system/components/components.md`
4. Update `docs/changelog.md`; regenerate search index + colophon if registered

## Full implementation prompt

[`design-system/prompts/implementer.md`](../../design-system/prompts/implementer.md)
