# Migrations

Guides for breaking changes and version upgrades of the design system.

## 2026-07-27 — Flat docs → subfolders

| Old path | New path |
|---|---|
| `design-system/foundations.md` | `design-system/foundations/foundations.md` |
| `design-system/colors_and_type.css` | `design-system/foundations/colors_and_type.css` |
| `design-system/components.md` | `design-system/components/components.md` |
| `design-system/patterns.md` | `design-system/patterns/patterns.md` |
| `design-system/usage-guidelines.md` | `design-system/governance/usage-guidelines.md` |

## 2026-07-27 — Scripts → `scripts/`

Update HTML script tags:

```html
<!-- before -->
<script src="a11y.js"></script>

<!-- after -->
<script src="scripts/a11y.js"></script>
```

Build commands: `python3 scripts/build-search-index.py`, `python3 scripts/build-colophon.py`.

## Future migrations (placeholder)

When Interactive and case-study token families merge, document the `--bg` → `--c-*` mapping here
before executing.
