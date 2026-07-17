# Changelog — Product Designer Portfolio

## 2026-06-28
- Product-design "deep dive" structure scaffolded into the repo (docs, tokens, design-system,
  .claude rules/agents/commands, reference). Existing prototypes untouched.

## 2026-07-10
- AEGIS GIMS case study added end to end: quick tour + deep dive pages on the shared case-study
  shells, live v2 prototype embed, preview tile (recon motif), and registration across switchers,
  all three homepages, the work index, the concierge, search index, and sitemap. Copy carried over
  verbatim from the interview-design-solution repo; all metrics labeled as design targets.

## 2026-07-12
- Parlay Games iGaming case study (#09) added end to end: quick tour + deep dive pages built from
  the prior Figma case study (copy, stats, and imagery extracted from it), preview tile, and
  registration across switchers, all three homepages, the work index (including lobby mode), the
  concierge, search index, and sitemap. Company-level figures labeled as Parlay-era context.
- Light ARchitect case study (#06) inserted after Smart Lighting, renumbering 06–09 → 07–10 across
  every surface (work index/carousel/lobby, all three homepages, 18 case-page switchers). Quick
  tour + deep dive built from the sanitized older case study, public patents, and the 301-screen
  export library; the deep dive ships three working simulations (photometric sandbox, AI
  AutoLayout two-stage loop, IES filter-before-load), all keyboard-operable and reduced-motion
  safe. Homepage "Case study coming soon" pill promoted to a live link; product name corrected to
  "Light ARchitect" in visible copy site-wide; work-index carousel count fixed (card 10 was
  previously unreachable). No Jira/Confluence text, ticket ids, or internal system names carried
  over — patents are the only verbatim source.

## 2026-07-14
- Light ARchitect case study scoped to released features only: ISO-contour and admin-platform
  content removed from both pages (quick tour photometrics band and "Run as a product" section;
  deep dive "Run as a Product" section, super-admin persona, and ISO shot — sections renumbered
  to 11, users reframed as four). The CORE "where it went next" cross-link moved into the AI
  AutoLayout section. Six now-unreferenced screenshots deleted from assets/la/; retro homepage
  and concierge copy updated; search index regenerated. AutoLayout demo generators also rewritten
  grid-true (poles snap to footcandle cell centres; no randomness).

## 2026-07-16
- Site colophon added to every page: a build-record strip above the page end showing site
  founding date, real GitHub Pages deployment count and last-deploy date, a derived version
  number (generation · case studies · commits), last-updated date, the toolchain, and the
  zero-build / AI-paired architecture story. Rendered by `colophon.js`, generated from git
  history and the GitHub deployments API by `build-colophon.py` — every stat derived, none
  typed. Regenerate per release alongside the search index.
- Parlay deep dive gains "Parlay Reels" (section 04 · Try It): a fully interactive, honest 5×3
  five-payline demo slot built on the case study's recovered avatar set — wild, scatter, free
  spins ×3, turbo, paytable dialog publishing the uniform reel-strip composition, and math
  exact by full reel enumeration, cross-checked over 10,000,000 simulated spins (RTP 96.04%,
  hit ≈1 in 4.1, free spins ≈1 in 211).
  Researched against 2025-26 slot conventions (Pragmatic/NetEnt/Hacksaw-era UI anatomy, win
  presentation, RG surfaces; Mobbin has no real iGaming — nearest analogs noted in-session).
  Ethically inverted by design and annotated in-game: no LDW celebrations, no engineered
  near-misses, no autoplay or stop button, truthful sound, session ledger + 50-spin reality
  check, each annotation citing the research (Dixon et al.; Kassinove & Schare; Clark et al.;
  Harrigan; Ladouceur & Sévigny). Engine in `parlay-slot.js`; sections renumbered 04-11 → 05-12.
- Custom cursor now behaves identically across all three homepages (interactive is the reference).
  Root cause: a local `var probe = […]` array in `cursor.js`'s accent-fallback path shadowed the
  hoisted `probe(x,y)` function, so `setState` threw `probe is not a function` on every page without
  an `--ac` token — silently killing the active/plate/move cursor states on dossier, retro,
  core-insights, and fintech-walkthrough (interactive has the token and skipped the fallback). Renamed
  the array to `swatches`. Also gave dossier (`--ac:#b23a2e` stamp-red) and retro (`--ac:#6cf0a4`
  phosphor) explicit accent tokens so their cursor themes deterministically per page instead of via a
  fragile DOM colour-probe. Verified in-browser: active-on-hover, white-over-map, and directional
  move-over-luminaire states now fire on all three, accent themed per page, zero console errors.

## 2026-07-17
- Added a CLS image-rights notice below the build record on every page: "All images in case
  studies from CLS are © 2026 Signify – Cooper Lighting Canada Limited. All rights reserved."
  Generated by `build-colophon.py` into `colophon.js`, so it ships site-wide from one source.

## 2026-07-17 (2)
- Unified the colophon's background across every page: the dossier homepage's dark-navy strip
  (#0b1016) is now the fixed palette everywhere, replacing the per-page token-following /
  luminance-detection logic — the build record no longer shifts color with the host page's
  light/dark theme. Simplified `build-colophon.py` accordingly (dropped `paintedBg`/`pageIsDark`;
  mount-location logic is now fully decoupled from coloring). Also added a "View source on GitHub"
  link in the colophon header, pointing at the repo, keyboard-focusable with a visible focus ring.
