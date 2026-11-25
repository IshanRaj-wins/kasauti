# API notes

What is actually true about the external APIs and libraries we use: tested or read in the docs, with version and date. Check here before using an API; add a line whenever you learn something.

Format: `- <api / library>: <what is true> (<tested | read>, <package@version or API version>, <YYYY-MM-DD>)`

- ElevenLabs STT: `POST https://api.elevenlabs.io/v1/speech-to-text`, multipart, header `xi-api-key`; field `file` (or `source_url`), required `model_id` (docs examples use `scribe_v2`; `scribe_v3` mentioned); optional `language_code`, `keyterms`, `numbers_format: digits|words` (scribe_v3). "All major audio and video formats" (webm not named explicitly) (read, API docs, 2026-11-25)
- Gemini API free tier: models marked free include `gemini-3.5-flash-lite`, `gemini-3-flash-preview`, `gemini-3.1-flash-lite`, `gemini-2.5-flash-lite` (image/video input), `gemini-3.8-flash`, `gemini-3.5-transcribe`; `gemini-2.5-flash` routes to `gemini-3.5-flash-lite` from 2026-12-01; free-tier content is used to improve Google's products (read, aistudio.google.com/docs/pricing, 2026-11-25)
- Vercel Functions: request body limit 4.5 MB (read from memory, verify when deploying in P6)
