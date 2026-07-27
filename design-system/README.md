# Design system

Documented rules for a consistent look and feel across the portfolio.

## Live sources (runtime)

| Artifact | Role |
|---|---|
| [`tokens.css`](../tokens.css) | **Canonical** foundational scale |
| [`styles.css`](../styles.css) | CTOC/SOC dashboard skin |
| Inline `:root` / `.light` | Interactive homepage + hub pages |
| Inline `.cs` / `.cs.dark` | Case-study showcase shell (`--c-*`) |
| [`case-shot.css`](../case-shot.css) | Shared screenshot frame shadows |
| [`minimalist/styles.css`](../minimalist/styles.css) | Isolated Minimalist surface |

Portable mirror (not runtime): [`design-tokens.json`](../design-tokens.json), [`tokens/`](../tokens/).

## Start here

| Need | Read |
|---|---|
| Color, type, spacing | [`foundations/foundations.md`](./foundations/foundations.md) |
| Component contracts | [`components/components.md`](./components/components.md) |
| Layout, theming, motion | [`patterns/patterns.md`](./patterns/patterns.md) |
| Do / don't | [`governance/usage-guidelines.md`](./governance/usage-guidelines.md) |
| Token source hierarchy | [`tokens/README.md`](./tokens/README.md) |
| Folder map | [`architecture/directory-structure.md`](./architecture/directory-structure.md) |
| Keep docs current | [`workflows/scaffold-maintenance.md`](./workflows/scaffold-maintenance.md) |
| AI prompts | [`prompts/README.md`](./prompts/README.md) |

## Folder map

```
design-system/
├── foundations/      color, type, spacing — the "why" + colors_and_type.css mirror
├── tokens/           token docs (live: ../tokens.css + ../design-tokens.json)
├── components/       component catalog (inline implementations, documented contracts)
├── patterns/         layout, theming, motion, robustness
├── templates/        full-page templates (stub — copy from existing showcase shells)
├── governance/       usage guidelines, contribution rules
├── workflows/        scaffold maintenance, adding case studies
├── checklists/       release + component-ready gates
├── architecture/     directory structure, relocation history
├── accessibility/    WCAG targets + audit pointers
├── motion/           animation inventory + PRM contract
├── content/          UX-writing standards
├── analytics/        GA4 + consent conventions
├── ai/               Claude/agent integration
├── audits/           audit log pointers
├── branding/         identity + reference/brand link
├── implementation/   no-build HTML stack
├── releases/         design-system changelog
└── prompts/          audit-tokens, new-case-study, sync-scaffold, design-critic, … (10 prompts)
```

## Surfaces at a glance

| Surface | Token prefix | Example pages |
|---|---|---|
| Interactive | `--bg`, `--fg`, `--ac` | `homepage-interactive.dc.html`, `about.dc.html` |
| Case-study shell | `--c-*` | `dali-2-showcase.html`, `design-system.html` |
| CTOC | `--color-*`, `--sev-*` | `ctoc-dashboard.html` + `styles.css` |
| Dossier / Retro | hardcoded | `homepage-dossier.dc.html`, `homepage-retro.dc.html` |
| Minimalist | `--color-*`, `--space-*` | `minimalist/*.html` |

## Maintenance

Run **`/sync-scaffold`** after structural changes. Minimum after every case study:
changelog → search index → colophon → component doc if new patterns shipped.
