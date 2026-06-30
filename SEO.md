# SEO, Discoverability & Analytics — robertbabiarz.com

Goal: make this portfolio easy to **search and find** — and to rank — for both
**full-time roles** and **freelance / contract** product-design work. This doc records
what's now implemented in the repo and the few manual steps only you can finish.

---

## 1. What's implemented (shipped in this repo)

Applied to **all 27 HTML pages** via a standard, idempotent `<head>` block:

| Avenue | Detail |
|---|---|
| **Meta descriptions** | Unique, keyword-rich, per page (was: 1 page had one). |
| **Open Graph** | `og:title/description/url/image/type/site_name/locale` — controls how LinkedIn / Slack / iMessage render a shared link. |
| **Twitter/X cards** | `summary_large_image` with image. |
| **Canonical URLs** | Absolute, self-canonical. Duplicate consolidation: `homepage-dossier`/`homepage-retro` → `homepage-interactive`; every `*-showcase.html` → its `.dc.html` "Standard" counterpart (so two presentations of one case study don't split ranking signal). |
| **JSON-LD structured data** | `Person` (name, jobTitle, knowsAbout, sameAs→LinkedIn, address, `seeks`=availability) on key pages; `WebSite` on the homepage; `ProfilePage` on About; `CreativeWork` on each case study with you as `author`. Validated as parseable JSON. |
| **robots.txt** | Allows all, points to the sitemap. |
| **sitemap.xml** | 12 canonical URLs (homepage, About, Work, the case studies), priorities + lastmod. |
| **`robots` meta** | `index, follow, max-image-preview:large` on real pages; `noindex, follow` on embedded prototypes (`*-prototype`, `*-gims*`, `ctoc-dashboard`, `fintech-walkthrough`) so thin/duplicate demos don't dilute the site. |
| **Analytics (GA4)** | `analytics.js` — privacy-conscious loader (`anonymize_ip`, honors Do-Not-Track). **Self-disabled until you add your Measurement ID**, so nothing ships broken. |
| **PWA / icons** | `site.webmanifest`, `theme-color`, icon link. |

Already strong (kept): fast Core-Web-Vitals (the idle-stop/perf work), `lang="en"`,
WCAG 2.2 / AODA accessibility, semantic `<main>` + skip link, real alt text — all of
which are ranking factors, and accessibility keywords (WCAG 2.2, ARIA) are explicitly
weighted by recruiter ATS in 2026.

---

## 2. Keyword strategy

Targets woven into titles, descriptions, `knowsAbout`, and copy:

- **Role / intent:** senior product designer, product designer for hire, freelance product
  designer, contract UX designer, available for full-time and freelance/contract work.
- **Craft (what recruiters/ATS match):** UX design, UI design, **design systems**, **data
  visualization**, **dashboard design**, information architecture, interaction design, user
  research, usability testing, **prototyping, Figma**, **accessibility / WCAG 2.2**, design tokens.
- **Domain (your differentiation, low-competition long-tail):** cybersecurity / **SOC dashboard**
  UX, threat-operations UX, defense-technology UX, **connected lighting / IoT** UX, fintech UX,
  enterprise SaaS, B2B product design, AR field tooling, operator interfaces.
- **Location:** Greater Toronto Area, Mississauga, Ontario, Canada (local + "remote" intent).

Long-tail is the lever for a personal site: "SOC dashboard designer", "connected-lighting UX
designer", "defense product designer Toronto" are winnable; "product designer" alone is not.

---

## 3. Manual next steps (only you can do these)

1. **Turn on analytics** — create a GA4 property (analytics.google.com → Admin → Data Streams →
   Web), copy the `G-XXXXXXXXXX` Measurement ID into [`analytics.js`](analytics.js), re-deploy.
2. **Google Search Console** (search.google.com/search-console) — add `robertbabiarz.com`, verify
   (DNS TXT or the GA tag), **submit `https://robertbabiarz.com/sitemap.xml`**. Repeat at **Bing
   Webmaster Tools**. Watch the Page-Indexing report weekly.
3. **Validate** the structured data at search.google.com/test/rich-results and the cards at the
   LinkedIn Post Inspector + opengraph.xyz.
4. **A dedicated 1200×630 OG image** — right now pages reuse case-study previews. A branded
   "Robert Babiarz · Senior Product Designer · open to full-time & freelance" banner lifts share CTR.
5. **LinkedIn** is the #1 inbound channel for both FT and freelance — put the same keywords in your
   **headline** and link this site; recruiters who find the profile click through to the portfolio.
6. **Backlinks / profiles** (authority + discovery): Dribbble, Behance, Read.cv / Contra (freelance),
   Wellfound/AngelList (startup FT), Toptal/Upwork (contract), Bench/Polywork. Each links here.
7. **A "Hire / Availability" page or section** stating "available for full-time and freelance/contract,
   remote or GTA" with a clear contact CTA — strong for both intent and conversion.

Sources behind these choices: Google's 2026 structured-data + Core-Web-Vitals guidance, and recruiter/ATS
keyword research (User Research, Design Systems, Prototyping, Figma, WCAG 2.2). See the chat for links.
