# Foundations

The visual primitives, all driven by tokens (`design-tokens.json` / `tokens/`; live in
`tokens.css` / `colors_and_type.css`).

## Color
Dark-first. Roles: canvas (`--bg`), surface (`--bg2/3`), text (`--fg/2/3`), accent
(`--ac/--ac2`, teal), hairline (`--line/2`). One color block per viewport; one accent per screen.
Status never by hue alone; coral is the strongest risk signal.

## Typography
Inter / DM Sans for prose; JetBrains Mono for HUD/system labels. Hold a fixed type scale.

## Spacing & layout
4px base scale. Document grids and breakpoints; layouts hold mobile → wide.

## Elevation
Soft, long shadows on dark (`0 30px 80px -40px rgba(0,0,0,.8)`); use sparingly.

## Radius
Pill (`999px`) for CTAs; `12–16px` for cards/stages.
