# Content & UX writing

Tone and microcopy standards for UI copy across the portfolio.

## Canonical rule

[`.claude/rules/content-voice.md`](../../.claude/rules/content-voice.md) — always-on for AI sessions.

## Voice principles

| Do | Don't |
|---|---|
| Plain language; gloss jargon once | Acronyms without context (DALI-2 → "lighting system" on public pages) |
| Show outcomes and evidence | Assert seniority without proof |
| Label metric sources (observed / target / company-era) | Invent numbers |
| Active, specific verbs | Enterprise filler ("leverage", "synergy") |
| One idea per paragraph in case studies | Wall of feature lists |

## Typography = voice

| Text type | Treatment |
|---|---|
| Prose (DM Sans) | Sentence case, relaxed line-height (~1.6–1.78) |
| System/HUD (JetBrains Mono) | UPPERCASE, tracked 0.04–0.22em |
| Eyebrows | Mono 9–11px, accent or muted, section index |
| CTAs | Mono or Inter semibold, pill, action verb first |

## Case-study structure

1. **Eyebrow** — section index + domain
2. **Headline** — outcome framed for the reader's job
3. **Lead** — 2–3 sentences, plain language
4. **Evidence** — screenshots, stats with footnotes, live demo link

Quick tour vs deep dive: quick tour = outcomes at a glance; deep dive = process and dead ends.

## Status & urgency copy

Never write "critical error" in stoplight red. Use coral for risk; pair with shape/text.
SOC severity labels are the exception (domain-appropriate, always with square + word).

## Minimalist voice

Separate surface — plainer, warmer, hospital/installer audience. See [`../../minimalist/`](../../minimalist/)
copy for reference; still no jargon without gloss.

## Review checklist

- [ ] Would a program lead understand this without a glossary?
- [ ] Every number has a source or "design target" label
- [ ] No Lucide/icon names in user-facing copy
- [ ] Headings describe user value, not feature names
