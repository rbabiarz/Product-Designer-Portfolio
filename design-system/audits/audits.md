# Audits

Recorded findings for the portfolio. Add dated notes here after each review pass.

## Standing audit files (repo root)

| Domain | File | Update when |
|---|---|---|
| Accessibility | [`WCAG-2.2-AODA-AUDIT.md`](../../WCAG-2.2-AODA-AUDIT.md) | After case-study ship or a11y fix |
| Performance | [`PERFORMANCE-AUDIT.md`](../../PERFORMANCE-AUDIT.md) | After heavy page or asset change |
| SEO | [`SEO.md`](../../SEO.md) | Metadata/sitemap changes |
| Tokens | Run `/audit-tokens` | After palette edits |

## Dated sub-notes (this folder)

Create `YYYY-MM-DD-<topic>.md` for one-off sweeps:

```
audits/
├── README.md                    ← you are here
└── 2026-07-27-doc-sync.md       ← example: design-system doc alignment pass
```

## 2026-07-27 — Design-system documentation sync

**Scope:** Align all `design-system/` docs with shipped implementation.

**Findings fixed:**
- Icon system documented as Lucide; shipped Material Symbols (`.msi`) — corrected across foundations, components, patterns, governance
- `ACCESSIBILITY-AUDIT.md` links broken; canonical file is `WCAG-2.2-AODA-AUDIT.md`
- `colors_and_type.css` drifted from `tokens.css` on 2 values — synced
- Missing case-study shell (`--c-*`) and Minimalist surface documentation — added
- Stub READMEs expanded (tokens, branding, accessibility, motion, content, analytics, ai)

**Remaining gaps:**
- `deep-dive.html` still references Lucide (generated page — rebuild via `build-deep-dive.py`)
- Minimalist tokens intentionally isolated — no merge with root `tokens.css` yet
- `src/components/` folders empty — components remain inline per page by design

## Audit cadence

| Frequency | Action |
|---|---|
| Per case study | axe pass + update WCAG audit if issues found |
| Per token change | `/audit-tokens` |
| Monthly | scaffold-maintenance monthly review section |
| Per release | [`../checklists/release-checklist.md`](../checklists/release-checklist.md) |
