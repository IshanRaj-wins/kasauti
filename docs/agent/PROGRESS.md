# Progress

Newest first. One entry per session or phase: what changed, what was verified, what was not. The SessionStart hook prints the top entry; the Stop hook blocks a turn that changed code without touching this file.

Entry format:

```
## YYYY-MM-DD: P<n> <name> (done | part k | in progress)
<one-line summary>
- <change, with file paths and measured numbers>
- Verified: <commands run and their results>
- Not checked: <explicit list, or "nothing">
```

## 2026-11-25: P1 Scaffold + harness (done)
Public repo IshanRaj-wins/kasauti from vibe-kit, with the Next.js 16.4.6 app (App Router, src/, Tailwind 4) merged in.
- Next.js scaffolded in the scratchpad (create-next-app refuses a non-empty folder) and moved in; .gitignore and AGENTS.md merged.
- Deps: jose, qrcode, @google/genai, zod; dev: vitest 5, prettier, @types/node 24 (vitest's peer needs >=22).
- typecheck = `next typegen && tsc --noEmit` (Next 16 global LayoutProps type is generated).
- Kit adapted: project.json codePaths for Next.js, blockedCommands for demo/ and .env; CLAUDE.md map + gotchas; AGENTS.md stack rules + claims policy; skill demo-run; agent claims-auditor; SPEC, FACTS (13 rows), DECISIONS (6), API-NOTES, ACCEPTANCE P1–P6; scripts/gen-issuer-key.mjs; deck copied to pitch/.
- Verified: kit/init.mjs printed "hooks: 16/16 passed"; `node scripts/gate.mjs` passed (typecheck, lint, test, build, 53 s); gen-issuer-key prints both lines.
- Not checked: logged-out view of the repo (done after push).

## 2026-11-25: Bootstrap
Project created from the vibe-kit template.
- Harness: CLAUDE.md, AGENTS.md, .claude/{settings.json, project.json, hooks, skills, agents}, docs/agent/*, features.json, scripts/gate.mjs.
- Verified: hook smoke test (kit/test-hooks.mjs) passed
- Not checked: gate commands against real code (no code yet).
