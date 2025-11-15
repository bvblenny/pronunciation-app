# Pronunciation App (Angular 20)

Language learning frontend with a modern UI:
- Record or upload audio and get a detailed pronunciation analysis (WER, per‑word scores, phonemes, pauses, ...)
- Transcribe audio or video files and interact with the transcript
- Live transcribe microphone input in the browser (if supported by browser)

## Quick start

1) Install and run the backend (pronunciation-service) locally on port 8080.
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
  - Sends audio to backend service and displays the evaluation result:
    - Overall score
    - Word-Error-Rate, substitutions, insertions, deletions
    - Transcript text
    - Per‑word analysis: error type (MATCH/SUBSTITUTION/INSERTION/DELETION), evaluation %, duration, phonemes
    - Pauses with start/end timestamps and durations
- Transcription
  - Upload audio/video to /api/transcription/transcribe and display transcript + segments with timestamps
  - Browser live transcription using the Web Speech API or file upload
  - **NEW: Interactive Text View** - Mobile-first, readable text display with:
    - Word and sentence level interactions
    - Click on text segments for detailed information
    - Extensible overlay system for future enhancements (pronunciation guides, translations, etc.)
    - Full accessibility support (keyboard navigation, screen readers)
    - See [Interactive Text View Documentation](docs/INTERACTIVE_TEXT_VIEW.md) for details

## API contracts

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
