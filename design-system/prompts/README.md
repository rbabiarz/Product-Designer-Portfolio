# Prompts

Reusable prompt templates for AI-assisted work on this portfolio. **Mirror rule:** when a
prompt changes, update both the file here and the matching [`.claude/commands/`](../../.claude/commands/)
or [`.claude/agents/`](../../.claude/agents/) entry in the same commit.

## Commands → prompts

| Slash command | Prompt file | Purpose |
|---|---|---|
| `/audit-tokens` | [`audit-tokens.md`](./audit-tokens.md) | Find hard-coded hex/px; map to tokens |
| `/new-case-study` | [`new-case-study.md`](./new-case-study.md) | Spec + scaffold + register a case study |
| `/new-page` | [`new-page.md`](./new-page.md) | New page or homepage variant |
| `/sync-scaffold` | [`sync-scaffold.md`](./sync-scaffold.md) | Align docs, tree, and build artifacts |

## Agents → prompts

| Agent | Prompt file | Purpose |
|---|---|---|
| Design critic | [`design-critic.md`](./design-critic.md) | Prioritized UI/system review |
| Implementer | [`implementer.md`](./implementer.md) | Build single-file HTML prototypes |
| Researcher | [`researcher.md`](./researcher.md) | Domain research → `reference/` |

## Workflow prompts (no slash command)

| Prompt | Purpose |
|---|---|
| [`case-study-review.md`](./case-study-review.md) | Pre-ship checklist (content + a11y + registration) |
| [`token-sync.md`](./token-sync.md) | After token edits — sync CSS, JSON, docs |
| [`release.md`](./release.md) | Pre-deploy GO/NO-GO gate |

## Prompt file format

Each prompt includes:

1. **Goal** — one sentence
2. **Inputs** — what to ask the user first
3. **Steps** — ordered checklist
4. **Copy-paste block** — ready for Claude/Cursor sessions
5. **Output format** — how to report results
6. **Cross-links** — checklists, workflows, rules

## Conventions (all prompts)

- Icons: **Material Symbols** `.msi` — never Lucide
- Tokens: `var(--…)` — never raw hex in component code
- Scripts: `scripts/a11y.js`, `scripts/analytics.js`, `scripts/cookie-banner.js`
- Audit file: [`WCAG-2.2-AODA-AUDIT.md`](../../WCAG-2.2-AODA-AUDIT.md)
- Design-system paths: `design-system/foundations/`, `components/`, `patterns/`, `governance/`

## Adding a new prompt

1. Create `prompts/<name>.md` following the format above
2. If it becomes a slash command, add [`.claude/commands/<name>.md`](../../.claude/commands/) pointing here
3. Index in this README
4. Note in [`releases/CHANGELOG.md`](../releases/CHANGELOG.md)
