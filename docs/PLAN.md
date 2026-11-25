# Plan: Kasauti prototype for the wHACKiest 2026 Round 1 pitch

## Context

Kasauti (Track 4, UnlockED, PS 1) is a concept for proving a tradesperson's skill on their own phone. The deck (`C:\Users\ishan\Downloads\Kasauti_Track41.pptx`, 8 slides) and `Kasauti_context1.md` say nothing has been built yet. The online pitch is 26–27 Nov: 5 minutes plus 3 minutes of Q&A, with about **60 seconds for a prototype demo**. Judges weigh understanding of the problem, the thinking behind the solution and the presentation; industry evaluators asked for MVPs.

The goal for tomorrow is a working slice that shows the two claims no slide can prove on its own:
1. **Replay resistance.** A clip with the wrong spoken one-time code is rejected.
2. **A pass a contractor can check.** A signed pass verifies, and the same pass with one field changed fails.

**Constraints**
- Budget is ₹0, so the prototype uses free tiers only.
- One day of build time.
- The event asks for a public GitHub repo.
- The structure comes from the `IshanRaj-wins/vibe-kit` template, adapted to this project.

### What the prototype proves, slide by slide
| Slide | Deck claim | Prototype shows it? |
|---|---|---|
| 3 Solution | Do → Get graded → Own the pass | Yes, for 1 task (plug-top wiring). "Speak" (the voice interview) is not built. |
| 5 Architecture | One-time code, spoken-code check, step grading, decision, signed pass, contractor check | Yes. Face comparison and SNS job confirmation are not built. |
| 6 Novelty | Replay-resistant evidence | Yes. A live replay gets rejected. |
| 7 Feasibility | "Can't tell" and human-review routing | Yes, in the decision engine. |
| 4 Tech stack | Claude on Bedrock, KMS, Rekognition, Lambda | **No.** Free-tier stand-ins replace them (see Decisions). This has to be said aloud in the pitch. |

## Decisions (the ₹0 stack)
| Deck says | Prototype uses | Why | Round 2 swap |
|---|---|---|---|
| Claude on Amazon Bedrock (grading) | Gemini API free tier (Google AI Studio key, no card), behind a `Grader` interface | No money for Bedrock. Gemini's free tier accepts images. | Add a Claude/Bedrock `Grader` once AWS credits arrive. |
| ElevenLabs Scribe (spoken code) | ElevenLabs Scribe on the **free plan** (`POST /v1/speech-to-text`, `xi-api-key`). Gemini transcription is the fallback when no key is set. | Keeps the sponsor link. Free includes Scribe hours. | None needed. |
| AWS KMS-signed W3C VC | ES256 key in `.env`, VC-JWT (`typ: vc+jwt`) signed with `jose`, public key at `/.well-known/jwks.json` | Free, and verifies with standard tools. | KMS ECC_NIST_P256 signer. |
| Lambda + API Gateway + S3 + DynamoDB | Next.js route handlers on Vercel Hobby (free). No database. | The challenge token and the pass are both self-contained signed tokens, so nothing needs storing. | Lambda + DynamoDB. |
| Rekognition face check | Not built. Said aloud as Round 2. | Needs AWS. | Rekognition CompareFaces. |
| 3 tasks, ~30 frames, clips up to 60 s | 1 task, 12 frames + an audio track, clips up to 60 s | Fits one day and stays under Vercel's 4.5 MB request-body limit. | 3 tasks. |

**Other decisions**
- **Challenge token.** HS256 JWT `{attemptId, taskId, code, exp = now + 90 s}`, signed with `CHALLENGE_SECRET`. This is stateless, so it works on serverless functions where memory does not persist.
- **Privacy.** Free-tier Gemini content "is used to improve products". Only the team's own demo clips go through it. Demo clips live in `demo/` and are **gitignored**, so faces never reach the public repo. The README and the consent screen say this.
- **Not built tomorrow:** the voice interview, face check, customer OTP, other trades, Kannada, revocation.

## Architecture
```
Phone / laptop browser (Next.js page)
  1. GET  /api/challenge?task=plug-top  → {code "4816", token, expiresAt}
  2. Record: MediaRecorder (video + a separate audio-only recorder), 60 s cap, code + 90 s countdown on screen
  3. Client extracts 12 evenly spaced JPEG frames (640 px) from the recorded video, plus the audio blob
  4. POST /api/check (multipart: token, audio, frames[])
       verify token + expiry  → REJECTED "code expired"
       Scribe(audio) → digits → match code? → REJECTED "replay suspected" / RETAKE "couldn't hear code"
       Gemini(frames + rubric) → per-step {done | missed | cant_tell, confidence, frame, note}
       decide() → PASS | RETAKE (+ lesson) | HUMAN_REVIEW | REJECTED
       PASS → sign VC-JWT
  5. Result screen → Pass screen (QR of  <base>/v#<jwt>)
Contractor: /v#<jwt> → fetch JWKS (cached in localStorage) → jose verify → Valid / Invalid
```

### Key files (Next.js App Router, `src/` layout)
- `src/lib/challenge.ts`: issue and verify the challenge token
- `src/lib/spoken-code.ts`: normalizes a transcript to digits (EN, HI Devanagari, romanized HI, Kannada numerals, "double five") and matches it to the code. Pure function, unit-tested.
- `src/lib/rubric/plug-top.ts`: 5 steps
  - S1: cable visibly unplugged (safety)
  - S2: strip sheath and insulation without nicking the conductors
  - S3: earth (green or green/yellow) to E (safety)
  - S4: live (red or brown) to L, neutral (black or blue) to N
  - S5: terminals tight, cord grip clamped on the sheath, cover closed
- `src/lib/grader/{types,gemini}.ts`: the `Grader` interface and the Gemini implementation (structured JSON output)
- `src/lib/transcriber/{types,elevenlabs,gemini}.ts`: Scribe first, Gemini as the fallback
- `src/lib/decision.ts`: pure `decide()`, unit-tested
- `src/lib/credential.ts`: sign and verify the VC-JWT, build the JWKS
- `src/app/api/{challenge,check}/route.ts` and `src/app/.well-known/jwks.json/route.ts`
- `src/app/(worker)/…`: Home → Task brief → Record → Checking → Result → Pass
- `src/app/v/page.tsx`: the contractor check, with the tamper demo
- `src/components/…`: PhoneFrame, CodeBadge, Countdown, StepList, PassCard, QR (the `qrcode` package)
- `scripts/gen-issuer-key.mjs`: generates the ES256 JWK pair and prints the lines for `.env`
- `scripts/check-clip.mjs`: posts saved frames and audio from `demo/` to `/api/check`, for rehearsal
- `tests/*.test.ts` (vitest) and `tests/fixtures/` (transcript fixtures, locked)

### Env (`.env.example`)
- `GEMINI_API_KEY`
- `GEMINI_MODEL` (default: a free-tier image-capable flash model; confirm in AI Studio during P4)
- `ELEVENLABS_API_KEY` (optional)
- `CHALLENGE_SECRET`
- `ISSUER_PRIVATE_JWK`
- `PUBLIC_BASE_URL`

### Look
The UI uses the deck's palette as CSS tokens:
- navy `#1B1F6B`
- orange `#FD9B36`
- cream `#FFF1E0` / `#F8F2E4`
- burnt orange `#C2410C` (miss)
- green `#1E7F4F` (pass)
- ink `#14162B`
- muted `#6B6459`

Fonts are a heavy display face (close to the deck's Arial Black) plus a clean sans. Layout is mobile-first, inside a phone frame on desktop. The screens follow the slide 3 concept images (media `image4/8/9/2.png`), extracted during P2.

---

## P0: Pitch deck + research freeze (done)
The deck and `Kasauti_context1.md` are final. Copy the deck into `pitch/` and the sources into `docs/FACTS.md`.

## P1: Scaffold + harness (~45 min)
Use the `new-project` skill, Path A.

1. `gh repo create IshanRaj-wins/kasauti --public --template IshanRaj-wins/vibe-kit`. If GitHub refuses public-from-private, create it private and run `gh repo edit --visibility public --accept-visibility-change-consequences`. Then clone it to `c:\MSRIT\kasauti` and retry if it's empty.
2. Run `create-next-app@latest` (TS, Tailwind, ESLint, App Router, `src/`, npm) **in the scratchpad**, because it refuses a non-empty folder. Move the app files into the repo and merge `.gitignore`. Add `vitest`, `jose`, `qrcode`, `@google/genai` and `prettier`. Add the scripts `typecheck` (`tsc --noEmit`), `lint` (`eslint .`) and `test` (`vitest run`).
3. Run `node kit/init.mjs --name "Kasauti" --slug kasauti --pitch "Prove a tradesperson's skill live on their own phone; leave with a signed pass a contractor can check." --profile node --plan <this file> --done P0 --locked "tests/fixtures/"`. It must print `hooks: 16/16 passed`.
4. **Kit changes for this project:**
   - `.claude/project.json`
     - `codePaths`: `src/, tests/, public/, scripts/, package.json, next.config.ts, tsconfig.json`. Drop the Vite entries.
     - `gate`: typecheck, lint, test, build.
     - `blockedCommands`: `git add demo`.
   - `.gitignore`: add `.next/`, `demo/` and `.vercel/`.
   - `CLAUDE.md`
     - Map: the real folders.
     - Gotchas:
       - the camera needs HTTPS except on localhost;
       - Vercel's request body limit is 4.5 MB;
       - free-tier data is used for training;
       - demo clips must never be committed.
   - `AGENTS.md` Stack rules:
     - Next.js route handlers validate input with zod;
     - no provider SDK outside `src/lib/{grader,transcriber}`;
     - every user-visible claim follows the claims policy.
   - New skill `.claude/skills/demo-run/SKILL.md`, a rehearsal routine. Start the dev server, then run four scenarios through `scripts/check-clip.mjs`:
     - good clip → PASS
     - miss clip → RETAKE
     - replay → REJECTED
     - tampered pass → Invalid

     Time each scenario and report.
   - New read-only agent `.claude/agents/claims-auditor.md`. It checks UI copy, the README and the pitch script against the context file's claims policy (§4). It flags:
     - claims of a pilot or government recognition;
     - claims that face comparison proves liveness;
     - claims of DPDP compliance;
     - unlabelled targets.
   - `docs/`
     - SPEC from this plan;
     - FACTS from context §7, plus the free-tier rows with today's date;
     - DECISIONS from the Decisions table;
     - API-NOTES stubs for Scribe and Gemini.
5. Copy the deck to `pitch/Kasauti_Track4.pptx`. Rewrite the README (pitch, status, run steps, "prototype on free tiers" note, privacy note). Commit `chore: bootstrap from vibe-kit` and push.
6. Reopen Claude Code in `c:\MSRIT\kasauti` so the hooks load, then `/resume`. If time is short, run several phases per session and use `/handoff` at about 60% context.

**Acceptance:** `node scripts/gate.mjs` passes on the empty app. The repo is public. `hooks: 16/16 passed`.

## P2: Worker app shell and design tokens (~1.5 h)
1. Extract the slide 3 and slide 1 concept images to the scratchpad and view them. Copy their layout, not their pixels.
2. Put the tokens in `globals.css` (Tailwind theme). Build PhoneFrame and the screens: Home (name, consent with the prototype privacy note) → Task brief (5 rubric steps, "Task 1 of 3 · tasks 2–3 in Round 2 build") → Record → Checking → Result → Pass.
3. Every async view gets loading, empty and error states.

**Acceptance:** every screen renders at 390×844 and 1440×900 with no console errors (checked with `verify-ui`).

## P3: Live capture with one-time code (~1.5 h)
1. `/api/challenge` issues a 4-digit code from `crypto.randomInt` plus the token. Unit tests: valid, expired, tampered token.
2. Record screen:
   - camera preview;
   - a large "Say: 4 · 8 · 1 · 6" badge with a 90 s countdown;
   - start/stop;
   - 60 s cap;
   - video and audio-only recorders running together.
3. After stopping, extract 12 frames (canvas → JPEG 0.7, 640 px) and keep the audio blob. Show the payload size, which must be under 4 MB.

**Acceptance:**
- A recording on a laptop webcam produces 12 frames and an audio file.
- An expired token is refused by a unit test.

## P4: Checks, grading and decision (~2 h)
1. **Transcription.**
   - Read the ElevenLabs STT docs and record the facts in API-NOTES: model id (`scribe_v2` or v3), `numbers_format: digits`, whether webm is accepted.
   - Implement the Scribe call.
   - Implement the Gemini transcription fallback.
2. **`spoken-code.ts`, test-first.** Fixtures:
   - "four eight one six"
   - "चार आठ एक छह"
   - "char aath ek chhe"
   - "double four"
   - noise around the digits
   - a wrong code
3. **Rubric source.** Read the PSS/Q6001 PDF (context §7). Cite the closest NOS/PC in the rubric file. If nothing matches plug-top wiring, label the rubric "demo task; not from PSS/Q6001".
4. **Gemini grader.** Send the frames plus the rubric and ask for strict JSON (structured output). Validate it with zod. Accept both the old and new Indian wire colour codes. Return `cant_tell` when a step isn't visible.
5. **`decide()`, test-first.**

   | Condition | Outcome |
   |---|---|
   | Token invalid or expired | REJECTED |
   | Code mismatch | REJECTED (replay suspected) |
   | Code inaudible | RETAKE |
   | Poor video, or 2+ steps `cant_tell` | RETAKE ("can't tell") |
   | A safety step missed | RETAKE with a lesson |
   | All done, confidence ≥ 0.7 | PASS |
   | Anything else | HUMAN_REVIEW |

6. **Result screen.** It shows the heard digits against the expected code, the engine name, and per-step ticks and misses with the evidence frame.

**Acceptance:**
- Unit tests pass.
- Using the real clips through `scripts/check-clip.mjs`:
  - the good clip gives PASS;
  - the clip with the loose earth gives RETAKE, flagging S3;
  - the good clip against a new code gives REJECTED.

## P5: Signed pass and contractor check (~1.5 h)
1. `scripts/gen-issuer-key.mjs` generates the key and `credential.ts` signs the pass. The VC 2.0 payload:
   - `@context` `https://www.w3.org/ns/credentials/v2`
   - `type` `[VerifiableCredential, KasautiSkillPass]`
   - `issuer` = `PUBLIC_BASE_URL`
   - `validFrom`
   - `credentialSubject` {name, trade "Electrician (domestic)", task, steps passed, rubric version}
   - header `kid`
2. Pass screen: PassCard plus a QR of `<base>/v#<jwt>`, and a Share button (Web Share API).
3. `/v` page:
   - verifies the token against the JWKS and caches the key, so it also verifies offline once the key is cached;
   - shows Valid (green) or Invalid (burnt orange);
   - has a "Try tampering" button that edits one claim and re-verifies, so the judges watch it fail.
4. Unit tests: sign → verify OK; one changed byte → fails; wrong key → fails.

**Acceptance:**
- Scanning the QR with a phone opens `/v` and shows Valid.
- Tampering shows Invalid.

## P6: Demo hardening, deploy and recording (~2 h)
1. **Record the clips into `demo/` (gitignored).** Ishan records these on a laptop webcam:
   - Good take: say the code, show the unplugged cable, strip, then E, L, N, tighten, cord grip, cover.
   - Miss take: the same, but the earth is left loose.
2. **Add a "Replay last clip" demo control.** It resubmits the previous frames and audio against a fresh code. This is real logic, labelled as a demo control.
3. **Deploy to Vercel Hobby.** Ask before deploying, because it is a public URL. Set the env vars in Vercel. Set `maxDuration` on `/api/check`. Test on a phone over HTTPS.
4. **Record the 60-second demo video** with screen capture, following the script below. It is the backup if the live demo fails, and the YouTube video if Devnovate still accepts one.
5. **Final checks.**
   - Run the `claims-auditor` agent on the UI copy and README.
   - Run `/wrap-up`.
   - Confirm the repo is public with no `.env` or `demo/` files.
6. **Stretch, only if time is left:** an ElevenLabs TTS voice line for the RETAKE lesson (Hindi or English, within the free 10k characters).

**Acceptance:**
- The Vercel URL works on a phone.
- The demo video is at most 60 s.
- `demo-run` reports all 4 scenarios as expected.

---

## The 60-second demo (insert it right after slide 3, "Proposed Solution")
| Time | On screen | Say |
|---|---|---|
| 0–8 s | Task brief → code "4 · 8 · 1 · 6", 90 s | "Task 1: wire a plug top. Kasauti gives a one-time code that dies in 90 seconds." |
| 8–22 s | The recorded clip at 2× speed | "He says the code on camera and does the job." |
| 22–35 s | Result: code heard ✓, 5/5 steps → PASS | "Scribe hears the code, the AI checks each step against our rubric." |
| 35–45 s | Pass QR → phone scan → **Valid** | "A contractor scans it on site. Signed, checkable, no certificate office." |
| 45–60 s | Replay the same clip → **REJECTED** (heard 4816, expected 2957). Tamper → **Invalid** | "Replay an old video: rejected. Edit the pass: rejected." |

Required line, said once: "This prototype runs on free tiers, with Gemini as a stand-in grader. Round 2 runs on Claude on Bedrock and KMS, as on our tech slide."

## Cutlines (in order, if behind)
1. Drop the Vercel deploy: demo on localhost and use the recorded video.
2. Drop Scribe: use Gemini transcription only, and say so.
3. Drop "Try tampering": the replay rejection alone carries the anti-fake story.
4. **Never cut** the replay rejection or the signed-pass verification.

## Verification
- `node scripts/gate.mjs`: typecheck, lint, vitest (token, spoken-code, decision, credential) and `next build` all green.
- `verify-ui` (Playwright MCP) at 390×844 and 1440×900 on every screen. The console must be clean.
- Real end-to-end on a laptop webcam: good → PASS, miss → RETAKE (S3), replay → REJECTED, waiting more than 90 s → REJECTED "expired", tamper → Invalid.
- A phone over HTTPS (Vercel URL): record, get a pass, scan it with a second phone.
- Time the demo video. Run `claims-auditor`. Run `git ls-files` to confirm no `.env`, `demo/` or key material.

## Only Ishan can do these (today)
- Get a free Google AI Studio API key (Gemini). Get a free ElevenLabs account and API key (confirm no card is asked for). Make a Vercel Hobby login with GitHub.
- Get the plug-top props (a 3-pin plug top, a short 3-core cable, a screwdriver, a stripper) and record the two takes.
- Check whether Devnovate still lets you add the GitHub and YouTube links. Fill in the deck's team fields.
- After merge, consider `/kit-sync` to add a reusable `nextjs` profile to vibe-kit.
