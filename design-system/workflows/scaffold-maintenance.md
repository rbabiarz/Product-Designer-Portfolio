# Scaffold maintenance

How to keep the project directory structure, design-system docs, and context files
aligned with what is actually shipped. Run this checklist **after every case study,
token change, or structural edit** — and at least **once a month** as a standing review.

> **Shortcut:** invoke `/sync-scaffold` in Claude Code to walk this list with AI assistance.

---

## When to run

| Trigger | Minimum updates |
|---|---|
| New case study or homepage variant | `docs/features/`, `docs/changelog.md`, `docs/information-architecture.md`, search index, colophon, sitemap |
| Token or palette change | `design-tokens.json`, `tokens/`, `design-system/foundations/`, `/audit-tokens` |
| New shared script or runtime module | `scripts/`, `src/components/README.md`, `CLAUDE.md` |
| Design-system rule change | `DESIGN.md`, relevant `design-system/*/` doc, `.claude/rules/design-system.md` |
| Folder added or removed | `design-system/architecture/directory-structure.md`, annotated tree in `design-system.html` |
| Release / deploy | `docs/changelog.md`, `design-system/releases/CHANGELOG.md`, run build scripts |

---

## Every update (quick pass)

1. **Log the change** — add a dated entry to [`docs/changelog.md`](../../docs/changelog.md).
2. **Close or open threads** — move resolved items out of [`docs/open-questions.md`](../../docs/open-questions.md); add new ones.
3. **Record decisions** — ADR-style note in [`docs/design-decisions.md`](../../docs/design-decisions.md) when the call is non-obvious.
4. **Regenerate derived files** (from repo root):
   ```bash
   python3 scripts/build-search-index.py
   python3 scripts/build-colophon.py
   ```
5. **Verify the tree** — compare [`architecture/directory-structure.md`](../architecture/directory-structure.md) and the annotated scaffold in [`design-system.html`](../../design-system.html) against `find . -type d` for drift.

---

## Case-study checklist

Follow [adding-a-case-study.md](./adding-a-case-study.md) or `/new-case-study`. At minimum:

- [ ] `docs/features/<slug>.md` written
- [ ] Preview tile + registration on work index, homepages, concierge, sitemap
- [ ] `reference/flows/<slug>/` stubbed if the flow is novel
- [ ] New patterns documented in [`components/components.md`](../components/components.md) or [`patterns/patterns.md`](../patterns/patterns.md)
- [ ] Search index and colophon regenerated
- [ ] [`docs/changelog.md`](../../docs/changelog.md) updated

---

## Token audit

Run `/audit-tokens` or search manually:

```bash
rg -n '#[0-9a-fA-F]{3,8}|rgb\(|hsl\(' --glob '*.html' --glob '*.css' \
  --glob '!design-tokens.json' --glob '!tokens/**'
```

Hard-coded values should become `var(--…)` entries at the right tier. Mirror changes in
[`design-tokens.json`](../../design-tokens.json) and [`tokens/`](../../tokens/).

---

## Monthly review (15 min)

- [ ] Read [`docs/open-questions.md`](../../docs/open-questions.md) — resolve or re-prioritize
- [ ] Scan [`design-system/checklists/release-checklist.md`](../checklists/release-checklist.md)
- [ ] Confirm [`WCAG-2.2-AODA-AUDIT.md`](../../WCAG-2.2-AODA-AUDIT.md) still reflects known gaps
- [ ] Confirm [`SEO.md`](../../SEO.md) metadata matches live pages
- [ ] Bump [`design-system/releases/CHANGELOG.md`](../releases/CHANGELOG.md) if the system itself changed
- [ ] Re-read [`architecture/directory-structure.md`](../architecture/directory-structure.md) against disk

---

## Files that must stay in sync

| File | Purpose | Update when |
|---|---|---|
| `CLAUDE.md` | AI entry point | Conventions, paths, or toolchain change |
| `DESIGN.md` | North star + full token reference | Principles, palette, or motion rules change |
| `design-system.html` annotated tree | Human-readable scaffold | Any folder move |
| `design-system/architecture/directory-structure.md` | Canonical tree doc | Any folder move |
| `README.md` | Human onboarding | Structure or deploy steps change |
| `build-deep-dive.py` source list | Deep-dive page generation | Core docs move |
| `.claude/rules/*` | Always-on AI rules | Any house rule changes |
