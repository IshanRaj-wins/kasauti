# Start here

For the human. Claude reads CLAUDE.md.

## The loop

1. Open Claude Code in this folder. The SessionStart hook loads the handoff automatically.
2. Type `/resume`. Claude says where things stand and what this session will do. Correct it if it's wrong.
3. Let it work the phase. For a phase that touches more than two files it will run `/task` first and wait for your "go".
4. When the phase is done (or the context is getting long) type `/wrap-up`. It runs the gate, updates the docs, commits and pushes.
5. Type `/clear`, then `/resume` for the next phase.

Stopping mid-phase? `/handoff`, then `/clear`.

## Where to look

- **What's next:** `docs/agent/HANDOFF.md`
- **What's done:** `docs/agent/TASKS.md` and `features.json`
- **The plan:** `docs/PLAN.md`

## Before the first session

- [ ] Fill in `.env` from `.env.example` (never commit `.env`).
- [ ] Check `.claude/project.json`: code paths, locked paths and gate commands match the plan.
- [ ] Run `node scripts/gate.mjs` once to see the gate run.
