# Rule: Design system

- **Never hardcode visual values in prototype code.** Reference a CSS custom property
  (`var(--bg)`, `var(--fg2)`, `var(--ac2)`, the spacing/radius vars). The portable mirror
  is `design-tokens.json` / `tokens/semantic.json`; the live source is `tokens.css` /
  `styles.css` / `design-system/colors_and_type.css`.
- If a needed token doesn't exist, add it at the right tier (primitive → semantic) rather
  than inlining a raw hex/px.
- **One color block per viewport. One accent per screen.** Accent is `--ac` / `--ac2`
  (teal family). `accent-magenta`-class brand colors are for at most one emphasis per screen.
- **Status never rides on hue alone**, and never uses saturated red / amber / stoplight-green.
  Coral `#e64d3c` is the strongest risk signal; pair every signal with text or shape.
- Reuse existing patterns before inventing new ones; new components follow the variant/state
  model in `design-system/components.md`.
- Naming: semantic over literal (`--ac2`/`fg.muted`, not `--teal-300`).
