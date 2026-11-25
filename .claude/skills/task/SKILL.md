---
name: task
description: Plan one phase or task before writing code. Reads the plan section and acceptance lines, proposes files, steps, tests and a branch, lists unknowns, and waits for approval. Use for any change touching more than two files, or when asked to "plan P3", "start phase 4" or "how would you build X".
argument-hint: "<phase id, e.g. P3, or a short task description>"
---

# Plan a task: $ARGUMENTS

1. Read the relevant section of `docs/PLAN.md`, its lines in `docs/ACCEPTANCE.md` (if there are none, draft them now in Given / When / Then form), `docs/agent/LEARNINGS.md`, and only the source files you need.
2. Check `docs/API-NOTES.md` for every external API or library this task uses. Anything not there is an unknown: plan a tiny spike to confirm it before relying on it.
3. Propose, in this order:
   - **Branch:** `phase-<n>-<slug>`
   - **Files:** to create / change (paths), one line each on why
   - **Steps:** numbered, each small enough to verify on its own
   - **Tests:** what proves each step works (expected values from fixtures or references, not from the code)
   - **Acceptance:** the lines this task will satisfy
   - **Unknowns and risks:** what could make the plan wrong, and how you'll find out early
   - **New dependencies:** name, version, why. Prefer none.
   - **Out of scope:** tempting things you will not do (they go to TASKS.md "Ideas / later")
4. Stop and wait for the user's go. Don't write code yet.
