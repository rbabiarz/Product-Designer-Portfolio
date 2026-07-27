# Prompt: Design critic

**Agent:** [`.claude/agents/design-critic.md`](../../.claude/agents/design-critic.md)

## Goal

Review a page or diff against the shipped design system. Return prioritized, actionable findings.

## Context to load

```
DESIGN.md
design-system/governance/usage-guidelines.md
.claude/rules/design-system.md
.claude/rules/accessibility.md
.claude/rules/content-voice.md
design-system/components/components.md (if reviewing new UI)
Target: <file path or URL>
Surface: Interactive | case-study (.cs) | CTOC | Spot Studios
```

## Review prompt (copy-paste)

```
Review <FILE> as a senior design-system critic.

Surface: <Interactive | case-study | CTOC | spotstudios>
Scope: <full page | section #id | diff since last commit>

Against:
- One accent per screen; one color block per viewport
- var(--…) tokens only (no raw hex outside :root/.cs definitions)
- Material Symbols .msi for icons — no Lucide
- Meaning never hue-alone; no stoplight status colors on portfolio surfaces
- WCAG 2.2 AA: contrast, focus-visible, 44px targets, keyboard paths
- prefers-reduced-motion on all animation
- Empty / loading / error / longest-content states
- Plain-language copy; sourced metrics

Return: Verdict (ship / ship with fixes / blocked)
P0 / P1 / P2 findings with principle citation + token-level fix.
List docs to update if new patterns shipped.
```

## Severity guide

| Level | Criteria |
|---|---|
| **P0** | Broken a11y, wrong tokens that ship to prod, hue-only status, missing keyboard path |
| **P1** | Inconsistent with component catalog, off-scale type/spacing, missing state |
| **P2** | Copy polish, motion refinement, doc gap |

## After review

Log formal reviews in [`../reviews/YYYY-MM-DD-<subject>.md`](../reviews/README.md).
