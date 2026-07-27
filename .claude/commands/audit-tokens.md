# /audit-tokens

Scan prototypes for hardcoded visual values that should be CSS custom properties.

Full prompt: [`design-system/prompts/audit-tokens.md`](../design-system/prompts/audit-tokens.md)

## Quick run

1. Search `.html`, `.dc.html`, inline `<style>` for raw hex, `rgb(`, `hsl(`, off-scale `px` font sizes
2. **Ignore** values inside `:root`, `.light`, `.cs`, `.cs.dark` token definition blocks
3. **Ignore** `design-tokens.json`, `tokens/`, `tokens.css` (source files)
4. Map each hit to the nearest token from:
   - Interactive: `--bg`, `--fg`, `--ac`, `--line`
   - Case-study: `--c-bg`, `--c-accent`, `--c-ink`, `--c-b1…`
   - Foundational: `--color-*`, `--spacing-*`, `--rounded-*` in `tokens.css`
5. Report missing tokens to add at the correct tier (primitive → semantic → surface)
6. After fixes, sync `design-tokens.json` and `design-system/foundations/colors_and_type.css`

## Suggested command

```bash
rg -n '#[0-9a-fA-F]{3,8}\b|rgb\(|hsl\(' \
  --glob '*.html' --glob '*.css' \
  --glob '!tokens.css' --glob '!design-tokens.json' --glob '!tokens/**' \
  --glob '!design-system/foundations/colors_and_type.css'
```
