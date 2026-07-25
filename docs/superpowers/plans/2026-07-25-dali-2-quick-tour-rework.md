# DALI‑2 Quick Tour Service‑Design Rework — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the DALI‑2 "Quick tour" page into a plain‑language, end‑to‑end service story (Install → Commission → Operate) with a journey map, a service blueprint, and a rebuilt topology diagram — jargon‑free and free of any confidential source detail.

**Architecture:** Edit the single self‑contained file `dali-2-showcase.html` in place, section by section, reusing its existing shell (nav, theme toggle, case switcher, verpill, footer, colophon) and its existing CSS patterns (`.band`, `.card`, `.tl` timeline, `.results` counters, `[data-reveal]`). Add CSS for three new components and one new color token. Reuse the real screenshots already in `assets/dali/`.

**Tech Stack:** Static HTML + inline CSS/JS. Material Symbols icons (`<span class="msi">`). Verification via headless Chromium (Playwright, already cached on this machine) + `grep`.

## Global Constraints

Every task's requirements implicitly include these (copied from the spec):

- **Tokens only.** Reference `var(--c-…)` custom properties; no raw hex/px in new markup. If a value is missing, add a token at the right tier.
- **Name "DALI‑2" at most twice** (hero + intro). Elsewhere use plain language: "the panel," "the hub/controller," "the app," "the two‑wire run," "dimmable / color‑tunable fixtures, sensors, wall stations." **Forbidden tokens anywhere in the file body copy:** `WAC`, `MQTT`, `DT0/DT6/DT7/DT8`, `CCI`, `mDNS`, `UDP`, `DALI hub` (use "hub"/"controller"), `bus scan`.
- **Status never rides on hue alone.** Coral `--c-risk: #e64d3c` is the only risk signal and is always paired with a text label + icon/shape.
- **Dark‑mode parity**; **`prefers-reduced-motion` respected** by every reveal/float.
- **Icons:** Material Symbols only. New diagram line art may use geometric SVG (`<circle>`/`<line>`/`<polyline>` — never `<path>`).
- **Hit targets ≥ 44×44px** for any interactive control; every control labeled.
- **No horizontal page scroll** at any width; wide content scrolls inside its own `overflow-x:auto` container.
- **Each diagram carries a text equivalent** (`role="img"` + `aria-label`, or adjacent prose).
- **No confidential content:** no coworker names, ticket IDs (`OCB-`/`WVX-`/`PCB-`/`ELMS-`/`CLUX-`/`CONBLDG-…`), internal URLs (`signify.com`, `*.dtf.signify.com`), firmware/build versions, the test bench, or anything from the separate OCB‑299 / Trellix / LXI or OCB‑305 work.
- **Do not touch** `dali-2.dc.html`, the page shell, or the SEO/OG head block.

Public‑safe facts to draw on live in the spec: `docs/superpowers/specs/2026-07-25-dali-2-quick-tour-rework-design.md` §5. Use those exact statements.

---

## Task 1: Verification harness, risk token, and acceptance guards

**Files:**
- Create: `scratchpad/verify-dali.mjs` (not committed to the repo)
- Modify: `dali-2-showcase.html` — add `--c-risk` token to `.cs` (light) and `.cs.dark` blocks (near lines 21 and 29)

**Interfaces:**
- Produces: a repeatable render check (`node scratchpad/verify-dali.mjs`) and two grep guards (jargon, confidentiality) used by every later task; the CSS token `--c-risk` consumed by Task 4.

- [ ] **Step 1: Add the risk token.** In `dali-2-showcase.html`, in the `.cs{…}` custom‑property block add `--c-risk:#e64d3c;--c-risk-soft:#f7e2df;` and in `.cs.dark{…}` add `--c-risk:#f0785f;--c-risk-soft:#2a1512;`.

- [ ] **Step 2: Write the render harness** to `scratchpad/verify-dali.mjs`:

```js
// Usage: node scratchpad/verify-dali.mjs "text that must appear"
import { chromium } from '/Users/rbabiarz/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs';
const EXE = '/Users/rbabiarz/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const URL = 'http://localhost:8971/dali-2-showcase.html';
const must = process.argv[2] || '';
const b = await chromium.launch({ executablePath: EXE });
const ctx = await b.newContext();
let fail = 0;
for (const theme of ['light', 'dark']) {
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await ctx.addInitScript(t => { try { localStorage.setItem('rba-int-dark', t === 'dark' ? 'true' : 'false'); } catch (e) {} }, theme);
  try { await p.goto(URL, { waitUntil: 'networkidle', timeout: 20000 }); } catch (e) {}
  await p.waitForTimeout(1200);
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const hasText = must ? await p.evaluate(t => document.body.innerText.includes(t), must) : true;
  const ok = errs.length === 0 && overflow <= 1 && hasText;
  if (!ok) fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${theme}  errors=${errs.length} overflowPx=${overflow} textPresent=${hasText}`);
  if (errs.length) console.log('   ' + errs.slice(0, 3).join(' | '));
  await p.screenshot({ path: `${process.env.TMPDIR || '/tmp/'}dali-${theme}.png`, fullPage: true });
  await p.close();
}
await b.close();
process.exit(fail ? 1 : 0);
```

- [ ] **Step 3: Start a local server and run the baseline render check.**

Run: `cd "<repo>" && python3 -m http.server 8971 >/dev/null 2>&1 & sleep 1 && node scratchpad/verify-dali.mjs "Commissioning"`
Expected: `PASS light` and `PASS dark` (baseline page still renders; no console errors; no overflow). Leave the server running for later tasks (or restart per task).

- [ ] **Step 4: Write the jargon guard and run it — expect FAIL now.**

Run: `grep -oiE '\b(WAC|MQTT|DT[0678]|CCI|mDNS|UDP|bus scan)\b' dali-2-showcase.html | sort | uniq -c`
Expected now: **matches present** (the un‑reworked page still uses this jargon). This guard must return **zero matches** after Task 10. Record the current output as the starting point.

- [ ] **Step 5: Write the confidentiality guard and run it — expect PASS now and always.**

Run: `grep -niE '\b(OCB|WVX|PCB|ELMS|CLUX|CONBLDG)-[0-9]|dtf\.signify|collaboration\.dtf|tracker\.dtf|Trellix|Lighting Xpert|SR1[0-9]\b|Gen ?2\.5' dali-2-showcase.html`
Expected: **no output** (exit 1 from grep = clean). If anything ever matches, remove it.

- [ ] **Step 6: Commit.**

```bash
git add dali-2-showcase.html
git commit -m "chore(dali): add --c-risk token; establish verification guards"
```

---

## Task 2: Hero + "What this is" (plain‑language reframe)

**Files:**
- Modify: `dali-2-showcase.html` — the `<!-- HERO -->` section (H1 + lead only; keep the band/image) and the `<!-- INTRO + META -->` section (copy + meta labels).

**Interfaces:**
- Consumes: nothing. Produces: the DALI‑2‑named‑twice baseline and the three‑stage framing that Task 3 expands.

- [ ] **Step 1: Rewrite the hero headline + lead.** Replace the current `<h1>` text and the `<p class="lead">` below it with:
  - `<h1>`: **From bare wire to working light — at <em>hospital scale</em>**
  - lead: **A hospital runs its lighting over a wired standard called DALI‑2. This is the story of the people who install it, bring it to life, and keep it running — and how we made each of those jobs simpler.**
  - Keep the two buttons; change the secondary button label to **See the whole service** and its href to `#journey`.
  - Keep the hero band and its image/caption unchanged.

- [ ] **Step 2: Rewrite the INTRO copy.** In the intro grid left column, set eyebrow **The short version**, `<h2>` **One system, three jobs**, and two leads:
  - **Every light, sensor, and wall switch on a floor talks over the same two wires. Three people touch that system: an electrician wires it, a technician brings it online, and a facilities team lives with it for years.**
  - **It matters because the numbers are brutal — a hospital job runs 4,000 to 10,000 fixtures, all hard‑wired so nothing interferes with medical equipment. Every small friction multiplies into days of labor.**
  This is the **second and final** DALI‑2 mention is *not* here — DALI‑2 appears only in the hero. Do not repeat it here.

- [ ] **Step 3: Plain‑label the meta card.** Keep the card and its values; rename keys to: `Role` → **My role**, `Scope` → **What I owned**, `Team` → **Team**, `Platform` → **Where it runs**, `Client` → **Client**, `First deployment` → **First built for**. Remove any device‑code/acronym from values.

- [ ] **Step 4: Verify render + jargon locally.**

Run: `node scratchpad/verify-dali.mjs "One system, three jobs"`
Expected: `PASS light` / `PASS dark`.
Run: `grep -c -iE 'DALI-2|DALI‑2' dali-2-showcase.html` → expected small (hero only in prose; some may remain in the untouched SEO block — that's allowed). Confirm the **intro** no longer says WAC/DALI‑2.

- [ ] **Step 5: Commit.**

```bash
git add dali-2-showcase.html
git commit -m "feat(dali): plain-language hero + 'one system, three jobs' intro"
```

---

## Task 3: Journey map component (the backbone)

**Files:**
- Modify: `dali-2-showcase.html` — add `.jm` CSS to the `<style>` block; replace the old `<!-- CHALLENGE -->` section with a new `#journey` section.

**Interfaces:**
- Consumes: `.band`, tokens. Produces: `#journey` anchor (hero secondary button targets it) and the Install/Commission/Operate framing the stage sections expand.

- [ ] **Step 1: Add the journey‑map CSS** (place near the other component CSS):

```css
.jm{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:40px}
.jm-col{background:var(--c-surface);border:1px solid var(--c-b2);border-radius:16px;overflow:hidden}
.jm-hd{padding:16px 18px;background:var(--c-card);border-bottom:1px solid var(--c-b2)}
.jm-stage{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--c-accent)}
.jm-actor{font-family:'Inter',sans-serif;font-size:17px;font-weight:600;color:var(--c-ink2);margin-top:4px}
.jm-row{padding:14px 18px;border-top:1px solid var(--c-b1)}
.jm-row:first-child{border-top:0}
.jm-k{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--c-muted);margin-bottom:5px}
.jm-v{font-size:13.5px;line-height:1.55;color:var(--c-body)}
.jm-row.hurt .jm-k{color:var(--c-risk)}
.jm-note{max-width:820px;margin:22px auto 0;text-align:center;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.06em;color:var(--c-muted);line-height:1.7}
@media(max-width:860px){.jm{grid-template-columns:1fr}}
```

- [ ] **Step 2: Replace the CHALLENGE section** with the journey map inside a `band-navy` (or plain `pad`) section anchored `id="journey"`, header eyebrow **The whole service**, `<h2>` **Follow it end to end**, lead **Three stages, three people. Here's where it used to hurt — and what we changed at each step.** Then three `.jm-col`, each with a header (stage + actor) and four `.jm-row`s keyed **What they do / Old friction / What we changed** (mark the friction row `class="jm-row hurt"`). Wrap the `.jm` grid in `<div role="img" aria-label="Journey map across three stages…">` summarizing the nine cells. Cell content:
  - **Install · Electrician** — Do: *Mount the panel, pull the two‑wire runs, cap the ends, power up.* · Old friction: *Rigid, fussy wiring on the systems this replaced.* · Changed: *Forgiving, shape‑free wiring; test each run at the panel before any software.*
  - **Commission · Technician** — Do: *Find the controller, bring its devices online, sort them into rooms.* · Old friction: *One "processing" screen froze the whole app — up to ~27 minutes per controller.* · Changed: *Nothing blocks; devices import in the background while you keep working, and they number themselves.*
  - **Operate · Facilities** — Do: *Add, swap, and rescan devices as the building changes.* · Old friction: *Changes meant disruptive re‑work.* · Changed: *Rescan, identify, and replace on a live floor — no downtime.*
  - `.jm-note`: **Read left to right: the same system, handed from trade to trade. Each handoff is where friction used to live.**

- [ ] **Step 3: Verify.**

Run: `node scratchpad/verify-dali.mjs "Follow it end to end"` → `PASS light` / `PASS dark`.
Manually open `${TMPDIR}dali-light.png` / `dali-dark.png` and confirm the three columns read clearly and the "Old friction" key is coral in both themes.

- [ ] **Step 4: Commit.**

```bash
git add dali-2-showcase.html
git commit -m "feat(dali): add end-to-end journey map (Install/Commission/Operate)"
```

---

## Task 4: Stage 1 — Install + rebuilt topology diagram

**Files:**
- Modify: `dali-2-showcase.html` — add `.topo` CSS; replace the old `<!-- SHOWCASE: SCALE BAND -->` + `<!-- THE PROBLEM / SITE -->` region with a `Stage 1 · Install` section containing the topology diagram and the install‑facts row. (Retain the hospital image inside this section as the stage's visual.)

**Interfaces:**
- Consumes: `--c-risk`, `--c-accent`, tokens. Produces: nothing downstream depends on it.

- [ ] **Step 1: Add topology CSS:**

```css
.topo{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:36px}
.topo-cell{background:var(--c-surface);border:1px solid var(--c-b2);border-radius:14px;padding:18px 16px;text-align:center}
.topo-cell svg{width:100%;height:74px;display:block;margin-bottom:12px}
.topo-cell .n{font-family:'Inter',sans-serif;font-size:14px;font-weight:600;color:var(--c-ink2)}
.topo-ok svg{color:var(--c-accent)}
.topo-no svg{color:var(--c-risk)}
.topo-tag{display:inline-flex;align-items:center;gap:5px;margin-top:8px;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.08em;text-transform:uppercase}
.topo-ok .topo-tag{color:var(--c-accent)}
.topo-no .topo-tag{color:var(--c-risk)}
.topo-facts{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:22px}
.topo-facts>div{background:var(--c-card);border-radius:12px;padding:16px;font-size:13px;line-height:1.5;color:var(--c-body)}
.topo-facts b{display:block;font-family:'Inter',sans-serif;color:var(--c-ink2);margin-bottom:4px}
@media(max-width:860px){.topo{grid-template-columns:1fr 1fr}.topo-facts{grid-template-columns:1fr 1fr}}
@media(max-width:520px){.topo,.topo-facts{grid-template-columns:1fr}}
```

- [ ] **Step 2: Build the Install section.** Eyebrow **Stage 1 · Install**, `<h2>` **Two wires, almost any shape**, lead **The reason this wins on a job site: the wiring barely constrains the electrician. Two control wires, no polarity to get right, a cap on the end — and the run can take almost any shape.** Then a `.topo` grid of six `.topo-cell`s. Four are `topo-ok` (Daisy‑chain, Star, Tree, Combination), two are `topo-no` (Ring, Mesh). Each cell: a geometric SVG (circles + lines/polylines, `stroke="currentColor"` `fill="none"` `stroke-width="2"`), a `.n` label, and a `.topo-tag` = `<span class="msi">check</span> Supported` or `<span class="msi">close</span> Not supported`. Wrap the grid in `role="img" aria-label="Supported wiring layouts: daisy‑chain, star, tree, and combinations. Not supported: ring and mesh."`. Example SVGs (nodes = `<circle r="4">`):
  - Daisy‑chain: 5 circles in a row at y=37, x=12,40,68,96,124, joined by one `<polyline points="12,37 40,37 68,37 96,37 124,37">`.
  - Star: center `<circle cx="70" cy="37">` + 5 lines to outer circles.
  - Tree: root at top center, two `<line>`s down to two mid nodes, each to two leaf nodes.
  - Combination: a horizontal run with one branch dropping to a small star.
  - Ring: 6 circles on a hexagon with a closed `<polyline>` loop.
  - Mesh: 5 circles with many crossing `<line>`s.

- [ ] **Step 3: Add the facts row** (`.topo-facts`, four tiles): **No polarity to match** / *Either wire, either way.* — **~1,000 ft per run** / *Panel to the last fixture.* — **Test before software** / *Buttons and status lights on the controller check a run on the spot.* — **Change it later** / *Add or rearrange without a redesign.* Keep the hospital image below with a plainer caption: **First deployment — the largest install of its kind in North America.**

- [ ] **Step 4: Verify (render + color‑independent meaning).**

Run: `node scratchpad/verify-dali.mjs "Two wires, almost any shape"` → PASS light/dark.
Confirm in both screenshots that "Supported"/"Not supported" read from the **text + icon**, not color alone, and Ring/Mesh use coral.

- [ ] **Step 5: Commit.**

```bash
git add dali-2-showcase.html
git commit -m "feat(dali): Stage 1 Install with rebuilt topology diagram"
```

---

## Task 5: Stage 2 — Commission (the core UX win)

**Files:**
- Modify: `dali-2-showcase.html` — the `<!-- APPROACH -->`, `<!-- SHOWCASE: COMMISSIONING FLOW -->`, and `<!-- THE PIVOT -->` sections. **Retain** the `.tl` timeline block, the reframe `.card`, and the real screenshots; rewrite surrounding copy to plain language and merge under one **Stage 2 · Commission** banner.

**Interfaces:**
- Consumes: existing `.tl` and screenshot markup. Produces: the commission steps the blueprint (Task 6) mirrors.

- [ ] **Step 1: Set the stage header.** Eyebrow **Stage 2 · Commission**, `<h2>` **From "wait for it" to "work through it"**, lead **Bringing a floor online used to mean staring at a loading screen. Adding one controller froze the entire app while it read every device — up to 27 and a half minutes, times ten controllers. The fix wasn't a faster wait. It was designing so there's no wait to sit through.**

- [ ] **Step 2: Simplify the approach list** to four plain items (replace jargon): **Add controllers, not chaos** — *find a controller by name; its devices come with it.* / **Nothing blocks** — *leave and start setting up rooms while it imports.* / **Progress stays in view** — *two banners track the import the whole way.* / **Devices number themselves** — *no manual addressing, ever.*

- [ ] **Step 3: Keep the V1→V2 timeline** (`.tl` block) verbatim but rewrite its labels/caption to drop "UI"/"hubs" jargon: `V1 · SCREEN LOCKED` / `V2 · YOU KEEP WORKING` / `V2 · IMPORT RUNS BEHIND IT`, and the note to **One controller, worst case from the real figures · gray = locked · teal = working · pale = import running behind the screen.** Keep the real V1 blocking‑modal screenshot; change its caption to **The old first build: one modal, the whole app frozen behind it.** Rewrite the reframe pull‑quote card bullets to the three plain lines from Step 2.

- [ ] **Step 4: Keep the three commissioning screenshots**; rewrite captions to **Step 1 · Find the controller** / **Step 2 · Name it, on the spot** / **Step 3 · Added — with the count still in view.** Ensure no `alt`/caption contains forbidden tokens.

- [ ] **Step 5: Verify.**

Run: `node scratchpad/verify-dali.mjs "work through it"` → PASS light/dark.
Run: `grep -oiE '\b(WAC|MQTT|DT[0678]|CCI|mDNS|UDP|bus scan)\b' dali-2-showcase.html | sort | uniq -c` → count should be dropping toward zero (Stage 2 region clean).

- [ ] **Step 6: Commit.**

```bash
git add dali-2-showcase.html
git commit -m "feat(dali): Stage 2 Commission, plain-language reframe"
```

---

## Task 6: Service blueprint component

**Files:**
- Modify: `dali-2-showcase.html` — add `.bp` CSS; insert a blueprint section immediately after Stage 2.

**Interfaces:**
- Consumes: tokens; mirrors the three commission steps from Task 5. Produces: nothing downstream.

- [ ] **Step 1: Add blueprint CSS:**

```css
.bp{max-width:1000px;margin:34px auto 0}
.bp-grid{display:grid;grid-template-columns:150px repeat(3,1fr);gap:0;border:1px solid var(--c-b2);border-radius:16px;overflow:hidden}
.bp-cell{padding:16px 16px;border-left:1px solid var(--c-b1);border-top:1px solid var(--c-b1);font-size:13px;line-height:1.5;color:var(--c-body)}
.bp-side{border-left:0;background:var(--c-card);font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--c-muted);display:flex;align-items:center}
.bp-step{border-top:0;background:var(--c-card);font-family:'Inter',sans-serif;font-weight:600;color:var(--c-ink2);font-size:13.5px}
.bp-line{grid-column:1/-1;height:0;border-top:1px dashed var(--c-line2);position:relative}
.bp-line span{position:absolute;left:12px;top:-8px;background:var(--c-bg);padding:0 8px;font-family:'JetBrains Mono',monospace;font-size:8.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--c-muted)}
@media(max-width:720px){.bp-grid{grid-template-columns:1fr}.bp-side{border-top:1px solid var(--c-b1)}.bp-line{display:none}}
```

- [ ] **Step 2: Build the blueprint** inside a `pad` (or `band`) section: eyebrow **Under the hood**, `<h2>` **What you see vs. what it's doing**, lead **The trick to a wait you don't feel: move the slow work out of sight. Above the line is what the technician sees; below is what the system quietly does for them.** Then a `.bp-grid` with header row (empty side cell + three `.bp-step`: **Find the controller / Add it / Sort into rooms**), a **Frontstage** row (`.bp-side` + three `.bp-cell`: *Pick it by name* / *Tap Add — keep moving* / *Drag devices into rooms*), the `.bp-line` with `<span>Line of visibility</span>`, and a **Backstage** row (`.bp-side` + three `.bp-cell`: *Reads the wire, finds every device* / *Gives each device an address* / *Imports in the background, reports progress*). Add `role="img"` + `aria-label` summarizing the six cells. On mobile the grid stacks (side labels re‑appear as row headers).

- [ ] **Step 3: Verify.**

Run: `node scratchpad/verify-dali.mjs "What you see vs. what it"` → PASS light/dark. Confirm the grid does not cause horizontal overflow at 375px (harness checks documentElement; also spot‑check by resizing).

- [ ] **Step 4: Commit.**

```bash
git add dali-2-showcase.html
git commit -m "feat(dali): add service blueprint (frontstage vs backstage)"
```

---

## Task 7: Stage 3 — Operate (lifecycle, plain)

**Files:**
- Modify: `dali-2-showcase.html` — the `<!-- HUB MANAGEMENT + FLOOR PLAN GRID -->` (`#lifecycle`) and `<!-- SHOWCASE: FLOOR PLAN (sand) -->` sections. Retain the lifecycle + floor‑plan screenshots; rewrite copy under a **Stage 3 · Operate** header.

**Interfaces:**
- Consumes: existing lifecycle/floor‑plan screenshot markup. Produces: nothing downstream.

- [ ] **Step 1: Header + lead.** Eyebrow **Stage 3 · Operate**, `<h2>` **Life after launch**, lead **Hospitals change. Floors get reconfigured, fixtures get added, a controller fails. The system has to bend without going dark.**

- [ ] **Step 2: Rewrite the three lifecycle captions** to: **See what's on a run at a glance** / **Rescan to pick up what's new** / **Add the new devices — no downtime.** Rewrite the bus‑capacity bar labels to plain words (fixtures / wall stations / sensors / switch inputs / free). Keep the floor‑plan band; rewrite its copy to **Scales from a handful to thousands — same map** and captions **Filter to one run before it loads · grouped at floor zoom · individual devices when you zoom in.** Remove any `alt`/caption jargon.

- [ ] **Step 3: Verify.**

Run: `node scratchpad/verify-dali.mjs "Life after launch"` → PASS light/dark.

- [ ] **Step 4: Commit.**

```bash
git add dali-2-showcase.html
git commit -m "feat(dali): Stage 3 Operate, plain lifecycle copy"
```

---

## Task 8: Research section (honest method)

**Files:**
- Modify: `dali-2-showcase.html` — replace the `<!-- CRAFT: DEVICE TAXONOMY -->` section with a **Research** section. (The icon craft story moves out of the Quick tour; it remains in the Deep dive.)

**Interfaces:**
- Consumes: `.card`, tokens. Produces: nothing downstream.

- [ ] **Step 1: Build Research.** Eyebrow **How we knew**, `<h2>` **We watched people use it**, lead **Before shipping, we sat with people and gave them the real jobs — on the actual screens — across all three flows: find and add a controller, manage it, and sort devices into rooms.** Then a two‑column layout: left = a list of the real tasks (plain), right = the two insights that changed the design.
  - Tasks (mono list): **"Add this controller."** · **"Rename it — did the run labels follow?"** · **"Put this fixture in this room."** · **"Assign a run's devices into a zone."** · **"What do these running totals tell you?"**
  - Insight cards (each `.card`): **Renames must ripple.** *People expected a new name to show up everywhere at once — so labels now update across the app together.* — **A floor is a thousand devices on one screen.** *So we filter to a single run before anything loads, and cluster the map until you zoom in.*
  - No participant counts, quotes, or metrics — describe method and the design changes only.

- [ ] **Step 2: Verify.**

Run: `node scratchpad/verify-dali.mjs "We watched people use it"` → PASS light/dark.

- [ ] **Step 3: Commit.**

```bash
git add dali-2-showcase.html
git commit -m "feat(dali): add honest research (moderated task-based usability)"
```

---

## Task 9: Testing section (proof)

**Files:**
- Modify: `dali-2-showcase.html` — the `<!-- OUTCOME -->` and `<!-- RESULTS -->` sections become a **Testing** section. Retain the `.results` counter component; re‑label plainly.

**Interfaces:**
- Consumes: existing `.results` / `[data-count]` counters and the counter JS at the bottom. Produces: nothing downstream.

- [ ] **Step 1: Header + lead.** Eyebrow **Proof**, `<h2>` **Then we tried to break it**, lead **On a bench wired like the real thing, we ran more than 200 kinds of device across all four runs — dimming, color‑tuning, wall‑station scenes, and daylight response — across dozens of rooms. The large majority passed; a handful waited on hardware to arrive.**

- [ ] **Step 2: Re‑label the counters** (keep `data-count` values and JS): `10,000+` **Devices at full hospital scale** / `12/12` **Core scenarios passed** / `200+` **Device types across all four runs** / drop the "icon set" stat (the icon craft moved to the Deep dive) and replace with `24` **Runs on a single floor** (`data-count="24"`). Keep the reduced‑motion/counter script intact.

- [ ] **Step 3: Deployment line.** Add a mono line: **First deployment — Peter Gilgan Mississauga Hospital, the largest install of its kind in North America.** Remove the old all‑caps line that names the manufacturer program/version.

- [ ] **Step 4: Verify.**

Run: `node scratchpad/verify-dali.mjs "Then we tried to break it"` → PASS light/dark. Confirm counters still animate and the 24 tile renders.

- [ ] **Step 5: Commit.**

```bash
git add dali-2-showcase.html
git commit -m "feat(dali): Testing section with plain, honest proof"
```

---

## Task 10: Outcomes + market echo, and final acceptance

**Files:**
- Modify: `dali-2-showcase.html` — the `<!-- QUOTE -->` and `<!-- THE ECHO -->` sections (retain the LinkedIn echo image); final jargon sweep across the whole file.

**Interfaces:**
- Consumes: everything prior. Produces: the finished page.

- [ ] **Step 1: Outcomes framing.** Before the echo, set eyebrow **Outcome**, `<h2>` **Shipped — and the market repeated it back**, lead **It shipped across phone and web: a commissioning experience with no dead time, where devices name and number themselves.** Rewrite the pull quote to **The engineering answer was a longer timeout. The design answer was to make the wait disappear.**

- [ ] **Step 2: Keep the echo** block + image; rewrite its copy to plain language: **The manufacturer's own campaign, "DALI, Simplified," now leads with the promise this work was built around — using the shipped app as its hero image.** Ensure the image `alt` carries no ticket IDs/versions.

- [ ] **Step 3: Whole‑file jargon sweep — the guard must now PASS.**

Run: `grep -oiE '\b(WAC|MQTT|DT[0678]|CCI|mDNS|UDP|bus scan)\b' dali-2-showcase.html`
Expected: **no output.** Fix any straggler (check image `alt` text and captions).

- [ ] **Step 4: Confidentiality guard — must PASS.**

Run: `grep -niE '\b(OCB|WVX|PCB|ELMS|CLUX|CONBLDG)-[0-9]|dtf\.signify|collaboration\.dtf|tracker\.dtf|Trellix|Lighting Xpert|SR1[0-9]\b|Gen ?2\.5' dali-2-showcase.html`
Expected: **no output.**

- [ ] **Step 5: DALI‑2 count guard.**

Run: `grep -oiE 'DALI-2|DALI‑2' dali-2-showcase.html | wc -l` — expected ≤ 3 (hero prose + the untouched SEO/title block). Confirm body prose mentions it only in the hero.

- [ ] **Step 6: Full render + a11y spot‑check (light + dark).**

Run: `node scratchpad/verify-dali.mjs "Follow it end to end"`
Expected: `PASS light` / `PASS dark` (zero console errors, no horizontal overflow). Open both full‑page screenshots and confirm: one accent per band; coral only on Ring/Mesh + always with text; all three new components legible in dark mode; keyboard focus visible on the two hero buttons and nav (tab through). Re‑run once at a 375px viewport (add `await p.setViewportSize({width:375,height:800})` before goto, or resize) to confirm no mobile overflow.

- [ ] **Step 7: Commit.**

```bash
git add dali-2-showcase.html
git commit -m "feat(dali): outcomes + market echo; final jargon & confidentiality sweep"
```

---

## Self‑Review (completed while writing)

**Spec coverage:** hero/intro → Task 2; journey map → Task 3; Stage 1 + topology → Task 4; Stage 2 commission → Task 5; blueprint → Task 6; Stage 3 operate → Task 7; research → Task 8; testing → Task 9; outcomes + echo + guards → Task 10; token + harness + guards → Task 1. Shell untouched throughout. Every spec §5 fact has a home. ✎ Icon‑craft section is intentionally dropped from the Quick tour (noted in Task 8) — it lives in the Deep dive.

**Placeholder scan:** each task carries the actual final copy and the actual CSS/SVG approach; no "TBD"/"add appropriate…". Verification commands are concrete.

**Type/name consistency:** class names (`.jm`, `.topo`, `.bp`, `--c-risk`) are defined in the task that introduces them and reused consistently; the harness path and port (`8971`) are constant across tasks; forbidden‑token guard regex is identical in Tasks 1, 5, and 10.
