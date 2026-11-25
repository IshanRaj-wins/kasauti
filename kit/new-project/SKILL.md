---
name: new-project
description: Bootstrap a new project from Ishan's vibe-kit GitHub template (IshanRaj-wins/vibe-kit) with the full Claude Code harness (CLAUDE.md, docs/agent memory, hooks, skills, agents, gate, CI), customised to the project's approved plan and stack. Use when Ishan says "new project", "start a project", "set up the repo", "scaffold this", "use my template", or after a plan is approved and P1 (scaffold/harness) is next. Also adopts an existing folder (e.g. one that already holds a pitch deck).
argument-hint: "[project name] [--plan path] [--profile python|node|fullstack]"
---

# New project from vibe-kit

The template is `github.com/IshanRaj-wins/vibe-kit` (private, marked as a template). Its README lists what every project gets. This skill creates the repo, runs `kit/init.mjs`, then customises the result to the plan. **The kit gives the structure; the plan decides the details.**

## 1. Gather inputs (ask only what you can't infer)

Read the approved plan first: the path the user gives, the latest file in `~/.claude/plans/`, or `docs/PLAN.md` in the current folder. From it, infer the name, a one-line pitch, the stack, phases already done, and any frozen data or fixtures that should be locked.

Ask with AskUserQuestion only for what's still missing:

- **Name and slug** (repo name = slug, kebab-case)
- **Profile:** `python` (scripts, ML, CLI), `node` (web app or TS tool), `fullstack` (Python backend + `app/web` React frontend)
- **Visibility:** private (default) or public
- **Where:** a new folder `<parent>/<slug>`, or adopt the current folder if it already has project files
- **Locked paths:** write-once files, e.g. `data/splits/`, `tests/fixtures/`, a signed-off spec

## 2. Create the repo

**A. New folder**

```bash
gh repo create IshanRaj-wins/<slug> --private --template IshanRaj-wins/vibe-kit
gh repo clone IshanRaj-wins/<slug> "<parent>/<slug>"   # if it's empty, wait a few seconds and retry: GitHub copies the template asynchronously
```

**B. Adopt an existing folder** (it already has files, e.g. `pitch/` and `docs/` from P0)

```bash
gh repo clone IshanRaj-wins/vibe-kit "<scratchpad>/vibe-kit"
```

Copy everything except `.git/` into the folder **without overwriting** existing files. For a file that exists on both sides (`.gitignore`, `docs/FACTS.md`, …), merge the kit's version into the project's. Then run `git init -b main`.

## 3. Initialise

```bash
node kit/init.mjs --name "<Name>" --slug <slug> --pitch "<one line>" --profile <profile> \
  --plan "<plan path>" [--done P0] [--locked "data/splits/,tests/fixtures/"]
```

This fills the placeholders, writes `.claude/project.json`, turns the plan's `P<n>` phases into `docs/agent/TASKS.md`, `docs/ACCEPTANCE.md` and `features.json`, runs the hook smoke test (it must print `hooks: 16/16 passed`), and deletes `kit/`.

## 4. Customise to the plan (your judgement)

- **README.md:** replace the kit README with the project's own: name, pitch, status, how to run it (from CLAUDE.md → Commands), and the session loop in 4 lines.
- **CLAUDE.md:** add the plan's real folders to the Map and project-specific Gotchas. Keep it under 200 lines.
- **AGENTS.md:** add domain rules under "Stack rules", e.g. for ML: "split by group, never by row", "metrics only from the eval script".
- **`.claude/project.json`:** check `codePaths` matches the plan's layout. Add `lockedPaths` and `blockedCommands` the plan implies.
- **Domain skills:** for each repeatable routine the plan names (e.g. `eval-report`, `leakage-audit`, `add-case-study`), write `.claude/skills/<name>/SKILL.md` with real, specific steps. No empty stubs.
- **Domain agents:** a read-only auditor for the riskiest area, e.g. `ml-auditor`, `privacy-guard`, `security-auditor`.
- **docs:** fill `SPEC.md` from the plan. Draft ACCEPTANCE lines for the next phase. Carry over existing FACTS rows. Add a DECISIONS entry for every big choice in the plan.
- **HANDOFF.md:** point it at the first phase that isn't done, with concrete steps.

## 5. Verify, commit, push

```bash
node scripts/gate.mjs --list
git status --short
```

Read the diff for secrets and stray files. Then commit:

```bash
git add <specific paths>
git commit -m "chore: bootstrap from vibe-kit"   # end the message with the Co-Authored-By trailer
```

Push:

- **Path A:** `git push origin main`
- **Path B:** `gh repo create IshanRaj-wins/<slug> --private --source . --push`

Pushing is outward-facing, so confirm first unless the user already said to create the repo.

## 6. Hand over

Tell the user, in 5 lines or fewer:

- the repo URL
- the profile used
- the phases found
- the next phase
- that new hooks load in a fresh session: `/clear` (or restart Claude Code), then `/resume`

If the user changed something generic during setup, suggest `/kit-sync` so the template learns it too.
