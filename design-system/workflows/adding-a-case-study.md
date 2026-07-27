# Adding a case study

End-to-end workflow for a new portfolio case study. Mirrors `/new-case-study`.

## 1. Spec

Create [`docs/features/<slug>.md`](../../docs/features/<slug>.md):

- User (program lead / design leader)
- Thesis — what judgment this proves
- Interaction proof — what the prototype demonstrates
- Scope and required states (empty, loading, error, longest content)
- Non-goals

Add an entry to [`docs/open-questions.md`](../../docs/open-questions.md) if anything is unresolved.

## 2. Reference

Stub [`reference/flows/<slug>/flow.md`](../../reference/flows/) if the journey is new.
Drop screenshots into [`reference/screenshots/`](../../reference/screenshots/) as needed.

## 3. Build

- Quick tour: `*-showcase.html` on the case-study shell
- Deep dive (optional): matching `*.dc.html` or `*-case-study.dc.html`
- Reuse patterns from [`components/components.md`](../components/components.md)
- Reference `var(--…)` tokens only; Material Symbols for icons
- Gate motion on `prefers-reduced-motion`

## 4. Register

- Work index (`work.dc.html` / `minimalist/work.html` if applicable)
- Homepage carousels and concierge (`concierge.js`)
- `sitemap.xml`, preview tile under `previews/`
- Run `python3 scripts/build-search-index.py`

## 5. Ship

- [`docs/changelog.md`](../../docs/changelog.md)
- [`docs/design-decisions.md`](../../docs/design-decisions.md) for non-obvious calls
- `python3 scripts/build-colophon.py`
- Walk [`checklists/release-checklist.md`](../checklists/release-checklist.md)
