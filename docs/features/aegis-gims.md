# AEGIS GIMS — Filter-First Geospatial C2

**User:** program lead / design leader evaluating defence-C2 product-design depth; secondary, the
in-vehicle operator and HQ watch officer the concept serves.

**Thesis:** the operator defines the ground they own, draw it or type its coordinates, and entry
into that ground becomes the alert. A zone filter is the smallest mechanism that serves the job
("when an enemy vehicle enters the ground I'm responsible for, alert me and help me report it up
the chain, without making me hunt for it").

**What the interaction proves:** the filter-first design hypothesis holds as a working system —
draw/coordinate zone entry, Everything ↔ Signal filtering, entry-fires-the-alert with one-tap
report-up, AI-assisted triage that never makes the call, all designed edge-first (air-gapped).

**Scope:** two portfolio pages (quick tour `aegis-gims-showcase.html`, deep dive `aegis-gims.html`),
live v2 build embedded from rbabiarz.github.io/AEGIS-GIMS, preview tile, full site registration
(switchers, homepages, work page, concierge, search index, sitemap).

**States:** everything/signal views, no-filter empty state, zone edit mode (view-only by default),
alert toast + report-up modal (sent/queued), offline (maps from disk, alerting on-device, report
queues), GPS-denied fallback. All metrics on the pages are design targets, labeled as such.

**Source:** github.com/rbabiarz/interview-design-solution (v1 React prototype; the case study frames this as a design problem + solution; no interview/take-home framing on the public pages) ·
live v2 build rbabiarz.github.io/AEGIS-GIMS. The v1 prototype is embedded natively in aegis-gims.html via aegis-gims-proto.js (dependency-free port, no iframe).
