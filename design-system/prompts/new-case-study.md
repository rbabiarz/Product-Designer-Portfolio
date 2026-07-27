# Prompt: New case study

**Command:** `/new-case-study` · **Workflow:** [`../workflows/adding-a-case-study.md`](../workflows/adding-a-case-study.md)

## Goal

Spec, scaffold, and register a new portfolio case study end to end.

## Inputs (ask first)

1. **Project name** (display title)
2. **Slug** (kebab-case filename stem)
3. **One-line outcome** — what senior judgment this proves
4. **Audience** — program lead, design leader, hiring manager, …
5. **Quick tour only, deep dive only, or both?**
6. **Live demo?** (working prototype embed)

## Phase 1 — Spec

Create [`docs/features/<slug>.md`](../../docs/features/) with:

```markdown
# <Project name>

## User
Who reads this and what decision they're making.

## Thesis
One paragraph — the design judgment on display.

## Interaction proof
What the prototype demonstrates (not a feature list).

## Scope
### In
### Out

## Required states
- [ ] Default / happy path
- [ ] Empty
- [ ] Loading
- [ ] Error
- [ ] Longest content
- [ ] Reduced motion
- [ ] Both themes (if toggle)
```

Add unresolved items to [`docs/open-questions.md`](../../docs/open-questions.md).

## Phase 2 — Reference

- [`reference/flows/<slug>/flow.md`](../../reference/flows/) — journey steps
- Drop screenshots in [`reference/screenshots/`](../../reference/screenshots/) if available

## Phase 3 — Build

### Shell selection

| Deliverable | Start from |
|---|---|
| Quick tour | nearest `*-showcase.html` (`.cs` wrapper) |
| Deep dive | nearest `.dc.html` hub |
| Spot Studios variant | `spotstudios/dali-2.html` |

### Non-negotiables

- Material Symbols: `<span class="msi" aria-hidden="true">icon_name</span>`
- Tokens: `var(--…)` in component code — define new roles in `:root`/`.cs` block only
- One accent per screen; pill CTAs
- Load: `scripts/a11y.js`, `scripts/cookie-banner.js`, `scripts/analytics.js`
- `[data-reveal]` on section entrances; PRM gated
- Document new patterns in [`../components/components.md`](../components/components.md)

## Phase 4 — Register

- [ ] `work.dc.html` + `spotstudios/work.html` (if applicable)
- [ ] Homepage carousels (all three variants if featured)
- [ ] `concierge.js` entry
- [ ] `sitemap.xml`
- [ ] `previews/thumb-<slug>.png`
- [ ] `python3 scripts/build-search-index.py`
- [ ] `python3 scripts/build-colophon.py`

## Phase 5 — Ship

- [ ] [`docs/changelog.md`](../../docs/changelog.md) dated entry
- [ ] [`docs/design-decisions.md`](../../docs/design-decisions.md) for non-obvious calls
- [ ] Walk [`../checklists/release-checklist.md`](../checklists/release-checklist.md)
- [ ] Run `/sync-scaffold`
