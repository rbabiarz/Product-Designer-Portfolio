# Rule: Code style

- **Stack:** Self-contained HTML — single-file pages with inline CSS/JS, no build step and no server. `.dc.html` pages embed markup in an `<x-dc>` template that `support.js` renders with React (loaded from the unpkg CDN). Icons via Lucide (`<i data-lucide="name">`).
- **Self-contained single files:** all CSS and JS inline; only declared CDN deps (React,
  fonts) at the top. No build step — edit the file, refresh the browser.
- **Icons:** `<i data-lucide="name"></i>` — never write custom SVG paths unless asked.
- **Navigation / screens:** JS `showSection()`-style toggles for multi-screen simulation;
  `.dc.html` markup lives inside the `<x-dc>` template.
- **Tokens over literals:** reference `var(--…)`; no raw hex/px in component code.
- **Shared runtime modules** (`support.js`, `a11y.js`, `text-motion.js`, `page-transition.js`,
  `home-variants.js`) stay at the repo root and must keep the site working with no server.
- **Robust in embeds:** prototypes render inside host wrappers that may carry a `transform`;
  avoid relying on viewport-fixed positioning where an ancestor transform can break it
  (anchor overlays to their stage). Run isolated inits so one failure can't abort the rest.
