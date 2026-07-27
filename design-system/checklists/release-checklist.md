# Release checklist

Run before every deploy to GitHub Pages.

- [ ] All case-study links resolve (no `href` to removed pages)
- [ ] `python3 scripts/build-search-index.py` — search index current
- [ ] `python3 scripts/build-colophon.py` — colophon numbers refreshed
- [ ] `sitemap.xml` lists every public page
- [ ] Theme toggle + VIEW switcher work on homepages
- [ ] Cookie banner + analytics load from `scripts/`
- [ ] No hard-coded hex in changed files (`/audit-tokens`)
- [ ] `docs/changelog.md` has today's entry
- [ ] Preview tiles exist for any new case study
