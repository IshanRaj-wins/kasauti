# Coding standards: {{PROJECT_NAME}}

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

{{STACK_RULES}}

## Docs

- Decisions that depart from the plan go in DECISIONS.md the same session.
- Any number shown to users or judges has a row in FACTS.md or is generated into a results file by a script.
- Keep PROGRESS.md entries factual: what changed, what was verified, what was not.
