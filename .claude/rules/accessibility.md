# Rule: Accessibility

Target **WCAG 2.2 AA / AODA**. Standing audit: [`WCAG-2.2-AODA-AUDIT.md`](../../WCAG-2.2-AODA-AUDIT.md) — keep current.

Full guidance: [`design-system/accessibility/accessibility.md`](../../design-system/accessibility/accessibility.md)

## Requirements

- Text contrast ≥ 4.5:1 (≥ 3:1 large text / UI). Both Interactive dark (`#e9eef7` on `#070b12`)
  and light themes are AA — don't regress.
- Every interactive element keyboard reachable with **visible `:focus-visible`**
  (2–3px accent ring, offset 2–3px).
- Hit targets ≥ 44×44px (nav, AEGIS verb rail, switchers).
- **`prefers-reduced-motion`** — marquee, reveal, parallax, game motion, retro CRT all gate on it.
  `scripts/a11y.js` injects global duration ≈0 under PRM.
- **Meaning survives without color** — pair hue with text/icon/shape; no color-only status.
- Label all controls; `aria-live="polite"` for dynamic score/state; meaningful `alt` on images.
- Horizontal scroll containers: `tabindex="0"`, `role="group"`, descriptive `aria-label`.

## Review prompts

- [`design-system/prompts/design-critic.md`](../../design-system/prompts/design-critic.md)
- [`design-system/prompts/case-study-review.md`](../../design-system/prompts/case-study-review.md)
