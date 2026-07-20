# Design decisions (ADR log) — Product Designer Portfolio

Append-only record of meaningful choices. Newest at top.

## ADR-006 — No homepage reader poll; cross-visitor state stays keyless
- **Date:** 2026-07-03
- **Status:** Accepted
- **Context:** A "which homepage did you like best?" poll was scaffolded (`poll.js` +
  Firebase Firestore config) but never enabled. It required a real backend and a vendor
  account, contradicting ADR-002's no-build / no-backend stance, and it asked visitors a
  question the VIEW switcher already answers behaviorally.
- **Decision:** Remove the homepage poll and all Firebase scaffolding
  (`poll.js`, `firebase-config.js`, `firebase.json`, `firestore.rules`). The work-page
  carousel poll stays — its tally uses a keyless public counter (Abacus), which fits the
  static-host architecture.
- **Consequences:** No homepage vote data; variant preference is inferred from the saved
  VIEW choice instead. If a poll returns someday, it should use a keyless store, not a
  vendor backend. Recoverable from git history (`ce08e02`).

## ADR-005 — The dropped P1 node map ships as a live simulation, not a screenshot
- **Date:** 2026-07-03
- **Status:** Accepted
- **Context:** The Smart Lighting mesh section showed four proposals as static screenshots. P1
  (drag-to-repeater node map) is the strongest demonstration of interaction craft, and the
  portfolio thesis is interactive, code-level prototypes — a screenshot undersells it.
- **Decision:** Rebuild the P1 screen as a working sim (`mesh-sim.js`, shared by both smart-lighting
  pages via `[data-mesh-sim]`): distance-based signal model, drag-a-bulb-onto-the-gateway
  promotion, TEST sweep that reveals marginal devices with where-to-work guidance, and AUTO
  SELECT that performs the shipped P4 behavior — making the P1→P4 argument playable. Low
  reliability is coral **plus** a "!" badge and dashed links (never hue alone); full keyboard path
  (arrows/Enter/T/R) with `aria-live` announcements; sim state survives `.dc` re-renders.
- **Consequences:** One more shared runtime module to maintain; the P2/P3/P4 tabs remain
  screenshots layered above the sim (which goes inert while covered). Fixing pointer delivery
  surfaced a site-wide bug: the page-transition overlay stayed hit-testable during its entrance
  animation — it is now `pointer-events:none` except during the deliberate exit cover.

## ADR-004 — In-game overlays anchor to their stage, not the viewport
- **Date:** 2026-06-28
- **Status:** Accepted
- **Context:** The AEGIS "how scoring works" popup used `position:fixed`; inside a host wrapper
  with a `transform`, fixed resolves against that ancestor, so on mobile it flew off-screen.
- **Decision:** Anchor in-game overlays with `position:absolute` to the game stage and frame the
  stage into view on open.
- **Consequences:** Robust in any embed; dim is stage-scoped rather than full-page (acceptable).

## ADR-003 — Three switchable homepage variants
- **Date:** 2026-06-28
- **Status:** Accepted
- **Context:** One homepage can't serve both the "interactive proof" and "classified dossier" reads.
- **Decision:** Ship Interactive (primary), Dossier, and Retro variants behind a VIEW switcher
  (`home-variants.js`) that remembers the choice.
- **Consequences:** More surface to maintain; each variant must stay token- and a11y-consistent.

## ADR-002 — No-build, self-contained HTML via the DC runtime
- **Date:** 2026-06-28
- **Status:** Accepted
- **Context:** Portability and longevity beat tooling for a portfolio.
- **Decision:** Single-file pages; `.dc.html` rendered by `support.js` (React via CDN). No server.
- **Consequences:** Deploys anywhere static; first load needs the CDN; degrades gracefully.

## ADR-001 — Dark-first defense aesthetic, monochrome + one accent
- **Date:** 2026-06-28
- **Status:** Accepted
- **Context:** The work is SOC / defense; meaning must not ride on hue.
- **Decision:** `#070b12` canvas, teal accent (`#4ca88f`/`#7dd3c0`), one color block per viewport,
  a light architect mirror. No stoplight colors as status.
- **Consequences:** Strong, coherent read; requires discipline on accent usage and contrast.

## ADR — AEGIS GIMS enters the portfolio as case study 08
- **Status:** Accepted
- **Context:** The interview-design-solution repo carries a complete, on-brand case study
  (same palette/type as this site) plus two live builds (v1 take-home, v2 AEGIS-GIMS).
- **Decision:** Re-author into the site's two-page convention (showcase shell from CTOC, deep-dive
  shell from Goals-Driven Fintech); embed the v2 build as the live prototype and link the v1
  take-home; number it 08 everywhere; splice the footer chain CTOC → GIMS → Fintech.
- **Consequences:** One more registry entry to maintain in switchers/homepages/work/concierge;
  the prototype iframe is the site's only external-origin embed (rbabiarz.github.io), labeled
  honestly as the one thing that needs a connection.

## ADR — Parlay Games iGaming enters the portfolio as case study 09
- **Date:** 2026-07-12
- **Status:** Accepted
- **Context:** The pre-IoT career chapter (a decade of iGaming at Parlay Games) existed only as a
  Figma case study; the site's narrative jumps from nothing to connected lighting. The material is
  breadth-heavy (logos, game art, web platforms, promos, back office, 3D), unlike the site's
  depth-first case studies.
- **Decision:** Re-author into the two-page convention (showcase + deep-dive shells) as an
  image-led "range under production constraints" story; extract all imagery and copy from the
  Figma source; number it 09 everywhere; label company-level figures ($2B wagered/yr, 2.8M
  players, 70 clients) as Parlay-era context, not design metrics. Name it "Parlay Games"
  (source-accurate); reconciling the About page's "Parlay Gaming" is logged in open-questions.
- **Consequences:** First case study with no interactive prototype — the proof is production
  volume and range, stated honestly; adds ~20 optimized images to assets/parlay/.

## ADR — Light ARchitect enters the portfolio as case study 06
- **Date:** 2026-07-12
- **Status:** Accepted
- **Context:** The flagship of the Cooper tenure (six years, three published US patents, the
  About page's $6M+ line) had no case study while the homepage carried a "coming soon" pill on
  its Light ARchitect scene. Sources are mixed-sensitivity: an older self-authored case study and
  Confluence/Jira exports (context only), public patents, the public cooperlighting.com page, and
  a 301-screen product export library.
- **Decision:** Insert as case study 06 (after Smart Lighting), renumbering 06–09 → 07–10 across
  all surfaces rather than appending — the lighting arc reads chronologically. Two-page pair on
  the newest (plain-HTML) shells; the deep dive carries three in-page simulations sharing one
  footcandle engine (la-sims.js), each honesty-labeled and keyboard-operable. All copy written
  fresh: no ticket ids, colleague names, internal system names, or Confluence/Jira sentences;
  patents are the only verbatim source. Product name standardized to "Light ARchitect" in visible
  copy site-wide (CSS vars, ids, and file paths unchanged). The homepage pill was promoted to a
  case-study link, and the work-index carousel clamp was corrected (count 8 → 10; card 10 had
  been unreachable).
- **Consequences:** Every case list is now 10 deep; the CORE/Enterprise-AI pages keep canonical
  ownership of the "5,000 IES searchable / 20 auto-placed in CORE" framing (this case cross-links
  instead of restating); adds ~24 optimized images to assets/la/ and a lime `footgrid` tile motif.

## ADR-011 — The portfolio documents itself as case study #11 (2026-07-19)

**Decision.** Add "The Design System" as the final case study: the site's own token architecture,
zero-build stack, AI-paired process, and verification culture, presented on the same two-page
shell as every product case study — with live instruments instead of screenshots wherever the
subject allows (a token inspector reading the page's computed properties; an in-browser
re-derivation of the slot RTP).

**Why.** Three standing problems — assertion vs proof, doc drift, AI slop — have one structural
answer: make the portfolio a product and let it document itself. A meta case study also gives the
process work (machine-readable brief, Playwright gating, adversarial review) a home that isn't a
footnote in someone else's story.

**Alternatives considered.** A `/colophon` standalone page (rejected: buries the argument outside
the case-study spine); a blog-style write-up (rejected: asserts rather than runs); folding it into
About (rejected: About is biography, not evidence).

**Consequences.** Appended last, so no renumbering of 01–10; the work-index count clamp, homepage
counters, 26 switcher menus, concierge intents, and footer chain all gained an 11th entry — the
hand-maintained-count risk this ADR's own case study names as "what I'd push further." The
colophon's version minor now tracks 11 case studies automatically.
