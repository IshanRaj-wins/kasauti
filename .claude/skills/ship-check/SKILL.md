---
name: ship-check
description: Run the project's quality gate (every check in .claude/project.json → gate) and report the real result. Use before every commit, inside wrap-up, or when asked "does it pass", "run the checks", "run tests".
---

# Ship check

```
node scripts/gate.mjs --list   # what will run
node scripts/gate.mjs          # run it; stops at the first failure
```

Rules:

- Run it for real. Never infer a pass from earlier output.
- Report: each check's name and result, the test count from the output, and any failure **verbatim** (the first ~30 relevant lines).
- A formatting failure: run the formatter, then re-run the gate.
- A test failure: find the cause before changing anything (`fix` skill). Never weaken, skip or delete a test to get green.
- No new lint warnings. If a warning is truly wrong, suppress it on that line with a comment saying why.
- If the gate has no checks yet, say so and propose the commands to add to `.claude/project.json`.
