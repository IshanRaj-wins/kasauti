# Kasauti

Prove a tradesperson's skill live on their own phone; leave with a signed pass a contractor can check.

**The coding rules live in [AGENTS.md](AGENTS.md). Read it before changing anything.** This file is the map and the workflow.

## Every session

One phase per chat. Start a cleared chat with `/resume`; end it with `/wrap-up`.

1. The SessionStart hook has already put HANDOFF, the latest PROGRESS entry, LEARNINGS and git state in your context. `/resume` reads the rest and states the plan.
2. Plan the phase with `/task <phase>` when it touches more than two files. Work on branch `phase-<n>-<slug>`.
3. Log as you go: the first time code changes, add a dated "in progress" line to `docs/agent/PROGRESS.md`. A Stop hook blocks the turn otherwise.
4. `/wrap-up` runs the gate, updates the docs, commits, merges and pushes. Nothing lives only in the chat.
5. Context getting long (about 60%) or stopping mid-phase: `/handoff`, then `/clear`.

## Where the truth lives (check here; never guess)

| Question | Source |
|---|---|
| What are we building, in what order? | [docs/PLAN.md](docs/PLAN.md) |
| What is next, exactly? | [docs/agent/HANDOFF.md](docs/agent/HANDOFF.md) |
| What is done? | [docs/agent/TASKS.md](docs/agent/TASKS.md), [features.json](features.json) |
| What happened, session by session? | [docs/agent/PROGRESS.md](docs/agent/PROGRESS.md) |
| Why is it this way? | [docs/agent/DECISIONS.md](docs/agent/DECISIONS.md) |
| What has bitten us before? | [docs/agent/LEARNINGS.md](docs/agent/LEARNINGS.md) |
| When is a phase done? | [docs/ACCEPTANCE.md](docs/ACCEPTANCE.md) |
| How does this external API really behave? | [docs/API-NOTES.md](docs/API-NOTES.md) |
| Where does this number come from? | [docs/FACTS.md](docs/FACTS.md) |

## Rules that are never broken

1. Never claim something works without running it. Say what you ran and what you saw; paste failures verbatim.
2. Never present a number you have not produced or sourced. Targets are labelled "target".
3. Never edit a locked path (`.claude/project.json` → `lockedPaths`) after it exists. The lock-guard hook enforces it.
4. Never commit secrets. `.env` is gitignored and blocked by the guard hook; document keys in `.env.example`.
5. Never bypass the gate (`--no-verify`, skipped tests, deleted assertions). Fix the cause or record it as not done.
6. Bugs: cause first. After two failed fixes, stop and propose a different approach (`/fix`).

## Map

```
src/app/             Next.js App Router: worker screens, /v contractor check, /api/* route handlers
src/lib/             domain logic: challenge token, spoken-code, rubric/, grader/, transcriber/, decision, credential
src/components/      UI pieces: PhoneFrame, CodeBadge, StepList, PassCard, QR
tests/               vitest unit tests; tests/fixtures/ is locked (write-once)
scripts/             gen-issuer-key.mjs, check-clip.mjs (rehearsal), gate.mjs
public/              static assets
demo/                GITIGNORED: recorded demo clips (faces). Never commit.
docs/agent/          memory: HANDOFF, PROGRESS, TASKS, DECISIONS, LEARNINGS
docs/                PLAN, SPEC, ACCEPTANCE, FACTS, API-NOTES, AI-LOG
.claude/project.json code paths, locked paths, gate, formatters (hooks read this)
.claude/hooks/       enforced rules (see Hooks)
.claude/skills/      on-demand routines (see Skills)
.claude/agents/      reviewer, test-writer, researcher, ui-critic
scripts/gate.mjs     the gate: runs every check in project.json
pitch/               deck + render.ps1
features.json        one entry per phase; only `passes` may change
```

## Commands

```
npm install            # install
npm run gen-key        # once: prints ISSUER_PRIVATE_JWK + CHALLENGE_SECRET for .env
npm run dev            # dev server on :3000 (camera works on localhost without HTTPS)
npm test               # tests
npm run typecheck && npm run lint
node scripts/gate.mjs  # the full gate (same as CI)
```

## Skills

- `resume` / `wrap-up`: start and end every session.
- `handoff`: save state mid-phase before `/clear` or a break.
- `task <phase>`: plan a phase (files, steps, tests, acceptance) and wait for a go.
- `ship-check`: run the gate (`node scripts/gate.mjs`) and report the real result.
- `fix <problem>`: cause-first debugging.
- `verify-ui`: open the app with Playwright and screenshot the views that matter.
- `pitch-deck`: build or update the judges' deck from the plan and FACTS.
- `kit-sync`: copy a generic improvement back to the vibe-kit template.
- `demo-run`: pre-pitch rehearsal of the 4 demo scenarios (PASS, RETAKE, REJECTED replay, tampered pass).

Agent `claims-auditor` (read-only): checks UI copy, README and pitch script against the claims policy.

## Hooks (.claude/settings.json)

- **SessionStart** `session-context.mjs`: prints HANDOFF, the latest PROGRESS entry, LEARNINGS and git state.
- **Stop** `docs-guard.mjs`: blocks once if code paths changed and `docs/agent/PROGRESS.md` did not.
- **PreToolUse** `guard.mjs`: blocks `.env` access, force-push, `reset --hard`, `clean -f`, `--no-verify`, `rm -rf`, env dumps.
- **PreToolUse** `lock-guard.mjs`: locked paths are write-once.
- **PostToolUse** `format.mjs`: formats the edited file using the rules in `project.json`.

## Git

- `main` is always green. Branch per phase: `phase-<n>-<slug>`.
- Conventional commits (`feat:`, `fix:`, `test:`, `docs:`, `chore:`, `wip:`) with the Co-Authored-By trailer.
- One commit per phase (wip commits allowed on the branch), fast-forward into `main`, push.
- Never rewrite history on `main`.

## Gotchas

(Add one line each time something surprising costs time and belongs here rather than in LEARNINGS.)

- Next.js is 16.x: read `node_modules/next/dist/docs/` before using an API from memory (see AGENTS.md).
- Browser camera/mic need HTTPS except on `localhost`; test phones against the Vercel URL.
- Vercel functions reject request bodies over 4.5 MB: send 12 frames + an audio track, never the raw video.
- Serverless memory does not persist: the challenge and the pass are self-contained signed tokens, no in-memory stores.
- Gemini free tier: content is used to improve Google's products. Only the team's own demo clips go through it.
- Prototype stand-ins (Gemini, local ES256 key, Vercel) are NOT the deck's stack (Bedrock, KMS, Lambda). Never call them by the deck's names in UI or README.
