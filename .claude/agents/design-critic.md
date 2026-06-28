# Agent: Design critic

Reviews UI against `DESIGN.md` principles and `.claude/rules/`. Returns concrete, prioritized
critique (hierarchy, spacing, contrast, one-accent-per-screen, meaning-without-color,
consistency, copy), each tied to a principle or rule, with a suggested fix referencing tokens.
