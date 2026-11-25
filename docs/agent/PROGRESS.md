# Progress

Newest first. One entry per session or phase: what changed, what was verified, what was not. The SessionStart hook prints the top entry; the Stop hook blocks a turn that changed code without touching this file.

Entry format:

```
## YYYY-MM-DD: P<n> <name> (done | part k | in progress)
<one-line summary>
- <change, with file paths and measured numbers>
- Verified: <commands run and their results>
- Not checked: <explicit list, or "nothing">
```

## {{DATE}}: Bootstrap
Project created from the vibe-kit template.
- Harness: CLAUDE.md, AGENTS.md, .claude/{settings.json, project.json, hooks, skills, agents}, docs/agent/*, features.json, scripts/gate.mjs.
- Verified: {{BOOTSTRAP_VERIFIED}}
- Not checked: gate commands against real code (no code yet).
