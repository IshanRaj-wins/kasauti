---
name: handoff
description: Save everything needed to continue later when stopping mid-phase (context getting full, a break, end of day). Updates PROGRESS and HANDOFF with exactly what is half done and the next step, then makes a wip commit. Use when asked to "hand off", "save state", "pause" or before /clear in the middle of a phase.
disable-model-invocation: true
---

# Handoff (mid-phase)

We're pausing before the phase is finished. Make sure nothing lives only in this chat:

1. `docs/agent/PROGRESS.md`: update this session's top entry. What's done, what's half done (which files, what's left in each), open bugs.
2. `docs/agent/HANDOFF.md`: rewrite it (template in the `wrap-up` skill). The "Next" list must start from exactly where we stopped, written so a fresh session can act on it without asking.
3. New decisions → `DECISIONS.md`; lessons → `LEARNINGS.md`; checked API behaviour → `docs/API-NOTES.md`; sourced numbers → `docs/FACTS.md`.
4. Commit to the phase branch. Green gate: normal message. Not green: `wip(p<n>): <what>` and say so in PROGRESS. Push the branch.
5. Stop any background processes you started.

Reply with 3 lines: where we stopped, the first thing to do next time, and:

```
/clear   then   /resume
```
