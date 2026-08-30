# Analytics

Instrumentation conventions for https://robertbabiarz.com/

## Load order (required)

```html
<script src="scripts/cookie-banner.js" defer></script>
<script src="scripts/analytics.js" defer></script>
```

Cookie consent **must** gate analytics. Never paste raw gtag snippets on individual pages.

## Files

| File | Role |
|---|---|
| [`scripts/analytics.js`](../../scripts/analytics.js) | GA4 loader; reads consent state |
| [`scripts/cookie-banner.js`](../../scripts/cookie-banner.js) | Consent UI + storage |
| [`SEO.md`](../../SEO.md) | Metadata strategy, sitemap, Search Console notes |

## Measurement ID

Current GA4 property documented in `SEO.md` and `scripts/analytics.js`. Update both together.

## Event conventions

| Event | When |
|---|---|
| Page view | Automatic via gtag config |
| Outbound link | Optional — document here before adding |
| Demo interaction | Prefer not to track unless privacy-reviewed |

Keep events minimal — this is a portfolio, not a product funnel.

## Privacy

- No PII in event parameters
- Consent banner copy must match what's actually loaded
- [`../../docs/constraints.md`](../../docs/constraints.md) for legal/brand limits

## SEO coupling

Analytics complements but does not replace:
- [`sitemap.xml`](../../sitemap.xml)
- [`robots.txt`](../../robots.txt)
- Per-page `<title>`, `meta description`, Open Graph tags

Run SEO checklist in `SEO.md` before major releases.

## Related

- [`../audits/`](../audits/) — log audit findings
- [`../workflows/scaffold-maintenance.md`](../workflows/scaffold-maintenance.md) — monthly SEO review step
