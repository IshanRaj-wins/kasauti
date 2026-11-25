# Coding standards: Kasauti

Read before changing code. CLAUDE.md is the map and workflow; this file is how code is written here.

## Communication

- Lead with the result. Then what you ran and what you saw.
- Name files as clickable paths. Quote errors verbatim.
- When unsure, say so and say how you'll find out. Don't guess an API: check `docs/API-NOTES.md`, then the real docs, then write what you learned back to API-NOTES.

## Correctness

- Smallest change that solves the task. No drive-by refactors; list them under "Ideas / later" in TASKS.md.
- Validate input at boundaries (API handlers, file loaders, CLI args). Fail loudly with a message that says what to do.
- No mock data, fake success or hard-coded outputs in shipped paths. Mocks live in tests only.
- No silent `except: pass` / empty `catch {}` outside hooks.

## Tests

- Every phase adds tests for what it built. Expected values come from fixtures, references or hand calculation, never from running the code under test.
- Tests are fast and offline by default. Network tests are marked and skipped in CI.
- A failing test is fixed or explicitly recorded as known-failing with a reason in PROGRESS. Never deleted to make the gate pass.

## Naming and layout

- Names say what a thing is, in the domain's words. No `utils2`, `helper`, `data_new`.
- One module, one job. Split a file once it does two things.
- Config and secrets come from environment variables (documented in `.env.example`), never literals.

## Stack rules

- TypeScript strict; no `any` without a comment saying why.
- React: function components, state as local as possible, no prop drilling past two levels.
- Styling through design tokens (CSS variables / Tailwind theme), never raw hex in components.
- Every user-visible async state has loading, empty and error UI.
- Prettier formats on save (PostToolUse hook).
- Next.js App Router. Route handlers validate every input with zod and return `{ error }` with a clear status on failure.
- Provider SDKs (`@google/genai`, ElevenLabs HTTP) are imported only inside `src/lib/grader/` and `src/lib/transcriber/`, behind an interface, so Round 2 can swap in Claude on Bedrock.
- Secrets are read only on the server (`process.env` inside route handlers / `src/lib`); nothing secret gets a `NEXT_PUBLIC_` prefix.
- `decide()`, `spoken-code` and `credential` stay pure and unit-tested; UI never re-implements their rules.

## Claims policy (UI copy, README, pitch)

- Never claim a pilot, partnership, user test, government recognition or DPDP compliance.
- Face comparison is not built; never imply liveness detection.
- Targets, estimates and prices are labelled as such. Every number has a FACTS.md row.
- Say what the prototype really uses (Gemini free tier, local signing key), not the deck's production stack.

## Docs

- Decisions that depart from the plan go in DECISIONS.md the same session.
- Any number shown to users or judges has a row in FACTS.md or is generated into a results file by a script.
- Keep PROGRESS.md entries factual: what changed, what was verified, what was not.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
