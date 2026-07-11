# PRODUCT.md — Product Designer Portfolio

> Synthesized from the repo's own context (CLAUDE.md, DESIGN.md, `.claude/rules/*`,
> docs/brief.md) — the canonical sources; when they conflict with this file, they win.

## Register

**Brand** — this is a portfolio: the design IS the product. Every page is itself the
evidence of senior product-design judgment. (Interactive prototypes inside case studies
run in product register: they simulate real tools and are judged as tools.)

## Users & purpose

Hiring managers, design leaders, and program leads in defense, enterprise SaaS, and IoT,
deciding in minutes whether Robert Babiarz is worth an interview. They arrive skeptical of
portfolio theater; the site must let them *operate* the work — live prototypes, playable
drills, real interaction — not read claims about it.

**Desired outcome:** the visitor forms the judgment "this person designs working systems,
not pictures of systems," then reaches the resume/contact with intent.

## Brand personality

Clear, calm, evidence-led. Defense-literate without cosplay. Confident, never hype.
Thesis line: **"the model brings receipts, you keep the decision."**

- Lead with outcomes; verbs first ("Take the watch", "Read the trace").
- Mono for system/HUD labels, sans for prose.
- Claims need backing; where a number isn't real, the page says what it represents.

## Anti-references

- Portfolio-template minimalism (hero platitude + card grid + logo wall).
- Defense cosplay: stolen-valor aesthetics, fake classification theater without the
  UNCLASSIFIED//PORTFOLIO honesty tag, invented metrics.
- Stoplight status colors; meaning riding on hue alone.
- Hype copy ("revolutionary", "cutting-edge"), lorem ipsum, single-perfect-row tables.

## Accessibility

WCAG 2.2 AA / AODA is part of done (standing audit in `WCAG-2.2-AODA-AUDIT.md`):
4.5:1 body text, visible focus, keyboard paths everywhere, 44×44 hit targets,
`prefers-reduced-motion` gates on all motion, meaning survives without color.

## Strategic design principles

See DESIGN.md §1 (north star). Summary: show it working; systems not screens; one idea
per view, one accent per screen; read the trace, not the number; robust by construction
(self-contained pages, no build step, isolated inits).

## Identity note

The site's committed identity — DM Sans / Inter / JetBrains Mono, the `#fffcf5`/`#070b12`
surfaces, teal accent family, eyebrow + numbered-section grammar on case studies — is
shipping brand system, deliberately consistent across 16+ pages. Identity-preservation
wins over greenfield reflex rules for all existing-surface work.
