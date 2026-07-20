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

## 2026-07-18
- Fixed the interactive homepage's Light ARchitect zoom stepper: the "+"/"−" controls next to the
  fake search field had no click handler at all — pure decorative map chrome. Converted them to
  real, keyboard-operable `<button>`s and wired them to actually scale the photometric plate and
  underlying site art together (0.8x-1.3x, center-anchored). The scale factor is folded into
  `initLAInteract`'s `geom()` so drag/add/remove luminaire placement stays pixel-accurate at any
  zoom level (verified: sub-pixel placement error at 0.8x, 1.0x, and 1.3x). Zoom resets to 1x with
  the existing "RESET" control; buttons disable at each bound.

## 2026-07-18 (2)
- Fixed Arctic Shield's Operation Debrief (and menu / between-wave interstitial) clipping in phone
  LANDSCAPE: those overlays only got top-align + scroll from a `max-width:560px` media query, but
  landscape phones are usually wider than 560px while short in height, so the tall debrief content
  (title, score, stats grid, high-scores, callsign, XP bar, then Retry/Menu) centered and pushed
  Retry + Menu off the bottom with no way to scroll to them. Added a `max-height:520px` query
  applying the same fix. Shipped as a small external `arctic-landscape-fix.js` referenced by a
  plain `<script src>` because editing the bundled page's own `<style>` block corrupts its runtime
  templating (a JSON round-trip strips the `\/` escaping the template relies on). One fix covers
  all three homepages, which all iframe the same `arctic-shield.html`. Verified end to end: real
  playthrough to game-over at 844×390, scroll reveals Retry, a real click fires it. The homepage
  on-page drills were checked and need no change (their overlay fits the 544px-min stage).

## 2026-07-18 (3)
- Fixed the Parlay Reels paytable modal. It's a native <dialog>, but the page's global *{margin:0}
  reset killed the UA :modal `margin:auto`, so it pinned to the top-left corner instead of
  centering; and because a modal <dialog> renders in the browser top layer (above the custom
  cursor's own layer) while cursor.js hides the native cursor, there was no visible pointer over
  it. Restored `margin:auto` (re-centers), made it a flex column with viewport-relative
  `width:min(660px,100vw-32px)` / `max-height:min(88vh,760px)` so it scales with the screen and
  the body scrolls, and while it's open hand the pointer back to the native cursor and hide the
  stuck custom one (via a `psl-modal-open` class). Also added backdrop-click-to-close and a gentle
  reduced-motion-gated entrance. Verified centered + scaling at 5 sizes (incl. landscape/320px),
  light + dark, with Escape / backdrop / Close all clearing state and the custom cursor returning
  on the next mouse move.

## 2026-07-18 (4)
- Fixed a regression from the paytable centering fix above: `.psl-dlg{display:flex}` was
  unconditional, which overrides the browser's built-in `dialog:not([open]){display:none}` default
  (author CSS always wins over the UA stylesheet) — so the dialog rendered open from page load
  regardless of showModal()/close(), and nothing could close it since display:flex kept showing it
  no matter what the `open` attribute said. Moved `display:flex` (and the position/margin/animation
  that only matter while shown) under a `.psl-dlg[open]` selector, leaving only inert visual styling
  (border, background, sizing) on the bare selector. Verified: hidden at load, Paytable button
  opens + centers it, Close/Escape/backdrop all close it for real, reopens cleanly, centering and
  scaling hold across 5 sizes and both themes, reduced-motion path unaffected.

## 2026-07-19
- The Design System added as case study #11 — the site documenting itself. Quick tour
  (`design-system-showcase.html`) + deep dive (`design-system.html`) on the standard case-study
  shell, with two live instruments in `ds-live.js`: a token inspector that reads the computed
  custom properties of the page it sits on (re-resolving live on theme toggle), and an in-browser
  analytic re-derivation of the Parlay slot's RTP that reproduces the exact enumeration figures
  (bugged 95.9160% vs shipped 96.0428%) in milliseconds. Content grounded in a four-agent research
  pass: full design-system inventory (232 token values, two runtime systems, one discipline),
  tech/AI-process inventory (18 root modules, 3 build scripts, the verification culture), 2025–26
  UX-trend research with sources (DTCG 2025.10, Figma AI report, EAA, buildless web), and a
  surgical integration map. Registered across every surface: work index (count → 11, new lobby
  category "Design Systems"), all three homepages (+ counters), 20 desktop + 6 mobile switcher
  menus, concierge (new `ds` entry; `designsystems` and `process` intents rewritten), sitemap,
  search index (123 sections), and the footer chain (Parlay → Design System → Fintech). Assets are
  self-shot: Playwright screenshots of the site's own surfaces, re-taken after integration so the
  visible counts stay honest. Colophon regenerated — the version's minor digit bumping to 11
  (v1.11.113) is itself the case study's closing argument.

## 2026-07-19 (2)
- Typography section added to the design-system deep dive as section 05 (sections renumbered
  05–11 → 06–12, backgrounds re-alternated). In the case study's house style it's a live specimen,
  not a picture: the working scale (hero clamp, sec-h, lead, the mono system voice at its three
  sizes, tabular-nums readouts) rendered by the page's own fonts and classes, the tokens.css
  display/text scale as a table, and the two signature habits named — clamp()-fluid heroes and the
  large-tighter/small-looser tracking tension. VT323's absence is disclosed honestly: it ships
  only on the retro homepage, because pages subset the fonts they use.
