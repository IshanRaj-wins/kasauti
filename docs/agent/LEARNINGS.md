# Learnings

Things that cost time to find out. Add one when a bug or a false diagnosis took more than a few minutes, symptom first so the next session can match it. Keep under 120 lines; merge duplicates.

Format: `- **<symptom>.** <cause>. <fix or rule>.`

## Tooling

- **Hook does nothing on Windows.** Hooks are Node scripts called as `node "$CLAUDE_PROJECT_DIR/.claude/hooks/x.mjs"`; if `node` isn't on PATH for the Claude Code process, they silently skip. Check with `node -v` in the same terminal.
