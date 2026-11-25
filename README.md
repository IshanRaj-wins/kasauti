# vibe-kit

Ishan's starter for AI-assisted projects built with Claude Code. Every new project starts from here, so every project gets the same working loop:

```
/resume  →  one phase on its own branch  →  /wrap-up  →  /clear  →  /resume …
```

It is the SysSim loop with the useful extras from pakka-saboot, wayhome and proofdocs, made generic.

## Start a new project

The easy way, from any Claude Code chat:

```
/new-project
```

That skill (installed in `~/.claude/skills/new-project`) asks for the name, stack and plan, creates the repo from this template, fills it in and makes the first commit. See [kit/new-project/SKILL.md](kit/new-project/SKILL.md).

Install or update the skill on a new machine:

```bash
gh repo clone IshanRaj-wins/vibe-kit && node vibe-kit/kit/install-skill.mjs
```

Check the hooks still work after changing them: `node kit/test-hooks.mjs`.

By hand:

```bash
gh repo create IshanRaj-wins/<slug> --private --template IshanRaj-wins/vibe-kit --clone
cd <slug>
node kit/init.mjs --name "My Project" --slug my-project --pitch "One line" --profile python --plan path/to/plan.md
```

Profiles: `python`, `node`, `fullstack` (Python backend + `app/web` frontend). `kit/init.mjs` deletes `kit/` when it finishes.

## What you get

| Piece | Files | Job |
|---|---|---|
| Map and rules | `CLAUDE.md`, `AGENTS.md`, `START-HERE.md` | Always loaded; how to work here |
| Project config | `.claude/project.json` | Code paths, locked paths, gate commands, formatters. Every hook reads it, so hooks never need editing per project |
| Hooks (enforced) | `.claude/hooks/*.mjs` | SessionStart injects the handoff · Stop blocks if code changed without a PROGRESS entry · guard blocks secrets and destructive git · lock-guard makes listed paths write-once · format runs after each edit |
| Skills (on demand) | `.claude/skills/*` | `resume`, `wrap-up`, `handoff`, `task`, `ship-check`, `fix`, `verify-ui`, `pitch-deck`, `kit-sync` |
| Agents | `.claude/agents/*` | `reviewer`, `test-writer`, `researcher`, `ui-critic` |
| Memory | `docs/agent/*` | HANDOFF, PROGRESS, TASKS, DECISIONS, LEARNINGS |
| Project docs | `docs/*` | PLAN, SPEC, ACCEPTANCE, FACTS, API-NOTES, AI-LOG |
| Harness checklist | `features.json` | One entry per phase; only `passes` may change (Anthropic long-running-agent pattern) |
| Gate | `scripts/gate.mjs` | Runs the gate commands from `project.json`; used by `ship-check` and CI |
| Pitch | `pitch/render.ps1` | Exports a .pptx to PNGs through PowerPoint for visual QA |

## Improving the kit

When a project teaches you something general (a better hook, a sharper skill), run `/kit-sync` in that project. It copies the generic change back here so the next project starts with it.

Requirements: Node 18+, git, GitHub CLI. Hooks are plain Node so they run on Windows without jq.
