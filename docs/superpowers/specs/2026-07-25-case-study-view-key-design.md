# Design Spec — Case-study "View key" (how-to-read legend)

**Files:** `homepage-interactive.dc.html`, `homepage-dossier.dc.html`, `homepage-retro.dc.html`, `work.dc.html`
**Date:** 2026-07-25 · **Owner:** Robert Babiarz
**Status:** Draft for review

---

## 1. Problem

Every case study ships in three depths behind one floating control (the `.verpill`, "View"): a **Quick tour** (`*-showcase.html`), a **Deep dive** (`*.dc.html` / `*.html`), and a **▶ play button** that jumps into that study's live, clickable prototype. But that control only appears **inside** a case study. On the homepages and the work page, the list rows link straight to the Quick tour with **no hint** that a deeper read or a live prototype exists behind them. A first-time visitor can't tell there's more than one way in.

**Goal:** add a small, illustrative **"View key"** just above the case-study list on all three homepages and the work page. It reproduces the real View control and glosses each part, so a visitor knows — before clicking — what the two views are and that the ▶ opens a live prototype, and recognizes the control when they meet it inside a study.

**Success =** a visitor scanning any of the four pages can state, without opening a case study: each study has a *quick tour* and a *deep dive*, and a *play button* that jumps into a working prototype.

## 2. What it is

An **illustrative legend**, not a live control. There is no single "deep dive" or "prototype" to link to from a list of 11 studies, so the key is explanatory only — it does not toggle or navigate. The working control lives inside each case study.

It has two stacked parts:

1. **A reproduced control** (recognition primer): `VIEW` label · `Quick tour` (rendered in the active/filled state, matching the real pill) · `Deep dive` · `▶`.
2. **Three gloss lines** (the meaning), keyed to the same labels.

## 3. Exact copy

Lead line:
> Every case study opens with this control:

Reproduced control (visual, decorative): **`VIEW`   ( Quick tour )   Deep dive   ▶**

Gloss lines:
- **Quick tour** — the outcomes, at a glance · ~3–5 min
- **Deep dive** — the full story: process, decisions, and the paths I didn't take · ~8–12 min
- **▶ Live demo** — jumps straight into the working, clickable prototype

**Voice notes:** mono for the system label (`VIEW`, and the "Live demo" tag), sans for prose; lead with the verb ("jumps"); no jargon; every claim backed by the code (see §7). Times are ranges matching the existing concierge copy (`quick tours ≈ 3–5 min, deep dives ≈ 8–12 min`).

## 4. Placement (before the list only)

| Page | Anchor (insert immediately here, above the list) |
|---|---|
| `homepage-interactive.dc.html` | Inside `#work`, after the "Selected Work" heading block, before `#proj-list` (~line 613, between the header flex `div` close and `#proj-list` open) |
| `homepage-dossier.dc.html` | Top of `<section id="files">`, above the `.dsr-file` list (~line 462+, before the file `.map`) |
| `homepage-retro.dc.html` | Below the `C:\> DIR /WORK /CASE-FILES` header, above the first `.rt-file` (~line 280–285) |
| `work.dc.html` | After the header strip (the "Browse the case studies" block), before the carousel stage `#wk-stage` (~line 267–269) |

All four are `.dc.html` — the key is **static markup inside each `<x-dc>` template**. No JS, no new runtime module. No `{{ }}` tokens in the key content, so nothing to escape.

## 5. Styling — one component, four skins

The key is a **structural pattern** (lead line → reproduced control → three glosses), skinned per page so it never looks bolted on. Each skin matches its page's **existing** convention:

| Variant | Treatment | Color source |
|---|---|---|
| **Interactive** | Quiet hairline card / slim band; Inter + JetBrains Mono | Tokens: `var(--fg)`, `var(--fg2)`, `var(--fg3)`, `var(--line)`, `var(--ac)`, `var(--bg)` / `var(--bg2)` |
| **Work page** | Same token set; slim band under the header strip | Same tokens as Interactive |
| **Dossier** | "Legend" stamp in the case-file palette; reads like a file key | Match the file's **local** palette: cream `#f4ead2`, ink `#0a0a0a`, redaction-red `#b23a2e`, muted `#6b5d42`, JetBrains Mono |
| **Retro** | Terminal `LEGEND:` / man-page line in phosphor + amber | Match the file's **local** palette: green `#6cf0a4` / `#cdffe2`, amber `#ffb454`, dark `#04130b` / `#030605`, monospace |

**Token discipline:** Interactive and Work page are token-driven — use `var(--…)`, no raw hex. Dossier and Retro are bespoke variants whose entire files inline a page-local palette; the key matches that local convention. This is a **deliberate, scoped exception** — do **not** introduce shared design-system tokens for a one-variant theme palette.

**Active-state parity:** the reproduced `Quick tour` renders in the same filled/active style the real `.verpill` uses in each context, so the primer looks like the control the visitor will meet.

## 6. Behavior & accessibility

- **Static.** No new motion. If a page's list already uses an audited entrance (Interactive/Work `data-reveal`, Dossier `.dsr-stagger`), the key may reuse that page's existing mechanism for consistency; otherwise it is static. No new animation is authored, so `prefers-reduced-motion` is inherently respected.
- **Meaning survives without color.** The reproduced pill/▶ is **decorative** (`aria-hidden="true"`); all meaning is carried by the three text gloss lines, which are real, selectable text. The "active" Quick-tour state is not the only signal — the label and its gloss carry it.
- **No false affordance.** The key is not interactive: no `<a>`, no `cursor:pointer`, no hover lift on the reproduced control. It must not read as clickable.
- **Contrast.** Use each page's audited body text colors (already AA in `WCAG-2.2-AODA-AUDIT.md`); do not introduce a new low-contrast pairing.
- **Icon.** The ▶ uses the existing Material Symbols `play_arrow` glyph (already in each page's `icon_names=` subset — verify per file; add if missing). It is `aria-hidden`; the "Live demo" text carries the meaning.

## 7. Facts this key may state (verified against code)

- **All 11 showcase pages** carry the ▶ `.vdemo` button linking into a live prototype / demo section (verified: `grep 'class="vdemo"' *-showcase.html` → 11/11). So "every case study opens a live prototype" is accurate — no hedging.
- Quick tour = `*-showcase.html`; Deep dive = `*.dc.html` / `*.html`; ▶ target is per-study (e.g. `dali-2.dc.html#s-floor`, `#floor`, `#network`, `light-architect.html#sandbox`). The key describes these **generically** — it does not name per-study targets.
- Read-time ranges (3–5 / 8–12 min) come from `concierge.js` (`read: 'N min tour · N min deep dive'`; the concierge reply already states the ≈ ranges).

## 8. Non-goals

- **Not** adding a working toggle or deep links to the lists — the key is explanatory only.
- **Not** placing a key after the list, or a second copy — one key, before the list (per decision).
- **Not** touching the real `.verpill` control inside showcase pages, the list rows, the carousel, or any case-study content.
- **Not** introducing shared tokens for the Dossier/Retro page-local palettes.
- **Not** inventing per-study read times or prototype descriptions.

## 9. Open assumptions (flag if wrong)

- The key is a legend, **not** a live control (no per-item deep-linking). If each item should instead deep-link to a *featured* case study, that changes the component from illustrative to interactive.
- Times shown as ranges are wanted; if the key should be cleaner, drop the `~N–N min` fragments.
- On the work page, "before the list" = above the carousel stage (the list *is* the carousel). If a different anchor is wanted (e.g. above the Index-mode list specifically), adjust.
