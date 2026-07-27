# Token documentation

## Canonical source hierarchy

1. **[`tokens.css`](../../tokens.css)** — edit here first. Foundational scale loaded by CTOC dashboard.
2. **[`design-tokens.json`](../../design-tokens.json)** — portable mirror with `_meta` and `live_sources`.
3. **[`tokens/`](../../tokens/)** — three-tier JSON split:
   - `primitives.json` — raw hex, space, radius, font names
   - `semantic.json` — `--bg/--fg/--ac` role maps (Interactive dark)
   - `themes/dark.json` + `themes/light.json` — Interactive palettes
4. **[`foundations/colors_and_type.css`](../foundations/colors_and_type.css)** — read-only mirror of
   `tokens.css`; sync after every token edit.

## Not in `tokens.css`

These palettes are **inline per page** — document changes in [`foundations/foundations.md`](../foundations/foundations.md)
and mirror to JSON manually if needed:

| Family | Tokens | Where declared |
|---|---|---|
| Interactive | `--bg`, `--fg`, `--ac`, `--line` | `:root` / `.light` in each `.dc.html` |
| Case-study shell | `--c-bg`, `--c-accent`, `--c-ink`, … | `.cs` / `.cs.dark` in each `*-showcase.html` |
| Dossier / Retro | hardcoded hex | respective homepage files |
| Spot Studios | `--color-*`, `--space-*` | `spotstudios/styles.css` |

## Naming convention

Semantic over literal: `--ac2`, `--c-accent`, `fg.muted` — never `--teal-300`.

## Audit

Run `/audit-tokens` or:

```bash
rg -n '#[0-9a-fA-F]{3,8}\b' --glob '*.html' --glob '*.css' \
  --glob '!tokens.css' --glob '!design-tokens.json' --glob '!tokens/**'
```

Hard-coded values should become `var(--…)` at the appropriate tier.

## Related

- Foundations rationale: [`../foundations/foundations.md`](../foundations/foundations.md)
- Usage rules: [`../governance/usage-guidelines.md`](../governance/usage-guidelines.md)
- Live inspector: `design-system.html` § Token Architecture (`ds-live.js`)
