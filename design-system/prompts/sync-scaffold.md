# Prompt: Sync scaffold

**Command:** `/sync-scaffold` · **Workflow:** [`../workflows/scaffold-maintenance.md`](../workflows/scaffold-maintenance.md)

## Goal

After any structural, token, or case-study change — verify docs match disk and regenerate derived files.

## Trigger selection

Ask: *What changed since the last sync?*

| Answer | Checklist section |
|---|---|
| New / updated case study | Case-study checklist + register surfaces |
| Token or palette edit | Token audit + sync JSON + colors_and_type.css |
| Folder move | directory-structure.md + design-system.html tree + all path refs |
| Deploy / release | Release checklist + colophon + search index |
| Monthly review | Monthly review section |
| Design-system doc edit | releases/CHANGELOG.md + verify split docs ↔ DESIGN.md |

## Sync pass (always)

1. **Changelog** — [`docs/changelog.md`](../../docs/changelog.md) has today's entry
2. **Open questions** — [`docs/open-questions.md`](../../docs/open-questions.md) current
3. **Tree vs disk** — compare [`../architecture/directory-structure.md`](../architecture/directory-structure.md) to `find design-system -type f`
4. **Annotated tree** — `design-system.html` § Architecture matches
5. **Path refs** — grep for stale paths:
   - `design-system/foundations.md` (old flat paths)
   - `Lucide` / `data-lucide` in rules and commands
   - `ACCESSIBILITY-AUDIT.md` (should be `WCAG-2.2-AODA-AUDIT.md`)
   - `src="a11y.js"` (should be `scripts/a11y.js`)

## Regenerate (when page content changed)

```bash
python3 scripts/build-search-index.py
python3 scripts/build-colophon.py
```

Optional: `python3 build-deep-dive.py` if core docs moved.

## Output format

```markdown
## Scaffold sync — YYYY-MM-DD

### Updated
- file — what changed

### Verified clean
- …

### Needs human decision
- … (→ docs/open-questions.md)

### Commands run
- …
```

## Files that must stay in sync

| File | When to touch |
|---|---|
| `CLAUDE.md` | Conventions, paths, toolchain |
| `DESIGN.md` | Principles, palette (or slim to pointers) |
| `design-system/**` | Any system rule change |
| `.claude/rules/*` | Always-on AI rules |
| `.claude/commands/*` + `design-system/prompts/*` | Prompt changes (mirror both) |
| `README.md` | Onboarding / structure |
| `src/components/README.md` | Shared module changes |
