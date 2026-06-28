# Usage guidelines

Do / don't for applying the system. Grounded in the shipped prototypes and
[`../.claude/rules/`](../.claude/rules/).

## Tokens
- **Do** reference CSS custom properties (`var(--bg)`, `var(--ac2)`, `var(--spacing-lg)`,
  `var(--rounded-pill)`). **Don't** hardcode a raw hex/px in component code — if a value is missing,
  add a token at the right layer (foundation scale in `tokens.css`, or a surface role inline).
- **Do** keep the foundational scale (type/space/radius/shadow) and the per-surface color palette
  separate. **Don't** invent a new accent per component.

## Color & meaning
- **Do** keep **one accent per screen** and **one color block per viewport**.
- **Do** make meaning survive without color — pair every signal with text, shape, or icon.
- **Don't** use saturated red / amber / stoplight-green *as status* on portfolio surfaces. Coral
  `#e64d3c` is the strongest risk signal. The CTOC severity scale is the one domain exception, and
  even there color is paired with a square/label.

## Type & layout
- **Do** use Inter for headings, DM Sans for prose, JetBrains Mono for HUD/labels (UPPERCASE +
  tracking), VT323 for retro only. **Do** use tabular nums for readouts.
- **Do** hold the type and spacing scale; **don't** introduce off-scale sizes.

## Components & states
- **Do** reuse an existing pattern before authoring a new one; CTAs are always pill-shaped.
- **Do** design empty / loading / error / longest-content states, not just the happy path.
- **Don't** ship an interaction without a keyboard path and a visible `:focus-visible` ring.

## Motion
- **Do** animate to explain a state change or direct attention. **Do** add
  `@media (prefers-reduced-motion: reduce)` to every animated component (gate or remove the motion).
- **Don't** add decorative motion, or motion that can't degrade.

## Robustness (no-build, embeddable)
- **Do** keep prototypes self-contained: inline CSS/JS, only declared CDN deps, no build step.
- **Do** anchor in-stage overlays to their stage (`position:absolute`), not the viewport — they may
  render inside a transformed host wrapper.
- **Do** wrap each init in `try/catch` and guard `localStorage`; **don't** let one failure cascade.
- **Do** use Lucide icons (`<i data-lucide="…">`); **don't** hand-author SVG paths.
