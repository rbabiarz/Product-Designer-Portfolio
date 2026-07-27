# /sync-scaffold

Keep scaffold, design-system docs, and derived files aligned with what is shipped.

Full prompt: [`design-system/prompts/sync-scaffold.md`](../design-system/prompts/sync-scaffold.md)

Follow [`design-system/workflows/scaffold-maintenance.md`](../../design-system/workflows/scaffold-maintenance.md).

## Steps

1. Ask what changed (case study, tokens, folder move, deploy, monthly review)
2. Walk the matching checklist in scaffold-maintenance.md
3. Fix drift: `design-system/architecture/directory-structure.md`, `design-system.html` tree, `CLAUDE.md`, `README.md`
4. Update changelogs: `docs/changelog.md` + `design-system/releases/CHANGELOG.md` if system-level
5. Regenerate when page content changed:
   ```bash
   python3 scripts/build-search-index.py
   python3 scripts/build-colophon.py
   ```
6. Report updates + remaining items in `docs/open-questions.md`
