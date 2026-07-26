# Case-study "View key" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a small illustrative "View key" above the case-study list on all three homepages and the work page, reproducing the real View control (Quick tour / Deep dive / ▶) and glossing each part.

**Architecture:** One structural pattern (lead line → decorative reproduced control → three text glosses), inserted as static markup inside each page's `<x-dc>` template and skinned four ways to match each page's existing look. No shared component (the codebase inlines per file), no JS, no new runtime module. A small Playwright harness renders each page and asserts DOM order, `aria-hidden`, gloss text, and no mobile overflow.

**Tech Stack:** Self-contained `.dc.html` (support.js renders `<x-dc>` with React from CDN), inline CSS, Material Symbols (`play_arrow`), Playwright via npx for render verification, `python3 -m http.server` for local serving.

## Global Constraints

Every task's requirements implicitly include this section.

- **Static markup only.** The key is plain HTML inside each `<x-dc>` template. No new `<script>`, no new JS module, no build step. No `{{ }}` template tokens in the key (nothing to escape).
- **One key per page, before the list only.** No second copy after the list.
- **Non-interactive.** No `<a>`, no `cursor:pointer`, no hover state on the key. It must not read as clickable.
- **Reproduced control is decorative.** The reproduced pill/row carries `data-viewkey-ctrl aria-hidden="true"`. All meaning is carried by the three text glosses (real, selectable text).
- **Meaning survives without color.** Never let hue be the sole signal. Dossier red (`#b23a2e`) and Retro amber (`#ffb454`) appear only on decorative glyphs; the gloss *text* uses each page's high-contrast body ink.
- **Token discipline.** Interactive + Work: use `var(--bg)`, `var(--bg2)`, `var(--fg)`, `var(--fg2)`, `var(--fg3)`, `var(--line)`, `var(--ac)` — no raw hex. Dossier + Retro: match the file's own hardcoded palette (documented scoped exception — do NOT add shared tokens for a page-local variant theme).
- **Icon:** `<span class="msi" aria-hidden="true">play_arrow</span>`. Add `play_arrow` to the `icon_names=` subset on the three homepages (work.dc.html already has it).
- **No new motion.** Reduced-motion-safe. Interactive key reuses the section's existing `data-reveal="true"`; Work/Dossier/Retro keys are static.
- **Copy is fixed.** Interactive/Work/Dossier use the exact copy in Task 1. Retro uses the terminal-voiced equivalent in Task 4 (same meaning, uppercase register) — provided verbatim; do not improvise.
- **Generic ▶ description.** Describe the play button as "the working, clickable prototype"; do not name per-study demo anchors.
- **Contrast ≥ 4.5:1** for gloss text, using each page's audited colors (`WCAG-2.2-AODA-AUDIT.md`).
- **Verified facts:** all 11 showcase pages carry the ▶ `.vdemo` button (so "every case study opens a live prototype" is accurate); read-time ranges (3–5 / 8–12 min) come from `concierge.js`.

**Canonical copy (Interactive / Work / Dossier):**
- Lead: `Every case study opens with this control`
- Gloss 1: **Quick tour** — the outcomes, at a glance · ~3–5 min
- Gloss 2: **Deep dive** — the full story: process, decisions, and the paths I didn't take · ~8–12 min
- Gloss 3: **▶ Live demo** — jumps into the working, clickable prototype

---

### Task 1: Interactive homepage key + verification harness

**Files:**
- Create: `scratchpad/verify-viewkey.mjs` (session scratchpad — not committed)
- Modify: `homepage-interactive.dc.html` — icon subset (~line 7) + insert key inside `#work` (between line 612 `</div>` and line 614 `<div id="proj-list">`)

**Interfaces:**
- Produces: `scratchpad/verify-viewkey.mjs`, run as `node verify-viewkey.mjs <url> <listSelector> [--dark]`. Asserts one `#viewkey` exists, precedes `<listSelector>` in DOM order, its `[data-viewkey-ctrl]` child is `aria-hidden="true"`, the gloss `<ul>` contains "Quick tour"/"Deep dive"/"Live demo", and no horizontal overflow at 390px. Writes `shot-<page>-{light,dark,mobile}.png`. Exit 0 = PASS, 1 = FAIL. Reused by Tasks 2–4.
- Produces: the key markup shape reused (re-skinned) by Tasks 2–4; each key carries `id="viewkey"` and a `data-viewkey-ctrl` control child.

- [ ] **Step 1: Write the verification harness**

Create `scratchpad/verify-viewkey.mjs`:

```js
// verify-viewkey.mjs — render + assert the View key on one page.
// Usage: node verify-viewkey.mjs <url> <listSelector> [--dark]
import { chromium } from 'playwright';

const [, , url, listSel, ...rest] = process.argv;
const dark = rest.includes('--dark');
const name = url.split('/').pop().replace(/\.[^.]+$/, '');
const OUT = new URL('.', import.meta.url).pathname;
let failed = false;
const assert = (cond, msg) => { console.log((cond ? 'PASS' : 'FAIL') + ': ' + msg); if (!cond) failed = true; };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForSelector('#viewkey', { timeout: 8000 }).catch(() => {});

assert((await page.locator('#viewkey').count()) === 1, 'exactly one #viewkey present');

const order = await page.evaluate((sel) => {
  const k = document.getElementById('viewkey');
  const l = document.querySelector(sel);
  if (!k || !l) return 'missing';
  return (k.compareDocumentPosition(l) & Node.DOCUMENT_POSITION_FOLLOWING) ? 'before' : 'after';
}, listSel);
assert(order === 'before', `#viewkey precedes ${listSel} (got: ${order})`);

const ctrlHidden = await page.evaluate(() => {
  const c = document.querySelector('#viewkey [data-viewkey-ctrl]');
  return c ? c.getAttribute('aria-hidden') : null;
});
assert(ctrlHidden === 'true', 'reproduced control has aria-hidden="true"');

const text = await page.locator('#viewkey ul').innerText().catch(() => '');
assert(/quick tour/i.test(text), 'gloss mentions Quick tour');
assert(/deep dive/i.test(text), 'gloss mentions Deep dive');
assert(/live demo/i.test(text), 'gloss mentions Live demo');

await page.locator('#viewkey').screenshot({ path: `${OUT}shot-${name}-light.png` }).catch(() => {});

if (dark) {
  await page.evaluate(() => { try { localStorage.setItem('rba-int-dark', 'true'); } catch (e) {} });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('#viewkey').catch(() => {});
  await page.locator('#viewkey').screenshot({ path: `${OUT}shot-${name}-dark.png` }).catch(() => {});
}

await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(200);
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
assert(overflow <= 1, `no horizontal overflow at 390px (delta=${overflow}px)`);
await page.locator('#viewkey').screenshot({ path: `${OUT}shot-${name}-mobile.png` }).catch(() => {});

await browser.close();
console.log(failed ? '\nRESULT: FAIL' : '\nRESULT: PASS');
process.exit(failed ? 1 : 0);
```

- [ ] **Step 2: Start the local server (leave running for all tasks)**

Run from the repo root (background):

```bash
python3 -m http.server 8971
```

If Playwright's browser isn't installed: `npx playwright install chromium` (idempotent). If `node` can't resolve `playwright`, run the script from a dir where it resolves, or `npm i --no-save playwright` in the scratchpad. Fallback if Playwright is unavailable: open each URL in a browser and walk the acceptance checklist manually.

- [ ] **Step 3: Run the harness against the un-modified page to watch it FAIL**

Run: `node scratchpad/verify-viewkey.mjs http://localhost:8971/homepage-interactive.dc.html '#proj-list'`
Expected: `FAIL: exactly one #viewkey present` → `RESULT: FAIL` (the key isn't there yet).

- [ ] **Step 4: Add `play_arrow` to the icon subset**

In `homepage-interactive.dc.html` (~line 7), replace `open_in_new,refresh` with `open_in_new,play_arrow,refresh` inside the `icon_names=` list.

- [ ] **Step 5: Insert the key markup**

In `homepage-interactive.dc.html`, insert between the header block close (line 612 `</div>`) and `<div id="proj-list" ...>` (line 614):

```html
      <!-- VIEW KEY — how to read the case studies -->
      <div id="viewkey" data-reveal="true" style="margin:0 0 22px;padding:16px 20px;border:1px solid var(--line);border-radius:14px;background:var(--bg2);">
        <p style="margin:0 0 12px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:var(--fg3);">Every case study opens with this control</p>
        <div data-viewkey-ctrl aria-hidden="true" style="display:inline-flex;align-items:center;gap:9px;padding:6px 10px 6px 12px;border:1px solid var(--line);border-radius:999px;background:var(--bg);margin-bottom:14px;">
          <span style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.14em;color:var(--fg3);">VIEW</span>
          <span style="font-family:'Inter',sans-serif;font-size:12.5px;font-weight:600;color:var(--bg);background:var(--ac);padding:5px 13px;border-radius:999px;">Quick tour</span>
          <span style="font-family:'Inter',sans-serif;font-size:12.5px;font-weight:500;color:var(--fg2);">Deep dive</span>
          <span class="msi" style="font-size:19px;color:var(--ac);">play_arrow</span>
        </div>
        <ul style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:7px;font-family:'Inter',sans-serif;font-size:13px;line-height:1.5;color:var(--fg2);">
          <li><strong style="color:var(--fg);font-weight:600;">Quick tour</strong> — the outcomes, at a glance · ~3–5 min</li>
          <li><strong style="color:var(--fg);font-weight:600;">Deep dive</strong> — the full story: process, decisions, and the paths I didn't take · ~8–12 min</li>
          <li><span class="msi" aria-hidden="true" style="font-size:16px;color:var(--ac);vertical-align:-3px;">play_arrow</span> <strong style="color:var(--fg);font-weight:600;">Live demo</strong> — jumps into the working, clickable prototype</li>
        </ul>
      </div>
```

- [ ] **Step 6: Run the harness — expect PASS**

Run: `node scratchpad/verify-viewkey.mjs http://localhost:8971/homepage-interactive.dc.html '#proj-list' --dark`
Expected: all `PASS`, `RESULT: PASS`.

Acceptance checklist (eyeball `shot-homepage-interactive-*.png`):
- Key sits directly above the Selected Work list, inside the section's max width.
- Reproduced pill reads `VIEW  (Quick tour, filled)  Deep dive  ▶`; filled Quick tour matches the page accent.
- Three glosses legible in light AND dark; no clipping at 390px.

- [ ] **Step 7: Commit**

```bash
git add homepage-interactive.dc.html
git commit -m "Add the View key explainer to the Interactive homepage

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Work page key

**Files:**
- Modify: `work.dc.html` — insert key after the header strip (`</div>` at line 267), before `<!-- COVERFLOW STAGE -->` / `#wk-stage` (line 269). `play_arrow` already in this file's icon subset — no head edit.

**Interfaces:**
- Consumes: `scratchpad/verify-viewkey.mjs` (Task 1); server on :8971.

- [ ] **Step 1: Insert the key markup**

In `work.dc.html`, insert between line 267 (`</div>` closing the header strip) and line 269 (`<!-- ═══ COVERFLOW STAGE ═══ -->`):

```html
  <!-- VIEW KEY — how to read the case studies -->
  <div style="position:relative;z-index:2;padding:20px 44px 0;">
    <div id="viewkey" style="padding:16px 20px;border:1px solid var(--line);border-radius:14px;background:var(--bg2);">
      <p style="margin:0 0 12px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:var(--fg3);">Every case study opens with this control</p>
      <div data-viewkey-ctrl aria-hidden="true" style="display:inline-flex;align-items:center;gap:9px;padding:6px 10px 6px 12px;border:1px solid var(--line);border-radius:999px;background:var(--bg);margin-bottom:14px;">
        <span style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.14em;color:var(--fg3);">VIEW</span>
        <span style="font-family:'Inter',sans-serif;font-size:12.5px;font-weight:600;color:var(--bg);background:var(--ac);padding:5px 13px;border-radius:999px;">Quick tour</span>
        <span style="font-family:'Inter',sans-serif;font-size:12.5px;font-weight:500;color:var(--fg2);">Deep dive</span>
        <span class="msi" style="font-size:19px;color:var(--ac);">play_arrow</span>
      </div>
      <ul style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:7px;font-family:'Inter',sans-serif;font-size:13px;line-height:1.5;color:var(--fg2);">
        <li><strong style="color:var(--fg);font-weight:600;">Quick tour</strong> — the outcomes, at a glance · ~3–5 min</li>
        <li><strong style="color:var(--fg);font-weight:600;">Deep dive</strong> — the full story: process, decisions, and the paths I didn't take · ~8–12 min</li>
        <li><span class="msi" aria-hidden="true" style="font-size:16px;color:var(--ac);vertical-align:-3px;">play_arrow</span> <strong style="color:var(--fg);font-weight:600;">Live demo</strong> — jumps into the working, clickable prototype</li>
      </ul>
    </div>
  </div>
```

- [ ] **Step 2: Run the harness — expect PASS**

Run: `node scratchpad/verify-viewkey.mjs http://localhost:8971/work.dc.html '#wk-stage' --dark`
Expected: all `PASS`, `RESULT: PASS`.

Acceptance checklist (eyeball `shot-work-*.png`):
- Key sits under the "Browse the case studies" header, above the carousel, aligned to the 44px page gutters.
- Renders in whatever theme the work page is in; glosses legible; no 390px overflow.

- [ ] **Step 3: Commit**

```bash
git add work.dc.html
git commit -m "Add the View key explainer to the Work page

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Dossier homepage key (case-file skin)

**Files:**
- Modify: `homepage-dossier.dc.html` — icon subset (~line 7) + insert key inside `#files`, between the header flex close (line 469 `</div>`) and the list wrapper `<div style="border-top:1.5px solid #0a0a0a;">` (line 471)

**Interfaces:**
- Consumes: `scratchpad/verify-viewkey.mjs`; server on :8971.

**Skin note:** Dossier is a print/case-file aesthetic — cream `#f4ead2`, ink `#0a0a0a`, redaction-red `#b23a2e`, muted `#6b5d42`, JetBrains Mono, sharp corners. The reproduced control is a rectangular bordered stamp (not a rounded pill); active Quick tour is ink-filled. This matches the file's own palette (documented scoped exception to token rules).

- [ ] **Step 1: Add `play_arrow` to the icon subset**

In `homepage-dossier.dc.html` (~line 7), replace `open_in_new,refresh` with `open_in_new,play_arrow,refresh` in the `icon_names=` list.

- [ ] **Step 2: Insert the key markup**

Insert between line 469 (`</div>`) and line 471 (`<div style="border-top:1.5px solid #0a0a0a;">`):

```html
      <!-- VIEW KEY — how to read the case files -->
      <div id="viewkey" style="margin:0 0 30px;padding:18px 20px;border:1.5px solid #0a0a0a;background:rgba(10,8,4,0.03);">
        <p style="margin:0 0 12px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:#6b5d42;">Every file opens with this control</p>
        <div data-viewkey-ctrl aria-hidden="true" style="display:inline-flex;align-items:stretch;border:1.5px solid #0a0a0a;margin-bottom:14px;font-family:'JetBrains Mono',monospace;">
          <span style="display:flex;align-items:center;font-size:9.5px;letter-spacing:0.14em;color:#6b5d42;padding:0 10px;border-right:1.5px solid #0a0a0a;">VIEW</span>
          <span style="display:flex;align-items:center;font-size:11px;font-weight:700;letter-spacing:0.02em;color:#f4ead2;background:#0a0a0a;padding:7px 13px;">Quick tour</span>
          <span style="display:flex;align-items:center;font-size:11px;font-weight:600;letter-spacing:0.02em;color:#0a0a0a;padding:7px 13px;border-left:1.5px solid #0a0a0a;">Deep dive</span>
          <span style="display:flex;align-items:center;padding:0 10px;border-left:1.5px solid #0a0a0a;color:#b23a2e;"><span class="msi" style="font-size:18px;">play_arrow</span></span>
        </div>
        <ul style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:7px;font-family:'JetBrains Mono',monospace;font-size:11.5px;line-height:1.55;color:#3a3120;">
          <li><strong style="color:#0a0a0a;font-weight:700;">Quick tour</strong> — the outcomes, at a glance · ~3–5 min</li>
          <li><strong style="color:#0a0a0a;font-weight:700;">Deep dive</strong> — the full story: process, decisions, and the paths I didn't take · ~8–12 min</li>
          <li><span class="msi" aria-hidden="true" style="font-size:15px;color:#b23a2e;vertical-align:-3px;">play_arrow</span> <strong style="color:#0a0a0a;font-weight:700;">Live demo</strong> — jumps into the working, clickable prototype</li>
        </ul>
      </div>
```

- [ ] **Step 3: Run the harness — expect PASS**

Run: `node scratchpad/verify-viewkey.mjs http://localhost:8971/homepage-dossier.dc.html '.dsr-file'`
Expected: all `PASS`, `RESULT: PASS`.

Acceptance checklist (eyeball `shot-homepage-dossier-*.png`):
- Reads like a file legend/stamp: rectangular bordered control, ink-filled Quick tour, red ▶ glyph.
- Gloss body (`#3a3120` on cream) and labels (`#0a0a0a`) are crisp; red is only on the decorative glyphs, never carrying gloss meaning.
- No 390px overflow (the bordered control wraps or fits).

- [ ] **Step 4: Commit**

```bash
git add homepage-dossier.dc.html
git commit -m "Add the View key explainer to the Dossier homepage

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Retro homepage key (terminal skin)

**Files:**
- Modify: `homepage-retro.dc.html` — icon subset (~line 7) + insert key in the work-directory section, between the header-row close (line 282 `</div>`) and the list wrapper `<div style="border-top:1px solid rgba(108,240,164,0.28);...">` (line 283)

**Interfaces:**
- Consumes: `scratchpad/verify-viewkey.mjs`; server on :8971.

**Skin note:** Retro is a CRT terminal — phosphor `#6cf0a4`/`#9af0c2`/`#cdffe2`, dim `#3f9e69`, amber `#ffb454`, dark bg `#04130b`, monospace. The reproduced control is a terminal `VIEW:` line with a reverse-video active item and a bracketed `[▶]`. Copy is the terminal-voiced equivalent of the canonical copy (same meaning, uppercase register) — used verbatim below.

- [ ] **Step 1: Add `play_arrow` to the icon subset**

In `homepage-retro.dc.html` (~line 7), replace `open_in_new,refresh` with `open_in_new,play_arrow,refresh` in the `icon_names=` list.

- [ ] **Step 2: Insert the key markup**

Insert between line 282 (`</div>` closing the DIR header row) and line 283 (`<div style="border-top:1px solid rgba(108,240,164,0.28);...">`):

```html
      <!-- VIEW KEY — how to read the case files -->
      <div id="viewkey" style="margin:0 0 18px;padding:14px 16px;border:1px solid rgba(108,240,164,0.28);background:rgba(108,240,164,0.04);">
        <div style="font-size:13px;letter-spacing:0.06em;color:#cdffe2;margin-bottom:11px;">C:\&gt; <span style="color:#ffb454;">HELP</span> VIEW <span style="color:#3f9e69;">— every file opens with this control</span></div>
        <div data-viewkey-ctrl aria-hidden="true" style="display:inline-flex;align-items:center;gap:10px;font-size:13px;letter-spacing:0.04em;margin-bottom:13px;color:#6cf0a4;">
          <span style="color:#3f9e69;letter-spacing:0.1em;">VIEW:</span>
          <span style="background:#6cf0a4;color:#04130b;padding:3px 9px;font-weight:700;">QUICK TOUR</span>
          <span style="color:#9af0c2;">DEEP DIVE</span>
          <span style="color:#ffb454;display:inline-flex;align-items:center;">[<span class="msi" style="font-size:15px;vertical-align:-3px;">play_arrow</span>]</span>
        </div>
        <ul style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px;font-size:13px;line-height:1.5;color:#8fe6b4;">
          <li><span style="color:#cdffe2;">QUICK TOUR</span> — the outcomes, at a glance · 3–5 min</li>
          <li><span style="color:#cdffe2;">DEEP DIVE</span> — the full story: process, decisions, and the paths I didn't take · 8–12 min</li>
          <li><span style="color:#ffb454;">[<span class="msi" aria-hidden="true" style="font-size:14px;vertical-align:-3px;">play_arrow</span>] LIVE DEMO</span> — drops you into the running prototype</li>
        </ul>
      </div>
```

- [ ] **Step 3: Run the harness — expect PASS**

Run: `node scratchpad/verify-viewkey.mjs http://localhost:8971/homepage-retro.dc.html '.rt-file'`
Expected: all `PASS`, `RESULT: PASS`.

Acceptance checklist (eyeball `shot-homepage-retro-*.png`):
- Reads as a terminal `HELP VIEW` legend; reverse-video `QUICK TOUR` active chip; amber `[▶]`.
- **Contrast:** confirm gloss body `#8fe6b4` on the dark retro bg is ≥ 4.5:1 (it is brighter than the page's `#3f9e69` secondary; if a reviewer flags it, brighten toward `#9af0c2`). Amber is only on the decorative glyph + the "LIVE DEMO" label whose meaning is also the plain text.
- No 390px overflow.

- [ ] **Step 4: Commit**

```bash
git add homepage-retro.dc.html
git commit -m "Add the View key explainer to the Retro homepage

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Cross-page final pass + accessibility audit note

**Files:**
- Modify: `WCAG-2.2-AODA-AUDIT.md` — add one line recording the new component

**Interfaces:**
- Consumes: all four keys (Tasks 1–4).

- [ ] **Step 1: Re-run the harness on all four pages**

```bash
node scratchpad/verify-viewkey.mjs http://localhost:8971/homepage-interactive.dc.html '#proj-list' --dark
node scratchpad/verify-viewkey.mjs http://localhost:8971/work.dc.html '#wk-stage' --dark
node scratchpad/verify-viewkey.mjs http://localhost:8971/homepage-dossier.dc.html '.dsr-file'
node scratchpad/verify-viewkey.mjs http://localhost:8971/homepage-retro.dc.html '.rt-file'
```

Expected: `RESULT: PASS` for all four. Confirm the four keys read as the same component in four skins (same lead → control → three glosses; same meaning).

- [ ] **Step 2: Add an audit line**

In `WCAG-2.2-AODA-AUDIT.md`, add under the appropriate section:

```markdown
- **Case-study "View key"** (homepages ×3 + work page): non-interactive legend above the case-study list. The reproduced View control is decorative (`aria-hidden`); meaning is carried by three text glosses (Quick tour / Deep dive / Live demo). No color-only signal (dossier red / retro amber are on decorative glyphs only); gloss text meets AA on each page's background; static, so `prefers-reduced-motion` is honored by default.
```

- [ ] **Step 3: Commit**

```bash
git add WCAG-2.2-AODA-AUDIT.md
git commit -m "Record the View key explainer in the accessibility audit

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review

**1. Spec coverage:**
- Illustrative legend, not live control → Global Constraints (non-interactive) + all task markup (no `<a>`). ✓
- Exact copy → Global Constraints canonical block; Tasks 1–3 use it verbatim; Task 4 documents the retro variant. ✓
- Four insertion anchors → Tasks 1–4 give exact line anchors. ✓
- One-component / four-skin styling + token discipline → Tasks 1–2 (tokens), 3–4 (file-local palettes, flagged as scoped exception). ✓
- a11y: decorative control aria-hidden, text-carried meaning, no false affordance, contrast → Global Constraints + harness assertions + per-task checklist + Task 5 audit note. ✓
- Verified facts (11/11 ▶; read-time source) → Global Constraints. ✓
- Non-goals (no after-copy; no toggle; no per-study anchors) → Global Constraints + no such steps. ✓
- `play_arrow` subset gap on 3 homepages → Tasks 1/3/4 Step to add it; work.dc.html already has it (no step). ✓

**2. Placeholder scan:** No TBD/TODO; every code step contains real markup/script. ✓

**3. Type/name consistency:** Every key uses `id="viewkey"` + `data-viewkey-ctrl`; the harness selectors (`#viewkey`, `#viewkey [data-viewkey-ctrl]`, `#viewkey ul`) match the markup in all four tasks; list selectors (`#proj-list`, `#wk-stage`, `.dsr-file`, `.rt-file`) match each page. ✓
