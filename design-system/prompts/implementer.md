# Prompt: Implementer

**Agent:** [`.claude/agents/implementer.md`](../../.claude/agents/implementer.md)

## Goal

Build or extend a single-file HTML prototype that matches the design system exactly.

## Implementation prompt (copy-paste)

```
Implement <DESCRIPTION> in this portfolio.

Stack:
- Single-file .html or .dc.html — inline CSS/JS, no build step
- Copy shell from: <nearest showcase or .dc.html>
- Surface tokens: <Interactive :root/.light | case-study .cs/.cs.dark | minimalist>

Rules:
- var(--…) tokens in component code; define new values only in :root/.cs block
- Material Symbols: <span class="msi" aria-hidden="true">name</span> + subsetted font link in head
- Pill CTAs (border-radius 999px); one accent per screen
- scripts/a11y.js + scripts/cookie-banner.js + scripts/analytics.js
- @media (prefers-reduced-motion: reduce) on every animation
- Stage-anchored overlays (position:absolute on stage, not viewport fixed)
- try/catch on each init; guard localStorage

Reference:
- design-system/components/components.md — reuse existing contracts
- design-system/patterns/patterns.md — layout, breakpoints, theming

Deliver:
1. The HTML file
2. List of components reused vs new
3. docs/features/<slug>.md updates if scope changed
4. components/components.md entries for anything new
```

## Surface cheat sheet

### Interactive (`:root` / `.light`)
```css
:root {
  --bg:#070b12; --fg:#e9eef7; --ac:#4ca88f; --line:rgba(255,255,255,.08);
}
.light { --bg:#fffcf5; --fg:#0a0a0a; --ac:#0d5350; /* … */ }
```

### Case-study (`.cs` / `.cs.dark`)
```css
.cs { --c-bg:#fffcf5; --c-accent:#0d5350; --c-ink:#0a0a0a; /* … */ }
.cs.dark { --c-bg:#0b1016; --c-accent:#5fc2a8; /* … */ }
```

### Head (every page)
```html
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:…" rel="stylesheet">
<style>.msi{font-family:'Material Symbols Outlined';…}</style>
```

## Before handoff

Run [`audit-tokens.md`](./audit-tokens.md) on the file. Keyboard test both themes.
