# Robert Babiarz — Product Designer Portfolio

A static product design portfolio built as self-contained HTML pages rendered
client-side by a lightweight DesignCode (DC) runtime — **no build step, no server,
no backend.**

**Live site:** https://robertbabiarz.com/

---

## How it runs

Every page is a normal `.html` file. The `.dc.html` pages embed their markup inside an
`<x-dc>` template; [`support.js`](support.js) parses that inline markup and renders it
with React at load time. React/ReactDOM are loaded from the unpkg CDN over HTTPS — the
**only** external runtime dependency. There is no DesignCode server: the self-refresh
`fetch` in the runtime is best-effort and non-fatal, so the pages render purely from the
static files. This means the site works as-is on any static host, including GitHub Pages.

> An internet connection is needed on first load for the React CDN and Google Fonts.
> Fonts fall back to system fonts if unreachable.

---

## Site structure

```
index.html                      → redirects to the primary homepage (GitHub Pages entry)

homepage-interactive.dc.html    PRIMARY homepage
homepage-dossier.dc.html          alt homepage — "classified case-file" theme
homepage-retro.dc.html            alt homepage — CRT terminal theme
home-variants.js                  the VIEW switcher; remembers the chosen homepage

about.dc.html                     bio + experience
work.dc.html                      project index
*-showcase.html / *.dc.html       case studies (AEGIS, CTOC, CORE Insights, DALI-2, …)

Shared runtime & styling
  support.js  page-transition.js  a11y.js  text-motion.js
  tokens.css  styles.css  colors_and_type.css

Design system & project context (docs only — not loaded at runtime)
  DESIGN.md                       design philosophy, palette, principles
  design-system/                  foundations · components · patterns · usage-guidelines
  design-tokens.json  tokens/      portable mirror of the live CSS tokens
  docs/                           brief, PRD, decisions, personas, IA, metrics
  reference/                      research, brand, moodboards, flows
  .claude/                        rules, agents, commands for AI-assisted work
```

### The homepage variant switcher
The three homepages are interchangeable. The "VIEW" control sets
`localStorage["rb-home-variant"]`; on the next visit, [`home-variants.js`](home-variants.js)
routes the viewer to their chosen variant. `index.html` redirects into the Interactive
homepage, where this logic then takes over — which is why `index.html` redirects rather
than duplicating the homepage. The dark/light toggle persists separately in
`localStorage["rba-int-dark"]`.

---

## Design system

The visual system has two layers, documented in [`DESIGN.md`](DESIGN.md) and
[`design-system/`](design-system/):

1. **A shared foundational scale** — type, spacing, radius, shadow, transitions, and brand color
   cards — in [`tokens.css`](tokens.css) (the SOC/CTOC dashboard skin in `styles.css` builds on it).
2. **Per-surface color palettes** layered on top — Interactive (dark-first with a `.light`
   "architect" mirror), Dossier (cream/classified-red), Retro (CRT phosphor), and CTOC (severity
   scale) — declared inline in each prototype's `:root` / `.light`.

[`design-tokens.json`](design-tokens.json) and [`tokens/`](tokens/) are a portable mirror of both
layers (not consumed at runtime). House rules: reference `var(--…)` tokens (never hardcode), one
accent per screen, meaning never rides on hue alone, WCAG 2.2 AA / AODA, and every animation gates
on `prefers-reduced-motion`. Details in
[`design-system/usage-guidelines.md`](design-system/usage-guidelines.md).

---

## Deploying to GitHub Pages

1. **Create a repo** and push these files to the `main` branch (see below).
2. In the repo: **Settings → Pages → Build and deployment**
   - **Source:** *Deploy from a branch*
   - **Branch:** `main`  •  **Folder:** `/ (root)`  •  **Save**
3. Wait ~1 minute, then open `https://<your-username>.github.io/<repo-name>/`.

`.nojekyll` is included so GitHub serves every file verbatim (no Jekyll processing).
All internal links are **relative**, so the site works correctly under the
`/<repo-name>/` project-page path.

### Push from this folder
```bash
git init
git add -A
git commit -m "Portfolio site"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

### Optional: custom domain
Add a `CNAME` file containing your bare domain (e.g. `robertbabiarz.com`) and configure
your DNS per GitHub's instructions, then set the domain under Settings → Pages.

---

## Notes
- Page filenames are kebab-case (e.g. `homepage-interactive.dc.html`); all internal links are
  relative. The public entry URL is just the repo root, so visitors don't see the inner filenames
  unless deep-linking.
