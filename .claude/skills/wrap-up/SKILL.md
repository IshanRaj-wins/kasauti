---
name: wrap-up
description: End a work session cleanly so the chat can be cleared without losing anything. Runs the gate, updates progress, tasks, learnings, decisions, acceptance and the HANDOFF, then commits, merges and pushes. Use when a phase is finished, when asked to "wrap up", "save progress", "finish the phase" or "done for today".
disable-model-invocation: true
---

# Wrap up

1. **Gate.** Run the `ship-check` skill. If anything fails, fix it, or record it explicitly as not done. Never commit a red gate as if it were green.
2. **Verify UI** if UI files changed: the `verify-ui` skill. Say which views you did not check.
3. **Acceptance.** Tick the lines in `docs/ACCEPTANCE.md` this phase now meets, with evidence (command + result). Unmet lines stay unticked.
4. **features.json.** Set `"passes": true` only for phases whose acceptance lines all pass. Change nothing else in that file.
5. **Docs** in `docs/agent/`:
   - `PROGRESS.md`: replace this session's "in progress" line with a dated entry at the top:
     ```
     ## YYYY-MM-DD: P<n> <name> (done | part k)
     <one-line summary>
     - <change, with file paths and measured numbers>
     - Verified: <commands run and their results>
     - Not checked: <explicit list, or "nothing">
     ```
   - `TASKS.md`: tick what's done; add anything found along the way.
   - `LEARNINGS.md`: anything that cost time, symptom first: `- **<symptom>.** <cause>. <fix/rule>.`
   - `DECISIONS.md`: any choice that departs from the plan, dated, with what was rejected and why.
   - `HANDOFF.md`: rewrite it for the next session (template below). Under one screen.
   - `docs/AI-LOG.md`: one row: date, phase, what Claude did, what the human decided.
6. **Commit** on the phase branch: conventional message (`feat(p<n>): …`) with the Co-Authored-By trailer. Stage specific paths, not `git add -A`, and check the diff has no secrets or stray files.
7. **Merge and push** when the phase is complete: `git switch main && git merge --ff-only phase-<n>-<slug> && git push origin main`, then delete the branch. Mid-phase: push the branch instead.
8. **Stop background work** (dev servers, watchers) you started.

HANDOFF.md template:

```markdown
# Handoff
_Updated: YYYY-MM-DD · last commit: <sha> <message>_

## State
<one paragraph: what works now, what's half done, branch>

## Next: P<n> <name>
1. <concrete step with file paths>
2. …

## Watch out for
- <traps, flaky things, decisions pending from the user>
```

End with three lines: what shipped, what's next, and what to type after `/clear`:

```
/resume
```
