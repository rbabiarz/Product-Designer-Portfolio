# Component-ready checklist

Before documenting a component in [`components/components.md`](../components/components.md).

- [ ] Variants named (default, hover, focus-visible, disabled, …)
- [ ] Empty, loading, error, and longest-content states designed
- [ ] Keyboard path and visible `:focus-visible` ring
- [ ] Meaning survives without color (text/shape/icon paired with hue)
- [ ] Motion gated on `prefers-reduced-motion`
- [ ] Tokens listed — no raw hex/px in the implementation
- [ ] One accent per screen respected
