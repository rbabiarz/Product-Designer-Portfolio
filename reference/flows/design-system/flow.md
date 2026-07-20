# The Design System — reading flow (case study 11)

The self-documenting capstone: live instruments plus the site's own surfaces as evidence.

**Entry:** work index (row/tile 11, lobby category "Design Systems") / homepage rows 11 on all
three variants / case-study switcher on any sibling page (desktop + mobile) / concierge
(`designsystems` and `process` intents lead here) / search / Parlay's next-case footer.

**Quick tour (design-system-showcase.html):** hero on the site's own homepage screenshot →
prove/drift/slop challenge → one system, three faces (Interactive/Dossier/Retro) → tokens all the
way down → playable, not pictured (slot, autolayout, drills) → the AI pair + the build record →
numbers with sources → trends strip → deep-dive CTA. Exit: deep dive, next-case footer
(→ Goals-Driven Fintech), switcher.

**Deep dive (design-system.html):** 12 TOC-driven sections; the two live instruments are the
spine — 04 token inspector (reads this page's computed custom properties; re-resolves on theme
toggle, announced politely) and 09 "run the receipts" (analytic RTP re-derivation, bugged vs
shipped engine, timed). 03 module inventory table, 05 a live typography specimen set by the page's own fonts and
classes, 06 principles with enforcement points, 07 live component specimens, 10 the annotated
build record, 11 trends with cited sources, 12 honest limits. Exit: next-case footer, GitHub source link,
switcher.

**Failure/edge states:** instruments init isolated (either can fail without killing the page);
the inspector is DOM-read-only and safe on any theme; the derivation button uses aria-disabled
during compute and announces results via a polite live region; reduced motion renders reveals
instantly; no external embeds — fully offline-capable (the GitHub links are plain anchors).
