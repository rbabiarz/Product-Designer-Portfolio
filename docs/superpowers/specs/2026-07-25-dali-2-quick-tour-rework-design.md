# Design Spec — DALI‑2 Quick Tour, service‑design rework

**File:** `dali-2-showcase.html` (the "Quick tour" view; the "Deep dive" `dali-2.dc.html` is unchanged)
**Date:** 2026‑07‑25 · **Owner:** Robert Babiarz
**Status:** Draft for review

---

## 1. Problem

Today's Quick tour reads like engineering documentation. It assumes the reader already knows what DALI‑2, a "WAC," a "bus scan," or a "DT8 driver" is, and it tells only the *software‑commissioning* half of the story. A non‑specialist (recruiter, hiring manager, cross‑discipline reviewer) can't tell **what this was** or **why it mattered**.

**Goal:** rewrite the Quick tour as one plain‑language, end‑to‑end **service story** that a non‑specialist understands fast — foregrounding the UX process, the *service design* (journey map + blueprint), the *research and testing*, and the *outcomes*. Show that the system mattered because it let electricians physically install it easily (flexible wiring topology) and let technicians bring it to life without drowning in complexity.

**Success = a reader with no lighting background can, in one scroll, explain:** what the system is, who touches it across its life, the one hard problem, how it was solved, how we knew it worked, and what shipped.

## 2. Users / actors (the three‑stage spine)

1. **Electrician / installer** — mounts the panel and pulls the wire. Cares about: fast, forgiving physical install.
2. **Commissioning technician** — brings the installed system to life in software. Cares about: not sitting idle; not fighting the tool at scale.
3. **Facilities / operator** — lives with it after launch. Cares about: changing/expanding without disrupting a live building.

## 3. Non‑goals

- Not touching the Deep dive (`dali-2.dc.html`) or the interactive demo.
- Not changing the page shell: nav, theme toggle, case switcher, "Quick tour / Deep dive" pill, footer, colophon all stay.
- Not inventing metrics, quotes, participant counts, or research findings.
- Not a net‑new design system — reuse existing tokens/bands/reveal; add only the three new components below.

## 4. Content & confidentiality rules (load‑bearing)

Source material is internal Signify/Cooper Jira + Confluence plus Robert's own field notes. This page is public.

**Use freely:** DALI domain facts (public/standard), the topology facts, the UX problem, Robert's own reframe/V2 notes, his real usability‑test method, and public‑facing outcomes.

**Keep OUT entirely:** coworker names, ticket IDs (OCB‑/WVX‑/PCB‑/ELMS‑…), internal URLs, firmware/build versions, the internal test bench identity, and anything from the separate/unreleased **OCB‑299 certificate provisioning / Trellix / LXI** work or the **OCB‑305** future roadmap.

**Voice:** clear, calm, plain. Name **"DALI‑2" exactly once** (hero/intro) as a credibility signal, then use human language — "the panel," "the hub/controller," "the app," "the two‑wire run," "dimmable / color‑tunable fixtures, sensors, wall stations." No WAC / MQTT / DT6 / DT8 / CCI / bus‑scan jargon. Lead with the verb; status never rides on hue alone.

## 5. Real facts this page may state (public‑safe, extracted)

**What it is (plain):** DALI‑2 is a wired lighting‑control standard; fixtures, sensors and wall stations all talk to each other over a shared **two‑wire** run. Common in commercial and healthcare buildings.

**Why it mattered / physical install (topology — the emphasis):**
- The wiring is **topology‑free**: two wires, no polarity to match, a cap on the end.
- Supported layouts: **daisy‑chain (line), star, tree, and combinations**. Not supported: **ring, mesh**.
- Easy to run on new construction and easy to add to or rearrange later.
- Up to **~1,000 ft** from panel to the last device.
- One prebuilt cable bundles the control pair and power, cutting labor — a big deal on a 4,000–10,000‑fixture hospital job.
- Hospitals wire everything to avoid wireless interference near medical equipment.

**Scale (DALI‑standard, public):** up to **128 devices per run**; **4 runs per hub**; up to **6 hubs per panel**; a hospital floor can carry **16–24 runs**.

**The hard problem (real):** legacy screens assumed ~30–50 wireless devices; a DALI floor brings thousands. Because the two‑wire bus is slow, reading every device took a long time — and in the first build, adding a hub **froze the entire app** behind a loader that grew to **~27.5 minutes per hub** (figure already public on the live page). Multiply across a panel and technicians sat idle for hours.

**The reframe / V2 (Robert's own design work):**
- Discovery adds **only hubs**, not devices.
- "Add to the system" does two things at once: adds the hub **and** runs the scan + **auto‑addressing in the background**.
- **Non‑blocking:** leave the screen and start building areas/zones while the import runs.
- **Two‑banner progress** (page‑level + list‑level) keeps the work visible.
- **Auto‑addressing** removes legacy manual addressing entirely.
- **Filter‑before‑load / "show only new devices,"** plus running totals of assigned / unassigned / remaining.

**Research (real method, no invented data):** a moderated, task‑based usability test across three flows — Discovery, Manage, Areas. Real tasks included: add a hub; rename the hub and confirm the run/bus labels updated; edit the hub; assign a specific fixture to an area; assign devices from one run into a zone; interpret the running totals. It surfaced **rename‑propagation clarity** and the **"~1,000+ devices on one screen" scale problem**, which drove the filter‑before‑load and clustering decisions.

**Testing (real, scrubbed):** hardware‑in‑the‑loop regression across **200+ device types on all four runs** — dimming, color‑tuning, wall‑station scene/zone/raise‑lower, and daylight scenarios across many zones. The large majority passed; a few were deferred pending device availability. **First deployment: Peter Gilgan Mississauga Hospital — the largest DALI‑2 installation in North America.**

**Outcomes:** shipped across mobile and web; non‑blocking commissioning with background auto‑addressing; and the market echo — the manufacturer's own **"DALI, Simplified"** campaign now leads with the promise this work was built around, using the shipped app as its hero image.

## 6. Page structure (section by section)

Each stage answers the same four plain questions: **who's here · what they're doing · what used to hurt · what we changed.**

1. **Hero** — plain headline (e.g. "Bring a hospital's lights to life — without the trades drowning in it"). Sub: one sentence naming DALI‑2 once, framing the three stages. Keeps the existing hero band image.
2. **What this is** — 3 short sentences (two‑wire system; three people touch it — install, commission, operate; why it matters). Keep the compact meta card (role, scope, team, platform, client, first deployment) but plainer labels.
3. **The service, end to end — Journey map** *(new component)* — one horizontal spine, three lanes (electrician · technician · facilities) across **Install → Commission → Operate**; each step shows the action, the old pain, and the fix. This is the backbone the rest expands.
4. **Stage 1 · Install — Topology diagram** *(new component)* — why physical install was easy. Rebuilt topology diagram (supported vs. not) + the two‑wire / cap‑the‑end / 1,000‑ft / test‑before‑software facts.
5. **Stage 2 · Commission** — the core win. The 27.5‑minute frozen screen → the reframe (add hub, auto‑address in background, keep working). Reuse the existing V1→V2 timeline viz and real shipped screenshots; simplify all copy.
6. **The blueprint — Service blueprint** *(new component)* — under Commission: frontstage (what the person sees) vs. backstage (background scan + auto‑addressing). Makes "invisible work" literal.
7. **Stage 3 · Operate** — life after launch: rescan on change, identify/replace a failed hub, add devices later — without disrupting a live building. Reuse existing lifecycle screenshots.
8. **Research** — the honest usability‑test method + the two insights that changed the design (rename propagation; devices‑on‑one‑screen scale).
9. **Testing** — 200+ device types across four runs; scenario families in plain words; first deployment at the largest DALI‑2 install in North America.
10. **Outcomes** — shipped; non‑blocking + auto‑addressing; then the "DALI, Simplified" echo (kept from today's page).
11. **Shell** — nav, theme toggle, case switcher, verpill, footer, colophon — unchanged.

## 7. New components

All three built in the existing token/band/reveal system. Requirements common to all: reference CSS custom properties only (no raw hex/px); AA contrast in light **and** dark; keyboard‑reachable with visible focus if interactive; **meaning survives without color** (pair every signal with text/icon/shape); gate motion on `prefers-reduced-motion`; wide content scrolls inside its own container (no page horizontal scroll); provide a text/`aria-label` equivalent for each diagram.

- **Journey map** — responsive grid; columns = stages, rows = the three actors + a "pain → fix" row. Collapses to stacked cards on mobile. Static (no JS required); if any reveal/step affordance is added, it degrades to fully visible.
- **Service blueprint** — two‑band layout (frontstage / backstage) aligned to the same commission steps, with the "line of visibility" labeled. Static.
- **Topology diagram** — small tokenized node‑and‑line sketches for each layout. **Supported** = accent treatment + "Supported" label/✓ icon; **not supported (ring, mesh)** = coral `#e64d3c` + "Not supported" label/✕ icon (coral is the strongest signal; never red‑as‑stoplight, never color‑only). Rebuilt natively — the raw source image (green‑✓/red‑✗) is *not* used.

## 8. Design‑system constraints

- Tokens only (`var(--c-…)` etc.); add a token at the right tier if one is missing rather than inlining.
- One color block per viewport; one accent per screen; coral is the only risk signal and always paired with text/shape.
- Dark‑mode parity; `prefers-reduced-motion` respected by every reveal/float/marquee.
- Icons: Material Symbols (`<span class="msi">`) only; no hand‑authored SVG paths except the tokenized topology/journey/blueprint line art, which is geometric (rects/lines), not iconography.
- Hit targets ≥ 44×44 for any interactive control; every control labeled.

## 9. Definition of done

- [ ] A non‑specialist can explain what/who/why/how/proof from one scroll.
- [ ] Product/system jargon reduced to "DALI‑2" once + plain language; no WAC/MQTT/DT‑codes.
- [ ] Journey map, service blueprint, topology diagram present, tokenized, dark‑mode + reduced‑motion + keyboard safe, each with a text equivalent.
- [ ] Research and Testing sections are method‑honest — no invented findings, quotes, counts, or metrics.
- [ ] No confidential content (names, ticket IDs, URLs, versions, bench, OCB‑299/Trellix/OCB‑305).
- [ ] Page shell unchanged; light/dark both AA; no horizontal page scroll at mobile widths.
- [ ] Every nontrivial claim traces to a public/domain fact or Robert's own notes.
