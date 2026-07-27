# Prompt: Release

Pre-deploy gate for GitHub Pages.

**Checklist:** [`../checklists/release-checklist.md`](../checklists/release-checklist.md)

## Prompt (copy-paste)

```
Release checklist for robertbabiarz.com

Run every item; report pass/fail:

LINKS & REGISTRATION
- [ ] All internal hrefs resolve (no 404 to removed pages)
- [ ] sitemap.xml complete
- [ ] New case studies on work index + concierge

BUILD ARTIFACTS
- [ ] python3 scripts/build-search-index.py — search-index.js current
- [ ] python3 scripts/build-colophon.py — colophon.js current

RUNTIME
- [ ] scripts/cookie-banner.js loads before scripts/analytics.js on every page
- [ ] Theme toggle works (Interactive + case-study shells)
- [ ] VIEW switcher routes correctly (home-variants.js)

QUALITY
- [ ] /audit-tokens clean on changed files
- [ ] Keyboard pass on changed pages
- [ ] Both themes on changed pages

DOCS
- [ ] docs/changelog.md has release entry
- [ ] docs/open-questions.md — no stale blockers

Return: GO / NO-GO with blockers listed.
```

## After deploy

- Verify live site loads GA4 (consent flow)
- Spot-check colophon numbers match GitHub Pages deploy count
