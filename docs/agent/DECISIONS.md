# Decisions

Why things are the way they are. Newest first. Change a decision by adding a new entry that supersedes the old one, not by editing history.

```
## YYYY-MM-DD: <decision as a sentence>
<context; the choice; what was rejected and why>
```

## 2026-11-25: Start from the vibe-kit template
Every project shares one harness (hooks, skills, memory docs) so the working loop is the same everywhere. Project-specific rules go in `.claude/project.json` and domain skills, not in edited copies of the generic hooks.

## 2026-11-25: Prototype runs on free tiers, behind swappable interfaces
Budget is ₹0. Grading uses the Gemini API free tier instead of Claude on Bedrock; signing uses a local ES256 key instead of AWS KMS; hosting is Vercel Hobby instead of Lambda/API Gateway; no face check (Rekognition). Grader and transcriber sit behind interfaces in `src/lib/grader/` and `src/lib/transcriber/` so Round 2 swaps providers without touching routes or UI. The pitch says this aloud. Rejected: a clickable mock (judges see through canned results; AGENTS.md forbids fake success).

## 2026-11-25: Spoken code checked by ElevenLabs Scribe, Gemini as fallback
Scribe is on the ElevenLabs free plan and keeps the sponsor link. If `ELEVENLABS_API_KEY` is absent, Gemini transcribes the audio, and the result screen names the engine used.

## 2026-11-25: Stateless signed tokens, no database
The challenge is an HS256 JWT `{attemptId, taskId, code, exp = now + 90 s}`; the pass is a self-contained ES256 VC-JWT. Serverless memory does not persist between invocations, so in-memory stores would break on Vercel. Revocation is out of scope.

## 2026-11-25: Send 12 frames + an audio track, not the video
Vercel rejects request bodies over 4.5 MB. The browser extracts 12 evenly spaced 640 px JPEGs and records audio separately. Rejected: uploading the clip (size), uploading to object storage (needs a paid or extra service for one day of work).

## 2026-11-25: One task (3-pin plug top, unplugged), not three
Safe to perform at home, steps visible on camera, fits one day. Tasks 2–3 are labelled as Round 2 in the UI.

## 2026-11-25: Next.js 16 App Router with `src/`, adapted from the node profile
The deck names a Next.js PWA. The kit's node profile assumes Vite, so `codePaths` were changed to the Next.js layout. Candidate for `/kit-sync` as a `nextjs` profile.
