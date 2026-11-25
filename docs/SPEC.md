# Spec: Kasauti (Round 1 prototype)

Prove a tradesperson's skill live on their own phone; leave with a signed pass a contractor can check.

## Users and the one job they hire this for

- **Worker** (domestic electrician who learned on the job): "Give me proof of my skill that a contractor will believe, without a training centre."
- **Contractor** (small contractor, facility firm): "Tell me on site, in seconds, whether this pass is real."

## What it does (in scope)

1. Issues a one-time 4-digit code for a task, valid 90 s (signed challenge token).
2. Records the worker doing the task on camera while saying the code (video, up to 60 s, plus a separate audio track).
3. Extracts 12 frames and the audio in the browser and sends them to `/api/check`.
4. Checks: token valid and unexpired; the spoken code matches (ElevenLabs Scribe, Gemini fallback); each rubric step is graded from the frames (Gemini).
5. Decides PASS, RETAKE (with a lesson), HUMAN_REVIEW or REJECTED, by fixed rules in `decide()`.
6. On PASS, issues a W3C VC 2.0 credential as an ES256-signed JWT, shown as a QR.
7. The contractor page `/v` verifies the signature against the published JWKS and shows Valid or Invalid; a tamper button proves edits break it.

One task only: wiring a 3-pin plug top (unplugged), 5 rubric steps (S1 unplugged, S2 strip, S3 earth→E, S4 L/N, S5 tight + cord grip + cover).

## What it does not do (out of scope)

Voice interview, face comparison, customer job confirmation (OTP), other trades and tasks 2–3, Kannada UI, revocation, accounts or a database, any claim of official recognition.

## Inputs and outputs

- `GET /api/challenge?task=plug-top` → `{ code, token, expiresAt, task }`
- `POST /api/check` (multipart: `token`, `audio`, `frames[]` JPEG) → `{ outcome, reasons[], code: {expected, heard, engine, match}, steps: [{id, status, confidence, frame, note}], lesson?, pass? }`
- `GET /.well-known/jwks.json` → issuer public key
- `/v#<jwt>` → verification view

## Quality bar (what "good" means, measurably)

- Demo scenarios (skill `demo-run`): good take → PASS; earth-loose take → RETAKE flagging S3; replayed take → REJECTED; tampered pass → Invalid. All four, every rehearsal.
- `/api/check` answers within 15 s on the demo takes (target).
- Payload to `/api/check` under 4 MB.
- Works on a phone browser over HTTPS and on a laptop on localhost.

## Constraints (time, compute, budget, data, ethics)

- One day of build time; pitch on 26–27 Nov 2026.
- ₹0 budget: Gemini free tier, ElevenLabs free plan, Vercel Hobby.
- Free-tier Gemini data is used to improve Google's products: only the team's own demo clips, never real workers.
- Demo clips show faces: they live in gitignored `demo/` and never enter the public repo.
- Claims policy in AGENTS.md applies to all copy.
