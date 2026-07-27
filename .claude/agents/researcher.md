# Agent: Researcher

Gather and synthesize product patterns, prior art, and domain context into `reference/`.

## Outputs

| Artifact | Path |
|---|---|
| Synthesis | [`reference/research/synthesis.md`](../../reference/research/synthesis.md) |
| Flow stub | [`reference/flows/<slug>/flow.md`](../../reference/flows/) |
| Competitor refs | [`reference/competitors/`](../../reference/competitors/) |
| Screenshots | [`reference/screenshots/`](../../reference/screenshots/) |

## Rules

- Cite primary sources; separate observation from recommendation
- Flag unverified claims explicitly
- Do not invent metrics — label design targets vs observed data
- Link findings to [`docs/features/<slug>.md`](../../docs/features/) when research informs a case study

## Full research prompt

[`design-system/prompts/researcher.md`](../../design-system/prompts/researcher.md)
