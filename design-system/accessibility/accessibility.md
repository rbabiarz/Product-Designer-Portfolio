# Accessibility

System-wide a11y standards. Target: **WCAG 2.2 AA** / **AODA**.

## Standing audit

Canonical record: [`../../WCAG-2.2-AODA-AUDIT.md`](../../WCAG-2.2-AODA-AUDIT.md)

Update after each case-study ship or quarterly review. Log dated findings in [`../audits/`](../audits/).

## Runtime

| Resource | Role |
|---|---|
| [`scripts/a11y.js`](../../scripts/a11y.js) | Skip link, focus-visible baseline, PRM global kill switch |
| [`.claude/rules/accessibility.md`](../../.claude/rules/accessibility.md) | Always-on AI rules |

Loaded on every public page (Interactive, case studies, minimalist).

## Requirements (summary)

| Criterion | Target |
|---|---|
| Contrast | 4.5:1 body text; 3:1 large text/UI — both themes |
| Focus | Visible `:focus-visible` ring on every control (2–3px accent, offset 2–3px) |
| Targets | 44×44px minimum touch target on mobile |
| Keyboard | Full path for every action; no keyboard traps (except intentional modals with Esc) |
| Motion | Every animation gates on `prefers-reduced-motion` |
| Color | Meaning never hue-alone; see [`../governance/usage-guidelines.md`](../governance/usage-guidelines.md) |
| Icons | Decorative glyphs `aria-hidden="true"`; label on control |
| Images | Meaningful `alt`; decorative `alt=""` |
| Scroll containers | `tabindex="0"` + keyboard scroll where horizontal overflow is intentional |

## Component gate

Before shipping: [`../checklists/component-ready.md`](../checklists/component-ready.md)

## Verification

- Manual: keyboard-only pass, 400% zoom, both themes
- Automated: axe-core on case-study pages (see minimalist cloud.html audit in changelog)
- Screen reader: spot-check modals, skip link, live regions (AEGIS `#ag-live`)

## Case-study patterns

- `.shot__row` horizontal scroll: `tabindex="0"`, `role="group"`, descriptive `aria-label`
- AEGIS stage: `role="application"`, verb keys documented in `aria-label`
- Scoring modal: `role="dialog"`, `aria-modal="true"`, focus to close button on open
