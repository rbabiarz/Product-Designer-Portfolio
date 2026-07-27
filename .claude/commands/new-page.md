# /new-page

Scaffold a new page or view following project conventions.

Full prompt: [`design-system/prompts/new-page.md`](../design-system/prompts/new-page.md)

Alias for `/new-case-study` — every public page is a case study or homepage variant.

## Steps

1. Ask for page name and one-line outcome
2. Follow [`design-system/workflows/adding-a-case-study.md`](../../design-system/workflows/adding-a-case-study.md)
3. **Homepage variant only:** also update `home-variants.js` + all three `homepage-*.dc.html` switchers
4. Run `/sync-scaffold` when registered
