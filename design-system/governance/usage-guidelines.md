# Usage guidelines

Do / don't for applying the system. Grounded in shipped prototypes and
[`../../.claude/rules/`](../../.claude/rules/).

## Tokens
- **Do** reference CSS custom properties (`var(--bg)`, `var(--ac2)`, `var(--spacing-lg)`,
  `var(--rounded-pill)`). **Don't** hardcode raw hex/px — add a token at the right layer
  (`tokens.css` foundation, inline `:root` surface role, or `--c-*` case-study role).
- **Do** keep foundational scale and per-surface palettes separate. **Don't** invent a new accent
  per component.
- **Do** treat [`tokens.css`](../../tokens.css) as canonical; sync
  [`foundations/colors_and_type.css`](../foundations/colors_and_type.css) after edits.

## Color & meaning
- **Do** keep **one accent per screen** and **one color block per viewport**.
- **Do** make meaning survive without color — pair every signal with text, shape, or icon.
- **Don't** use saturated red / amber / stoplight-green *as status* on portfolio surfaces. Coral
  `#e64d3c` is the strongest risk signal. CTOC severity is the domain exception — always paired
  with square/label.

## Type & layout
- **Do** use Inter for headings, DM Sans for prose, JetBrains Mono for HUD/labels (UPPERCASE +
  tracking), VT323 for retro only. **Do** use tabular nums for readouts.
- **Do** hold the type and spacing scale; **don't** introduce off-scale sizes.

## Components & states
- **Do** reuse an existing pattern before authoring a new one; CTAs are always pill-shaped.
- **Do** design empty / loading / error / longest-content states, not just the happy path.
- **Don't** ship an interaction without a keyboard path and visible `:focus-visible` ring.

## Icons
- **Do** use Material Symbols: `<span class="msi" aria-hidden="true">icon_name</span>`.
- **Don't** use Lucide, Font Awesome, or hand-authored SVG paths for UI chrome.
- **Do** put `aria-label` on the control, not the decorative glyph.

## Motion
- **Do** animate to explain a state change or direct attention. **Do** gate on
  `prefers-reduced-motion` in every animated component.
- **Don't** add decorative motion that can't degrade.

## Robustness (no-build, embeddable)
- **Do** keep prototypes self-contained: inline CSS/JS, only declared CDN deps, no build step.
- **Do** anchor in-stage overlays to their stage (`position:absolute`), not the viewport.
- **Do** wrap each init in `try/catch` and guard `localStorage`.
- **Do** load support scripts from `scripts/` (`a11y.js`, `analytics.js`, `cookie-banner.js`).

## Documentation hygiene
- **Do** update [`docs/changelog.md`](../../docs/changelog.md) when shipping visible changes.
- **Do** run `/sync-scaffold` after folder moves or new case studies.
- **Do** log non-obvious calls in [`docs/design-decisions.md`](../../docs/design-decisions.md).
