# Robert Babiarz — Product Design Portfolio

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

Homepage Interactive.dc.html    PRIMARY homepage
Homepage Dossier.dc.html          alt homepage — "classified case-file" theme
Homepage Retro.dc.html            alt homepage — CRT terminal theme
home-variants.js                  the VIEW switcher; remembers the chosen homepage

About.dc.html                     bio + experience
Work.dc.html                      project index

Shared runtime & styling
  support.js  page-transition.js  a11y.js  text-motion.js
  tokens.css  styles.css  colors_and_type.css  design-system/

Assets
  assets/  previews/  fintech/
  Robert_Babiarz_Resume.pdf
```

### The homepage variant switcher
The three homepages are interchangeable. The "VIEW" control sets
`localStorage["rb-home-variant"]`; on the next visit, [`home-variants.js`](home-variants.js)
routes the viewer to their chosen variant. `index.html` redirects into the Interactive
homepage, where this logic then takes over — which is why `index.html` redirects rather
than duplicating the homepage.

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
- Page filenames contain spaces (e.g. `Homepage Interactive.dc.html`); browsers encode
  these as `%20`. Existing links already handle this. The public entry URL is just the
  repo root, so visitors don't see the inner filenames unless deep-linking.
