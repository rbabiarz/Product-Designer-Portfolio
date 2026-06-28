# Components & shared modules

This portfolio is built as **single-file `.html` / `.dc.html` prototypes** — most "components"
live inline in the page that uses them, and their contracts are documented in
[`../../design-system/components.md`](../../design-system/components.md).

Shared, reused runtime modules live at the **repo root** and are the closest thing to a component
library here:

- `support.js` — the DesignCode (DC) runtime: parses `<x-dc>` markup and renders with React.
- `home-variants.js` — the homepage VIEW switcher (remembers the choice).
- `page-transition.js` · `text-motion.js` · `a11y.js` — transitions, type motion, a11y helpers.

Use `primitives/` and `patterns/` here only for genuinely extracted, shared component code.
Conventions: inline-first, `var(--…)` tokens, Lucide icons, no build — see
[`../../.claude/rules/code-style.md`](../../.claude/rules/code-style.md).
