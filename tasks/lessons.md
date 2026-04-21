# Lessons Learned

## 2026-04-14

- When project-level workflow rules exist in `AGENTS.md`, follow them explicitly from the start.
- For non-trivial builds, create `tasks/todo.md` first and keep progress updated during implementation.
- If users report "filter not working", improve interaction feedback first (counts, auto-jump, active chips, and empty states) before changing data logic.
- For speed improvements on large dashboard sections, combine React memoization with CSS `content-visibility` before introducing heavier complexity.
