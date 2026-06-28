# Rule: Accessibility

Target **WCAG 2.2 AA / AODA**. A standing audit lives in `WCAG-2.2-AODA-AUDIT.md` — keep it current.

- Text contrast ≥ 4.5:1 (≥ 3:1 for large text and UI/graphical elements). The dark theme
  (`#e9eef7` on `#070b12`) and light theme are both AA — don't regress them.
- Every interactive element is keyboard reachable with a **visible focus state**
  (`:focus-visible`); games/canvases expose a real control path (keys + on-screen buttons).
- Hit targets ≥ 44×44px (the AEGIS verb rail, nav, switchers).
- Respect `prefers-reduced-motion` — the marquee, reveal, parallax, and game motion all gate on it.
- **Meaning survives without color.** Pair color with text/icon/shape; no color-only status.
- Label all controls; `aria-live` for score/state announcements; images carry meaningful alt text.
