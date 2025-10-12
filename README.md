# Pronunciation App (Angular 20)

A lightweight, mobile‑first language learning frontend with a modern, glassy light theme. It helps you:
- Record or upload audio and get a detailed pronunciation analysis (WER, per‑word scores, phonemes, pauses)
- Transcribe audio or video files and interact with the transcript
- Live transcribe microphone input in the browser (when supported)

## Quick start

1) Install and run the backend (Spring Boot Kotlin) locally on port 8080.
2) Install frontend deps:

```
npm install
```

3) Start the dev server with proxy to the backend:

```
npm run start:proxy
```

Open https://localhost:4200 (or http://localhost:4200 if not using SSL) in your browser.

## Features

- Pronunciation Scorer
  - Record via mic or upload an audio file
  - Sends audio to /api/pronunciation/analyze-detailed and renders:
    - Overall score ring (derived from per‑word evaluation or 1 − WER)
    - WER, substitutions, insertions, deletions
    - Transcript text
    - Per‑word analysis: error type (MATCH/SUBSTITUTION/INSERTION/DELETION), optional evaluation %, duration, phonemes
    - Pauses with start/end timestamps and durations
- Transcription
  - Upload audio/video to /api/transcription/transcribe and display transcript + segments with timestamps
  - Browser live transcription using the Web Speech API (fallback to file upload if unsupported)

## API contracts used

- POST /api/pronunciation/analyze-detailed
  - query: referenceText (required), languageCode (optional, default en‑US)
  - body: multipart/form‑data, part name: audio (binary)
  - response: DetailedAnalysisDto
- POST /api/transcription/transcribe
  - query: languageCode (optional, default en‑US)
  - body: multipart/form‑data, part name: file (binary)
  - response: { transcript: string, segments?: [{ text, startMs, endMs }] }
- GET /api/transcription/languages → [{ code, name }]

Errors handled in UI for common cases:
- 400 invalid/missing file or unsupported media type
- 413 payload too large
- 500 generic failure

## UI/UX and theme

- Light, minimal, glassy look inspired by modern chat UIs
- Compact spacing, mobile‑first layouts, accessible controls and roles
- Global CSS variables in src/styles.scss control colors, glass effect, spacing, and radii
- Header simplified and slightly emphasized for structure and familiarity

## Notable implementation notes

- Angular 20 standalone components with signals for simple state management
- PronunciationService wraps all API calls and centralizes endpoints
- Timestamps: helper ensures ms/second inputs render correctly as mm:ss
- Media resources (Object URLs) are always revoked to avoid leaks

## Troubleshooting

- If the backend is not on http://localhost:8080, update proxy.conf.json or start with a different proxy.
- Browser speech recognition (live transcription) isn’t available in all browsers; use the upload path instead.
- CORS/proxy: use `npm run start:proxy` during development.

## Next steps (optional)

- Add E2E tests for the scorer and transcription flows
- Persist recent analyses locally (IndexedDB) for quick comparisons
- Offer inline editing of the reference text with suggested corrections
