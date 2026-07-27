# Contribution rules

How to change the design system without drift.

1. **Tokens first** — edit [`tokens.css`](../../tokens.css) and [`design-tokens.json`](../../design-tokens.json),
   then sync [`foundations/colors_and_type.css`](../foundations/colors_and_type.css) and [`tokens/`](../../tokens/).
2. **Document the contract** — components in [`components/components.md`](../components/components.md);
   composed flows in [`patterns/patterns.md`](../patterns/patterns.md); surface-specific notes in
   the relevant case-study feature doc under `docs/features/`.
3. **Icons** — Material Symbols only; verify glyph name against MUI kit before shipping.
4. **One PR, one concern** — token changes separate from copy changes separate from new pages.
5. **No silent moves** — update [`architecture/directory-structure.md`](../architecture/directory-structure.md),
   the annotated tree in `design-system.html`, and any `.claude/rules` paths in the same commit.
6. **Dual docs** — when changing foundations/components/patterns, update both the split file and
   [`DESIGN.md`](../../DESIGN.md) in the same pass (or slim DESIGN.md to pointers only).
7. **Log it** — [`docs/changelog.md`](../../docs/changelog.md) for site changes;
   [`releases/CHANGELOG.md`](../releases/CHANGELOG.md) for system-level changes.
8. **Review against** [`usage-guidelines.md`](./usage-guidelines.md), [`../checklists/component-ready.md`](../checklists/component-ready.md),
   and `.claude/rules/design-system.md`.
9. **Regenerate** — after page content changes: `python3 scripts/build-search-index.py` and
   `python3 scripts/build-colophon.py`.
