# Design reviews

Critique records for design-system and case-study work.

## Process

1. Run [`.claude/agents/design-critic.md`](../../.claude/agents/design-critic.md) or manual review against [`../governance/usage-guidelines.md`](../governance/usage-guidelines.md)
2. Log findings here as `YYYY-MM-DD-<subject>.md`
3. Resolve or track open items in [`docs/open-questions.md`](../../docs/open-questions.md)

## Review dimensions

- Token discipline (no hard-coded hex)
- One accent per screen
- Meaning without hue alone
- Keyboard + focus paths
- Reduced motion
- Content voice (plain language, sourced metrics)

## Example entry format

```markdown
# 2026-07-27 — DALI-2 showcase review
**Reviewer:** …
**Verdict:** ship with fixes

## Findings
- P1: …
- P2: …
```

No dated entries yet — add on next formal review pass.
