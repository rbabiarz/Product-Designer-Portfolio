# Parlay Games iGaming — reading flow (case study 09)

Image-led narrative plus one working game on the deep dive: "Parlay Reels", the honest
5-reel demo slot (section 04).

**Entry:** homepage work rows (09) / work index / lobby tile / concierge card / case-study
switcher on any sibling page / search.

**Quick tour (parlay-gaming-showcase.html):** platform context + Parlay-era figures → game design
(bingo, keno, slots) → brand & logo systems → player-facing web platforms → promotions at volume →
back office → 3D imagery → what carried forward. Exit: deep-dive CTA, next-case footer, switcher.

**Deep dive (parlay-gaming.html):** adds the era/runtime constraint story (Java → Flash → HTML →
mobile), player research, min-spec performance discipline, localization mechanics; 12 TOC-driven
sections. Section 04 is playable: bet stepper → spin (button or space bar) → line-win cycle /
scatter free spins → session ledger; paytable dialog publishes reel composition and the 10M-spin
verified math; a Design-notes toggle annotates the dark patterns deliberately left out; a reality
check interrupts every 50 spins. Exit: next-case footer chain, switcher, work index.

**Failure/edge states:** images lazy-load with meaningful alt text; reduced-motion renders spin
results instantly; the slot needs JavaScript and says so (static fallback copy, page unaffected);
spin never hangs (transition watchdog); keyboard path on every control; one polite aria-live
message per spin — net losses are announced as losses, never as wins.
