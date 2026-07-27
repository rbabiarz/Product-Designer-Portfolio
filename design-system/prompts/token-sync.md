# Prompt: Token sync

After editing `tokens.css` or any surface `:root` block — keep all mirrors aligned.

## When to run

- Added/changed a color, spacing, radius, or shadow token
- Renamed a semantic role (`--ac`, `--c-accent`, …)
- After `/audit-tokens` reports missing tokens

## Steps

1. **Edit canonical source**
   - Foundational: [`tokens.css`](../../tokens.css)
   - Surface role: inline in the page family that owns it

2. **Mirror to JSON**
   - [`design-tokens.json`](../../design-tokens.json) — update `_meta.updated`
   - [`tokens/primitives.json`](../../tokens/primitives.json) if raw value
   - [`tokens/semantic.json`](../../tokens/semantic.json) if role map
   - [`tokens/themes/dark.json`](../../tokens/themes/dark.json) / `light.json` if Interactive palette

3. **Sync CSS copy**
   - [`design-system/foundations/colors_and_type.css`](../foundations/colors_and_type.css) must match `tokens.css`

4. **Update docs**
   - [`design-system/foundations/foundations.md`](../foundations/foundations.md) if new role or palette
   - [`DESIGN.md`](../../DESIGN.md) if principle-level change
   - [`design-system/releases/CHANGELOG.md`](../releases/CHANGELOG.md)

5. **Verify**
   - Run [`audit-tokens.md`](./audit-tokens.md) — no new violations
   - Check `design-system.html` token inspector still resolves correctly
   - Both themes if Interactive or case-study shell

## Prompt (copy-paste)

```
Token change: <describe what changed>

Sync across:
- tokens.css (canonical)
- design-tokens.json + tokens/
- design-system/foundations/colors_and_type.css
- foundations/foundations.md + DESIGN.md if user-visible
- design-system/releases/CHANGELOG.md

Run audit-tokens scan on affected pages. Report any pages still using old values.
```

## Do not

- Edit `colors_and_type.css` first (it's a mirror, not canonical)
- Add tokens to JSON without updating live CSS
- Mix Minimalist tokens into root `tokens.css`
