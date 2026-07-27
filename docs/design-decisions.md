# Design decisions (ADR log) — Product Designer Portfolio

Append-only record of meaningful choices. Newest at top.

## ADR-014 — Cloud Support & Services case study written for a non-technical reader (2026-07-26)

**Decision.** Add `spotstudios/cloud.html` as case 07, a plain-language case study of the CLS Cloud
Support and Services portal (Figma *Cloud v7.1*), covering all five areas of the product: equipment
software distribution, customer organizations, people and access, system messages, and the security
code generator. Registered on `spotstudios/work.html` (Buildings and lighting, now 6 of 8) with a new
`previews/thumb-cloud.png`.

**Why this spine.** The product is three unrelated jobs behind one navigation rail, so the case is
framed as three metaphors a non-technical reader already owns — a shop counter, a filing cabinet, a
locksmith — before any screen appears. The lead is the consequence, not the feature set: send the
wrong file to a hospital and the lights go out. The star section is the challenge/response reset,
because it is the one interaction whose security lives in the shape of the arrangement rather than
in code, and it survives translation into plain English intact.

**Plain-language rewrite.** All prose avoids the product's own vocabulary: firmware → "the software
inside the equipment", MD5 checksum → "a fingerprint for the file", Wireless Area Controller → "the
control box on the pole", challenge/response → "a riddle only head office knows the answer to",
organization → "customer", pagination → "pages". A whole-word scan over 60+ technical terms returns
zero hits in body copy. Reading level lands at grade 7.9 / ease 71.0, the third-most readable page
in the portfolio and in the same band as `smart-lighting.html` (7.7). Product labels are kept **only
inside image alt text** ("a form headed Edit Firmware"), because alt text describing a UI has to name
the words actually on screen; the surrounding prose translates each one.

**Notifications scoped honestly.** The Figma file contains the Notifications rail item and a snackbar
component but no notification screens. Rather than invent them, section 10 states plainly what was
designed (the message layer: snackbar, the approval notice, the maintenance page, the connection
failure page) and what was not. Numbers cited are only those observable in the design — 414 customer
accounts, 14 a page, 3 reset attempts, 5 rail areas, 5 tabs — with no invented business outcomes and
no team headcount.

**Two opt-in CSS modifiers, no shared defaults touched.** `.panel-grid--pairs` / `.module-grid--pairs`
pair four-item grids two-by-two, because the shared `auto-fit` default lands them 3 + 1 and the lone
trailing card reads as a mistake. `.shot__row--pair` splits a row evenly between two full-screen
captures, because the default fixed-height row leaves a 1440-wide pair floating in ~380px of dead
space. Both are additive and gated so the auto-fit and fixed-height defaults still apply everywhere
else; all five sibling case studies were re-audited afterwards and are unchanged.

**Consequences.** cloud.html: axe-core clean (0 violations, 49–50 passes) at 1440 / 1024 / 768 / 375 /
320 and at 400% zoom, no horizontal overflow, 9 focus stops all with a visible ring and all ≥ 24×24,
both scroll containers keyboard-reachable, 0 animations under `prefers-reduced-motion`, one `h1`, no
skipped heading levels, 21 images all with alt text, no color-only status. Pre-existing and untouched:
`core-insights.html` reports one `landmark-complementary-is-top-level` best-practice finding (nested
`<aside>`), unrelated to this work. A 3-item grid still wraps 2 + 1 at ~1025px, which is inherent to
three items in two columns and is shared with the sibling pages.

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

## ADR-012 — CORE Insights Quick tour re-spined as an end-to-end service story (2026-07-25)

**Decision.** Rework the "Quick tour" version of the CORE Insights case study
(`core-insights-showcase.html`) from a product/analytics walk-through into a plain-language,
end-to-end service story. New spine: *what it is* → *why it mattered* (easy physical install
across a flexible topology is what gets buildings deployed, so data exists at all) → **journey
map** (Install → Commission → Go live → Operate → Optimize) → **service blueprint** (front-stage
/ line of visibility / back-stage / support, worked through one question: "why is this floor
empty?") → approach → outcomes. The installer/electrician is introduced as the entry actor who
hands off to the manager, analyst, and desk-seeker. Product/system nouns ("CORE Insights", "PRO",
"device tree", "taxonomy", "40,000+ devices") stripped from body copy; kept only in structural
chrome (title, nav switcher, SEO, canonical). The Deep-dive version is untouched.

**Why.** The brief was to make it "very easy to read", de-technical, and tell the whole UX process
end to end with service-design artifacts. The load-bearing reframe: the intelligence is worthless
until the hardware is on the ceiling, so the story now starts at install, not at a chart. Journey
map and blueprint are synthesis artifacts (a representation of how the service works), so they
carry the "end-to-end thinking" honestly without empirical claims.

**Alternatives considered.** Light-touch copy pass + one journey map (rejected: under-delivers the
service-design/blueprint/research asks). Installer-led reframe with insights as the payoff
(rejected: shifts this case study's identity toward commissioning, overlapping DALI-2 /
partitioning).

**Research/testing constraint.** Owner confirmed no research notes exist and to "leave out anything
that cannot be verified" — explicitly extending this to pre-existing claims. So: no standalone
research-findings section, no invented studies/participant counts/percentages, AND the previously
published outcome metrics (93% faster reports, 87% fewer clicks, 23% energy reduction) and the
unattributed testimonial were removed outright. The closing "By the Numbers / Measured in the field"
section was replaced with "At a glance / The shape of it" — four tiles carrying only structural facts
that are true by inspecting the system, not outcomes: 5 hierarchy levels (org→room), 3 ways to read a
space (compare/locate/trend), 4 readers on one shared map, 2 time modes (real-time/historical).

**Consequences.** Two net-new designed artifacts (`.jmap` journey map, `.bp` service blueprint) added
to this page's inline CSS/markup only — journey rail hides and cards stack ≤980px; blueprint scrolls
inside its own `overflow-x` container ≤820px with a scroll hint (no page-level overflow at 390px).
Verified in light/dark, desktop/mobile via Playwright. Hero anchor + band id renamed
`#operators` → `#people`; meta "Operators" row → "The people" (installer added). SEO/OG/Twitter/JSON-LD
descriptions rewritten to the plain-language framing.

## ADR-013 — Partitioning Quick tour rebuilt as a de-identified, process-first case study (2026-07-25)

**Decision.** Rework the "Quick tour" of the Partitioning case study
(`partitioning-showcase.html`) into a plain-language, recruiter-legible UX/service-design story
with every company, product, hardware, and client-venue name removed. New spine: plain hero + a
CSS "one room / five rooms" concept (no screenshot) → *what it is* → *the problem* → **journey
map** (Plan → Install → Set up → Connect → Use) → **service blueprint** (a wall closes; front-stage
/ line of visibility / back-stage / support) → approach → **research & user testing** → an
**interactive "open a wall" demo** → honest structural outcomes. Deep-dive version untouched.

**Why.** Brief: "very easy to read, very little technical, keep company/branding/software/proprietary
out, keep it general so any recruiter can follow the UX process." The old page was the opposite:
heavy product screenshots (logos, the "Trellix/CooperWAC" UI, a named client ballroom), WaveLinx /
Cooper / Signify throughout, and hardware acronyms (CCI, IRTR). A baked-in screenshot can't be
de-branded, so all product screenshots were removed and replaced with designed artifacts and the
(de-branded) interactive floor-plan sim.

**De-branding.** Stripped WaveLinx / Cooper / Signify / Trellix / LXI / CORE / DALI / CCI / IRTR /
UAG / "Rose Ballroom" / occupancy-set / wallstation / chandelier / cove / contact-input from body,
SEO, meta, JSON-LD, and the nav-switcher subtitle. `floor-plan-sim.js` labels de-branded (presets
→ "8 Separate Rooms / 6 Rooms / … / 1 Big Room"; "Rose Ballroom · 48 devices" → "One divisible room
· 8 sections"; device note and per-zone "dev" → generic "section"). The switcher's link to the
*other* DALI-2 case study is left as-is (portfolio navigation, not this case's content).

**Research/testing grounding.** Unlike the Insights case (no notes), here the Confluence UAT trail
is real source. The "what tripped people up → what we changed" pairs are generalized, de-identified
versions of the actual documented feedback (wall-to-sensor linking confusion; unclear sub-room
navigation; ambiguous icon; "what do I do next" on the details page; too much scrolling / missing
validation) and their fixes (explicit guided step; expected navigation with mobile/desktop parity;
familiar pattern; expand-collapse with lazy load; up-front counts + validation). The linear-vs-radial
stepper debate became a de-identified "evidence over opinion" callout.

**Outcomes honesty.** Removed the unverifiable/branded metrics (industry-first, 40–60% commissioning
time, ~90% fewer API calls, "11+ issues"). Replaced "By the Numbers" with "At a glance / The shape of
it": four structural facts that are public and general (up to 10 rooms, up to 10 walls, 2 wall states,
3 surfaces at parity). No em dashes in new copy, matching the site house style.

**Consequences.** Journey-map / blueprint / research-pair CSS added to this page (mirrors ADR-012).
Verified via Playwright: zero JS errors, no horizontal overflow, sim rebuilds with de-branded labels;
blueprint, demo, and research sections visually confirmed in light. `.win` / `.tl` CSS is now unused
but left in place (harmless). Hero and version-pill still link to the branded Deep-dive page, which
was out of scope for this pass.
