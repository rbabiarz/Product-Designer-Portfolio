# Motion & animation

Animation explains state change or directs attention — never decoration.

Full principles also in [`../../DESIGN.md`](../../DESIGN.md) §5 and [`../patterns/patterns.md`](../patterns/patterns.md).

## Token durations

| Token | Value | Use |
|---|---|---|
| `--transition-fast` | 150ms ease | Hover, micro-feedback |
| `--transition-base` | 250ms ease | Standard state change |
| `--transition-slow` | 350ms ease | Panel open, large entrance |

Common practice: micro-interactions 0.12–0.22s; hero entrances 0.34–0.9s.

## Keyframe inventory

### Interactive / global
`rise`, `fade-up`, `hero-hl-draw`, `clarity-focus`, `scrolldot`, `marquee`

### Light ARchitect
`cityFloat`, `cityWin`, `cityBeacon`, `laPulse`, `laBeam`, `laScan`

### Dossier
`dossier-up`, `dossier-blink`

### Retro (gated under PRM)
`rt-pwr`, `rt-in`, `rt-flicker`, `rt-scan`, `rt-blink` — flicker/scan **removed** under reduced motion

### CTOC
`pulse`, `pulse-red`, `highlight`, `fade`, `slidein`

### Scroll reveal
`data-reveal` on case-study sections — CSS opacity/transform; snaps under PRM

## JS motion modules

| Module | Behaviour | PRM |
|---|---|---|
| `text-motion.js` | Scroll velocity drift, marquee counter-motion | Early return |
| `page-transition.js` | Isometric block page mask | Jump to final |
| `scripts/a11y.js` | Global duration ≈0, `scroll-behavior:auto` | Injected rule |
| `cursor.js` | Custom cursor follow | Disabled |

## `prefers-reduced-motion` contract

**Required on every new animated component.**

1. CSS: `@media (prefers-reduced-motion: reduce) { animation: none; transition: none; }`
2. JS: early-return before starting loops/observers
3. Retro: CRT flicker/scan `display:none`; boot text at final opacity
4. AEGIS: button transition duration → 0

## Easing

Default `ease`. Page transition mask: `cubic-bezier(.76,0,.24,1)`. Hero highlight draw:
`cubic-bezier(.62,0,.34,1)`. Coverflow cards: `cubic-bezier(.2,.85,.25,1)`.

## Don't

- Decorative loops with no informational purpose
- Motion that can't be disabled
- Autoplay video without control (none shipped currently)
- Parallax that breaks 400% zoom readability
