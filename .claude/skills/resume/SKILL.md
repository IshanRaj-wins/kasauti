---
name: resume
description: Start a work session from a cleared chat. Loads the handoff, tasks, learnings and latest progress, checks git, and states the plan for this session before any code changes. Use at the start of every new chat, or when asked to "resume", "continue", "pick up where we left off" or "what's next".
---

# Resume

The SessionStart hook has already printed HANDOFF, the latest PROGRESS entry, LEARNINGS and git state. Read these too, in order, and nothing else yet:

1. `docs/agent/TASKS.md`: the phase checklist. Find the current phase.
2. The current phase's section in `docs/PLAN.md` and its lines in `docs/ACCEPTANCE.md`.

Then check the repo:

```
git status --short
git log --oneline -3
```

- If the tree is dirty and HANDOFF doesn't explain why, stop and ask what to do with the changes.
- If you're on `main`, branch for the phase: `git switch -c phase-<n>-<slug>`. If HANDOFF names a branch, switch to it.

Reply in **at most 8 lines**:

- Where things stand: last commit, current phase, anything half done.
- What this session will do: the steps from HANDOFF, in order.
- Anything in HANDOFF or the plan that's unclear, stale, or that you'd do differently.

Then start on the first step. If the phase touches more than two files and has no `/task` plan yet, run the `task` skill first and wait for a go.

Log as you go: the first time code changes, add a dated "in progress" line at the top of `docs/agent/PROGRESS.md`. The Stop hook blocks the turn otherwise.

One phase per session. When it's done, or the context is getting long, run `wrap-up` (or `handoff` if stopping mid-phase).
