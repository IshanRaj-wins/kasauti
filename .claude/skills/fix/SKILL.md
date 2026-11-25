---
name: fix
description: Cause-first debugging for a bug, failing test or wrong result. Restates the problem, checks past learnings, lists likely causes with how to confirm each, confirms before fixing, makes the smallest fix plus a regression test, and records the lesson. Use when something is broken, a test fails, or output looks wrong.
argument-hint: "<what is wrong>"
---

# Fix: $ARGUMENTS

1. Restate the problem in one line: expected vs actual, and how to reproduce it. Reproduce it now.
2. Search `docs/agent/LEARNINGS.md` for the symptom. It may have happened before.
3. List 2–3 likely causes, each with the quickest way to confirm or rule it out.
4. Confirm the cause with evidence (a print, a failing assert, a minimal repro) before changing code.
5. Make the smallest fix. Add a regression test that fails without the fix and passes with it.
6. Run the gate (`ship-check`).
7. Add one line to `LEARNINGS.md`: `- **<symptom>.** <cause>. <fix/rule>.`

If this is the second fix attempt that didn't work: stop. Say what you've learned, and propose a different approach instead of a third patch.
