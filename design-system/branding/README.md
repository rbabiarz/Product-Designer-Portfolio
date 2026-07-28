# Branding

Identity guidance for Robert Babiarz's product-design portfolio.

## Core identity

- **Name:** Robert Babiarz — Senior Product Designer
- **Narrative:** Connected-lighting / IoT → AI for complex systems; systems where error isn't an option
- **Live site:** https://robertbabiarz.com/

## Visual identity

| Element | Specification |
|---|---|
| **Wordmark / logo** | "RB" box — 34×34, radius 8, border `--line2` / `--c-b2`; links home |
| **Primary type** | Inter (headings), DM Sans (prose) |
| **System voice type** | JetBrains Mono — uppercase, tracked, for HUD/labels/eyebrows |
| **Accent** | Teal family: `#0d5350` (light) / `#4ca88f`–`#7dd3c0` (dark interactive) / `#5fc2a8` (case-study dark) |
| **Canvas** | Warm paper `#fffcf5` (light) · deep navy `#070b12` (interactive dark) |
| **Risk signal** | Coral `#e64d3c` — strongest alert; never stoplight red/green as status |

## Brand color cards

Use at most **one color block per viewport**. Brand cards in `tokens.css` (`pink`, `teal`,
`lavender`, `peach`, `ochre`, `mint`, `coral`) are for emphasis blocks and testimonials — not
default surfaces.

## Voice

Calm, evidence-led, no hype. Full rules: [`../../.claude/rules/content-voice.md`](../../.claude/rules/content-voice.md).

- Show judgment working; don't assert seniority
- Plain language; gloss jargon on first use
- Metrics label their source (observed vs design target)

## Research assets

Detailed brand research: [`../../reference/brand/guidelines.md`](../../reference/brand/guidelines.md),
[`../../reference/brand/logo/`](../../reference/brand/logo/), [`../../reference/moodboards/`](../../reference/moodboards/).

## Minimalist variant

The [`minimalist/`](../../minimalist/) surface uses a separate Figma-export token set
(Instrument Serif accent, `--surface-*` naming). Treat as a sibling brand expression — not a
override of root tokens.
