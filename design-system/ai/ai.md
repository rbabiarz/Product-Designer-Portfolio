# AI guidance

How AI collaborators work in this repo.

## Entry points

| File | Read order |
|---|---|
| [`CLAUDE.md`](../../CLAUDE.md) | First — project overview |
| [`DESIGN.md`](../../DESIGN.md) | Full design reference |
| [`design-system/README.md`](../README.md) | Split doc index |
| [`PRODUCT.md`](../../PRODUCT.md) | Product north star |

## Always-on rules

[`.claude/rules/`](../../.claude/rules/): `design-system`, `accessibility`, `code-style`, `content-voice`

## Commands & prompts

| Slash command | Full prompt |
|---|---|
| `/sync-scaffold` | [`prompts/sync-scaffold.md`](../prompts/sync-scaffold.md) |
| `/audit-tokens` | [`prompts/audit-tokens.md`](../prompts/audit-tokens.md) |
| `/new-case-study` | [`prompts/new-case-study.md`](../prompts/new-case-study.md) |
| `/new-page` | [`prompts/new-page.md`](../prompts/new-page.md) |

| Agent | Full prompt |
|---|---|
| Design critic | [`prompts/design-critic.md`](../prompts/design-critic.md) |
| Implementer | [`prompts/implementer.md`](../prompts/implementer.md) |
| Researcher | [`prompts/researcher.md`](../prompts/researcher.md) |

Additional workflow prompts: [`prompts/case-study-review.md`](../prompts/case-study-review.md),
[`prompts/token-sync.md`](../prompts/token-sync.md), [`prompts/release.md`](../prompts/release.md).

**Index:** [`prompts/README.md`](../prompts/README.md)

## Generated content rules

1. Material Symbols `.msi` — never Lucide in new code
2. `var(--…)` tokens — never raw hex in prototypes
3. Single-file HTML — inline CSS/JS, no build step
4. Log decisions in `docs/design-decisions.md`
5. Update `docs/changelog.md` when shipping
6. Mirror prompt changes in `.claude/commands/` and `design-system/prompts/`

## MCP

[`.mcp.json`](../../.mcp.json) — shared tool config. Personal overrides gitignored.
