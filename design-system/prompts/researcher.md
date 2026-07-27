# Prompt: Researcher

**Agent:** [`.claude/agents/researcher.md`](../../.claude/agents/researcher.md)

## Goal

Gather domain context, competitor patterns, and prior art — synthesize into `reference/` without
inventing metrics or over-claiming.

## Research prompt (copy-paste)

```
Research <TOPIC> for a portfolio case study about <PROJECT>.

Deliverables:
1. reference/research/synthesis.md — update or append a dated section
2. reference/flows/<slug>/flow.md — user journey if new
3. reference/competitors/ — note any UI patterns worth citing (screenshots optional)

Rules:
- Cite primary sources (product docs, patents, standards — not blogs alone)
- Separate OBSERVATION from RECOMMENDATION
- Flag UNVERIFIED claims explicitly
- No invented metrics — label design targets vs company-era context
- Link to docs/features/<slug>.md when research informs the case study thesis

Voice: calm, evidence-led (see .claude/rules/content-voice.md)
```

## Output structure (synthesis.md)

```markdown
## <Topic> — YYYY-MM-DD

### Context
…

### Observations (sourced)
- … [source]

### Patterns worth citing
| Product | Pattern | Relevance |

### Implications for <project>
…

### Unverified / open
- …
```

## Related prompts

- Case study kickoff: [`new-case-study.md`](./new-case-study.md)
- Design review after research → prototype: [`design-critic.md`](./design-critic.md)
