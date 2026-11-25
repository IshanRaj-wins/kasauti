# Kasauti: the touchstone for skill

> A tradesperson proves a skill live on their own phone and leaves with a signed pass a contractor can check.

wHACKiest 2026 · Track 4 (UnlockED) · PS 1: Localized Vocational Skill Verification. Pitch deck: [pitch/Kasauti_Track4.pptx](pitch/Kasauti_Track4.pptx).

## Status: Round 1 prototype

This is a one-day working prototype for one task: wiring a 3-pin plug top (unplugged), the domestic-electrician MVP from the deck. It shows:

1. **A one-time code**: 4 digits, valid for 90 s, which the worker says on camera.
2. **Live recording**: up to 60 s. The browser sends 12 frames and the audio track.
3. **Three checks**:
   - the challenge is unexpired;
   - the spoken code matches;
   - each rubric step is graded from the frames.
4. **A decision**: pass, retake (with the missed step), human review, or rejected (a replayed clip with the wrong code).
5. **A signed pass**: a W3C Verifiable Credential (VC 2.0 as an ES256 JWT), shown as a QR code.
6. **A contractor check page**: it verifies the signature against the published key, and a tamper button shows that edits fail.

### What the prototype uses (and what it doesn't)

It runs at ₹0 on free tiers, so it is **not** the production stack on the deck's tech slide:

| Job | Prototype | Planned (deck, Round 2) |
|---|---|---|
| Step grading | Gemini API (free tier) | Claude on Amazon Bedrock |
| Spoken-code check | ElevenLabs Scribe (free plan); Gemini fallback | ElevenLabs Scribe |
| Pass signing | Local ES256 key | AWS KMS key |
| Backend | Next.js route handlers on Vercel | Lambda + API Gateway, DynamoDB, S3 |
| Face comparison | Not built | Amazon Rekognition |

Also not built: the voice interview, customer job confirmation, other trades, revocation. The rubric is a proposed demo rubric, not an official assessment. Kasauti has no government recognition, pilot or partnership.

**Privacy:** free-tier Gemini content is used to improve Google's products. Only the team's own demo recordings have gone through this prototype. Please don't record anyone else with it.

## Run it

```bash
npm install
npm run gen-key          # prints CHALLENGE_SECRET and ISSUER_PRIVATE_JWK
cp .env.example .env.local   # paste the keys + a free GEMINI_API_KEY (aistudio.google.com/apikey)
npm run dev              # http://localhost:3000 (camera works on localhost)
node scripts/gate.mjs    # typecheck, lint, tests, build
```

## How it works

```
GET  /api/challenge  → code + 90 s signed token
record (video + audio) → 12 frames + audio in the browser
POST /api/check      → token check → spoken-code check → step grading → decide()
                       → PASS: signed VC-JWT → QR → /v#<jwt>
/v                   → verifies against /.well-known/jwks.json
```

## Working on it

This repo uses the vibe-kit harness. Open Claude Code here, run `/resume`, work one phase from [docs/PLAN.md](docs/PLAN.md), then `/wrap-up`. Truth lives in [docs/](docs/) and [docs/agent/](docs/agent/); rules are in [CLAUDE.md](CLAUDE.md) and [AGENTS.md](AGENTS.md).
