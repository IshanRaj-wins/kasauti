---
name: kit-sync
description: Copy a generic improvement made in this project (a hook, skill, agent, gate script or doc template) back to the vibe-kit template repo so future projects start with it. Use when asked to "sync to the kit", "upstream this", "save this for future projects", or after fixing something in the harness that isn't project-specific.
disable-model-invocation: true
argument-hint: "[file paths to upstream]"
---

# Kit sync

The template lives at `github.com/IshanRaj-wins/vibe-kit`. Only **generic** harness files go back: `.claude/hooks/*`, `.claude/skills/*` (not domain skills), `.claude/agents/*`, `scripts/gate.mjs`, `pitch/render.ps1`, doc templates, `kit/*`.

1. List candidate files: `$ARGUMENTS`, or the harness files changed since bootstrap (`git log --oneline -- .claude scripts pitch/render.ps1`).
2. Clone the kit to a temp folder: `gh repo clone IshanRaj-wins/vibe-kit <scratch>/vibe-kit`.
3. For each file, diff against the kit's version. Strip anything project-specific (names, paths, domain rules) and turn it into `.claude/project.json` config or a `{{PLACEHOLDER}}` instead. Show the user the diff.
4. After the user OKs it, commit in the kit (`chore(kit): <what> (from <project>)`) and push. Never push to the kit without that OK.
5. If the change also needs `kit/init.mjs` or a profile updated, do that in the same commit.

Report what was upstreamed and what was left behind as project-specific.
