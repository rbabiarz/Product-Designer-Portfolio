# Usage guidelines

- **Do** reference `var(--…)` tokens; **don't** hardcode hex/px in prototype code.
- **Do** keep one accent per screen and one color block per viewport.
- **Do** design every state (empty/loading/error/longest content); **don't** ship only the happy path.
- **Do** pair every signal with text/shape; **don't** rely on color alone.
- **Do** anchor overlays to their stage; **don't** assume `position:fixed` resolves to the viewport in embeds.
