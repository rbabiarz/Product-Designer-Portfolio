# Design — Defence Portfolio

The north star and the rules of taste for this portfolio. Robert Babiarz's senior product-design portfolio — the connected-lighting (IoT security) → defense-AI narrative, told through interactive, code-level prototypes (AEGIS, CTOC, Light Architect, DALI-2, CORE Insights).

## North star
> Make a connected-lighting / IoT-security career read as credible defense-AI product
> design — in minutes, through interactive proof, not adjectives. The model brings
> receipts; the operator keeps the decision.

## Palette — dark-first defense (the chosen system)
Monochrome base, one considered accent per screen. A light "architect" theme mirrors it.

| Role | Dark (default) | Light |
|------|----------------|-------|
| Canvas / bg | `#070b12` | `#fffcf5` |
| Surface / bg2–bg3 | `#0c121e` → `#121a28` | `#f7f2e6` → `#ebe6d6` |
| Text fg / fg2 / fg3 | `#e9eef7` / `#8593a8` / `#97a3b8` | `#0a0a0a` / `#595959` / `#5e5e5e` |
| Hairline | `rgba(255,255,255,.08–.15)` | `rgba(0,0,0,.09–.16)` |
| Accent (ac / ac2) | `#4ca88f` / `#7dd3c0` | `#0d5350` / `#4ca88f` |

Brand color cards (used sparingly, one block per viewport): teal `#0d5350`, mint `#4ca88f`,
lavender `#8b6fd9`, ochre `#d4a036`, peach `#ff9d66`, coral `#e64d3c`, pink `#d63b75`.

## Principles
1. **Read the trace, not the number.** Show evidence and sources, not just a verdict — the
   AEGIS thesis, applied to the portfolio itself.
2. **Systems, not screens.** Every value traces to a token; design the empty / loading /
   error / longest-content state, not just the happy path.
3. **One idea per view; one accent per screen.** If a screen needs a legend, it's doing too much.
4. **Meaning survives without color.** Never signal status by hue alone; no saturated
   red / amber / stoplight-green as status. Coral is the strongest risk signal.
5. **Accessible by default** — WCAG 2.2 AA / AODA. See
   [`.claude/rules/accessibility.md`](./.claude/rules/accessibility.md) and `WCAG-2.2-AODA-AUDIT.md`.
6. **Motion with intent.** Animate to explain a state change; respect `prefers-reduced-motion`.

## Voice & tone
Summarized here; full guidance in
[`.claude/rules/content-voice.md`](./.claude/rules/content-voice.md). Calm, evidence-led,
defense-literate without cosplay. Confident, never hype.

## How design connects to build
Foundations and components are documented in [`design-system/`](./design-system/) and
implemented as single-file prototypes (`.dc.html` via the DC runtime). Decisions are
recorded in [`docs/design-decisions.md`](./docs/design-decisions.md).
