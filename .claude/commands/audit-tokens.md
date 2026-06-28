# /audit-tokens

Scan the `.html` / `.dc.html` prototypes for hardcoded visual values — raw hex colors,
px spacing, raw font sizes — that should reference a CSS custom property. Report each with
the suggested token from `tokens/semantic.json` / `tokens.css`, and flag any missing token
to add. Ignore values inside `:root`/`.light` token definitions themselves.
