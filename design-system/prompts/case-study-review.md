# Prompt: Case study review

Pre-ship review checklist — combines design critic + release gate.

## When to run

Before merging or deploying a new/updated case study page.

## Prompt (copy-paste)

```
Pre-ship review for case study: <FILE>

Run all checks and report pass/fail:

CONTENT
- [ ] Eyebrow → headline → lead hierarchy clear
- [ ] Plain language; jargon glossed on first use
- [ ] Every metric labeled (observed / design target / company-era)
- [ ] Quick tour stays outcome-focused; deep dive link present if applicable

DESIGN SYSTEM
- [ ] var(--…) tokens only outside :root/.cs definitions
- [ ] One accent per screen
- [ ] Material Symbols .msi — no Lucide
- [ ] Pill CTAs; cards match shell (r18 case-study)
- [ ] data-reveal on sections; PRM gated

ACCESSIBILITY (WCAG 2.2 AA target)
- [ ] Skip link first focusable
- [ ] Keyboard path for every action
- [ ] focus-visible ring on all controls
- [ ] 44px touch targets on mobile
- [ ] Horizontal scroll regions: tabindex="0" + aria-label
- [ ] Alt text on meaningful images

REGISTRATION
- [ ] work.dc.html (+ spotstudios/work.html if listed)
- [ ] concierge.js + search-index regenerated
- [ ] sitemap.xml + preview tile
- [ ] docs/changelog.md + docs/features/<slug>.md current
- [ ] colophon regenerated

Return: SHIP / SHIP WITH FIXES / BLOCKED with numbered findings.
```

## Checklists

- [`../checklists/component-ready.md`](../checklists/component-ready.md)
- [`../checklists/release-checklist.md`](../checklists/release-checklist.md)
- [`design-critic.md`](./design-critic.md) for deep critique
