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
