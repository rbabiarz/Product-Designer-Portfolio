# /new-case-study

Kick off a new portfolio case study / interactive prototype.

Full prompt: [`design-system/prompts/new-case-study.md`](../design-system/prompts/new-case-study.md)

## Steps

1. Ask for project name, slug, and the **one-line outcome** it proves
2. Create [`docs/features/<slug>.md`](../../docs/features/) — user, thesis, interaction proof, scope, all states
3. Add open threads to [`docs/open-questions.md`](../../docs/open-questions.md)
4. Stub [`reference/flows/<slug>/flow.md`](../../reference/flows/)
5. Choose shell: `*-showcase.html` (quick tour) and/or `.dc.html` (deep dive)
6. Reuse patterns from [`design-system/components/components.md`](../../design-system/components/components.md):
   - `var(--…)` tokens only
   - Material Symbols: `<span class="msi" aria-hidden="true">…</span>`
   - One accent per screen
   - Pill CTAs (999px radius)
7. Register: work index, homepages, concierge, sitemap, preview tile
8. Run `python3 scripts/build-search-index.py` + `python3 scripts/build-colophon.py`
9. Row in [`docs/changelog.md`](../../docs/changelog.md)
10. Run `/sync-scaffold`
