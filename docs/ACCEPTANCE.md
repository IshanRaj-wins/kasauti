# Acceptance

A phase is done only when every line under it passes, with evidence (command + result) noted in PROGRESS. Lines use Given / When / Then. `/task` drafts missing lines; `/wrap-up` ticks them.

```
## P<n>: <name>
- [ ] Given <state>, when <action>, then <observable result>.
```

## P0: Pitch deck + research freeze
- [x] Done before bootstrap (see PROGRESS).

## P1: Scaffold + harness
- [ ] Given a fresh clone, when `npm install && node scripts/gate.mjs` runs, then typecheck, lint, test and build all pass.
- [ ] Given the GitHub repo, when viewed logged-out, then it is public and contains no `.env*` (except `.env.example`) or `demo/` files.
- [ ] Given `kit/init.mjs`, when it ran, then it printed `hooks: 16/16 passed`.

## P2: Worker app shell and design tokens
- [ ] Given the dev server, when each screen (Home, Task brief, Record, Checking, Result, Pass, /v) is opened at 390×844 and 1440×900, then it renders with no console errors and no clipped text.
- [ ] Given the components, when grepped for raw hex colours, then none are found outside the token file.

## P3: Live capture with one-time code
- [ ] Given `GET /api/challenge`, when called, then it returns a 4-digit code and a token that verifies; a unit test shows an expired or tampered token is refused.
- [ ] Given a laptop webcam, when a clip is recorded on the Record screen, then 12 JPEG frames and an audio blob are produced and the payload size shown is under 4 MB.
- [ ] Given the Record screen, when 60 s pass, then recording stops by itself; when the code's 90 s pass, then the screen asks for a new code.

## P4: Checks, grading and decision
- [ ] Given the spoken-code unit tests, when run, then English, Devanagari Hindi, romanized Hindi, "double" and noisy transcripts map to the right digits and a wrong code does not match.
- [ ] Given the `decide()` unit tests, when run, then each rule in PLAN P4 step 5 gives its outcome.
- [ ] Given the good take and its own code, when checked, then the outcome is PASS.
- [ ] Given the earth-loose take, when checked, then the outcome is RETAKE with S3 missed.
- [ ] Given the good take and a fresh code, when checked, then the outcome is REJECTED with heard ≠ expected.

## P5: Signed pass and contractor check
- [ ] Given credential unit tests, when run, then sign→verify passes, a changed byte fails and a different key fails.
- [ ] Given a PASS, when the QR is scanned with a phone, then /v shows Valid with the worker name, trade, task and issue date.
- [ ] Given /v showing Valid, when "Try tampering" is pressed, then it shows Invalid.

## P6: Demo hardening, deploy and recording
- [ ] Given the Vercel URL, when opened on a phone over HTTPS, then a full test can be recorded and a pass issued.
- [ ] Given the `demo-run` skill, when run, then all four scenarios give the expected outcome.
- [ ] Given the demo video, when timed, then it is 60 s or less.
- [ ] Given the `claims-auditor` agent, when run on UI copy and README, then it reports no rule-1, -2 or -3 findings.
