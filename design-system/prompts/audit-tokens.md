# Prompt: Audit tokens

**Command:** `/audit-tokens` · **Rule:** [`.claude/rules/design-system.md`](../../.claude/rules/design-system.md)

## Goal

Find hardcoded visual values in prototype code and map them to the correct CSS custom property — or
add a missing token at the right tier.

## Canonical sources (edit order)

1. [`tokens.css`](../../tokens.css) — foundational scale
2. Per-page `:root` / `.light` / `.cs` / `.cs.dark` — surface roles
3. [`design-tokens.json`](../../design-tokens.json) + [`tokens/`](../../tokens/) — mirror
4. [`design-system/foundations/colors_and_type.css`](../foundations/colors_and_type.css) — sync copy

## Scan scope

**Include:** `*.html`, `*.dc.html`, inline `<style>`, page-specific `.css` (not token sources)

**Exclude:**
- Token definition blocks (`:root`, `.light`, `.cs`, `.cs.dark` property declarations)
- `tokens.css`, `design-tokens.json`, `tokens/**`
- `design-system/foundations/colors_and_type.css`
- Illustration SVGs and exported assets under `assets/`, `minimalist/assets/`

## Search patterns

```bash
rg -n '#[0-9a-fA-F]{3,8}\b' --glob '*.html' --glob '*.css' \
  --glob '!tokens.css' --glob '!design-tokens.json'

rg -n '\b\d+px\b' --glob '*.html' | rg -v ':root|\.cs|\.light'
```

## Token mapping guide

| If you find… | Map to… |
|---|---|
| Background fill in Interactive page | `var(--bg)`, `var(--bg2)`, `var(--bg3)` |
| Text on Interactive page | `var(--fg)`, `var(--fg2)`, `var(--fg3)` |
| Accent / CTA fill | `var(--ac)` or `var(--ac2)` |
| Case-study surface | `var(--c-bg)`, `var(--c-surface)`, `var(--c-accent)`, … |
| Spacing / padding | `var(--spacing-md)` etc. from `tokens.css` |
| Border radius on CTA | `var(--rounded-pill)` or `999px` (pill is intentional) |
| Border radius on card | `--rounded-xl` (16px) or case-study convention (18px) |

## Output format

```markdown
## Token audit — YYYY-MM-DD

### Violations (fix required)
| File:line | Found | Suggested token | Tier |
|---|---|---|---|

### Missing tokens (add to source)
| Proposed name | Value | Tier | File to edit |

### Clean files
- …
```

## After fixes

- [ ] Sync `design-tokens.json` and `colors_and_type.css`
- [ ] Log in `design-system/audits/YYYY-MM-DD-token-sweep.md` if non-trivial
- [ ] Note in `docs/changelog.md` if user-visible palette changed
