---
name: demo-run
description: Pre-pitch rehearsal for Kasauti. Starts the dev server and runs the four demo scenarios (good clip → PASS, miss clip → RETAKE, replayed clip → REJECTED, tampered pass → Invalid) against the real checks, times each one, and reports which passed. Use before recording the demo video, before the pitch, and after any change to /api/check, the grader, the transcriber or the credential code.
---

# Demo run

Needs `.env` filled (`GEMINI_API_KEY`, `CHALLENGE_SECRET`, `ISSUER_PRIVATE_JWK`; `ELEVENLABS_API_KEY` optional) and the two saved takes in `demo/` (gitignored):

- `demo/good/` and `demo/miss/` hold `frames/*.jpg` (12 frames) + `audio.webm`, plus `code.txt` with the digits spoken in that take. The app's "Save take for rehearsal" button on the result screen writes them in dev mode.

## Steps

1. Start `npm run dev` in the background. Wait until `http://localhost:3000` answers.
2. Scenario A, good take with its own code:
   `node scripts/check-clip.mjs demo/good --use-recorded-code` → expect `PASS`, 5/5 steps `done`, digits heard = `code.txt`.
3. Scenario B, miss take:
   `node scripts/check-clip.mjs demo/miss --use-recorded-code` → expect `RETAKE`, S3 (earth) `missed`, a lesson string.
4. Scenario C, replay. The script fetches a fresh challenge and submits the good take against it:
   `node scripts/check-clip.mjs demo/good` → expect `REJECTED`, reason `code_mismatch`, heard ≠ expected.
5. Scenario D, tampered pass. Take the JWT from scenario A's output:
   `node scripts/check-clip.mjs --tamper <jwt>` → expect the original `valid: true` and the tampered copy `valid: false`.
6. Time each scenario (wall clock of the script). Note any above 15 s: the live demo cannot absorb it.
7. Stop the dev server.

`--use-recorded-code` mints a challenge for the take's recorded code. It exists only in development (`NODE_ENV !== "production"`), so production cannot be fooled by it.

## Report

A table: scenario, expected, actual, seconds, pass/fail. Paste any failure verbatim. If a scenario fails because of a provider (rate limit, 5xx), say so: do not retry more than twice, because free-tier quotas are small. Never edit expected results to make a run pass.
