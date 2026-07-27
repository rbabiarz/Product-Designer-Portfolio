# Design system changelog

Notable changes to the system itself — separate from [`docs/changelog.md`](../../docs/changelog.md).

## 2026-07-27 — Full documentation sync

- **Icons:** All docs updated from Lucide → Material Symbols (`.msi`) to match shipped pages.
- **Foundations:** Added case-study shell (`--c-*`), Minimalist note, token hierarchy; fixed broken links.
- **Components:** Expanded catalog — case-study shell, concierge, colophon, view key, minimalist; Material Symbols.
- **Patterns:** Added icon pattern, `data-reveal`, case-study theming; fixed `scripts/a11y.js` path.
- **Governance:** Expanded usage guidelines + contribution rules (dual-doc sync, token canonical source).
- **Topic docs:** Rewrote tokens, branding, accessibility, motion, content, analytics, ai, audits, implementation READMEs.
- **Audits:** Fixed links to `WCAG-2.2-AODA-AUDIT.md`; added 2026-07-27 doc-sync audit entry.
- **CSS sync:** `colors_and_type.css` aligned with `tokens.css` (`--color-muted-soft`, `--color-success`).
- **Prompts:** 10 full prompt files in `design-system/prompts/`; expanded `.claude/agents/` and
  `.claude/commands/` with cross-links. Mirror rule: edit both locations together.

## 2026-07-27 — Scaffold reorganization

- Reorganized `design-system/` into subfolders (foundations, components, patterns, governance, …).
- Added workflows, checklists, architecture docs.
- Moved support scripts to `scripts/`.
- Introduced `/sync-scaffold` command.

## 2026-06-28

- Initial design-system docs (flat files: foundations, components, patterns, usage-guidelines).
