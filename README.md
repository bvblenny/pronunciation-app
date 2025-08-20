# Pronunciation App (Frontend)

A lightweight Angular 20 web UI for the Pronunciation Service backend.

Backend repo: https://github.com/bvblenny/pronunciation-service

## Tech stack:
* Angular 20, 
* Angular Material, 
* [CMU Sphinx](https://github.com/cmusphinx/sphinx4), 
* Web Speech API,
* Google Cloud Speech-to-Text

## Features

- Pronunciation Scorer
  - Record from microphone or upload an audio file
  - Provide reference text and select a language
  - Get an overall score plus per-word and per-phoneme details (alignment view)
- Live Transcription
  - Live browser speech recognition (where supported)
  - Upload audio/video to transcribe via backend endpoint
  - Copy transcript or listen via speech synthesis

## Prerequisites

- Node.js 18+ (LTS recommended) and npm
- Angular CLI (optional but handy):
  ```bash
  npm install -g @angular/cli
  ```
- Running backend (default: http://localhost:8080)
  - See: https://github.com/bvblenny/pronunciation-service

## Quickstart

1) Install dependencies
```bash
npm install
```

2) Configure the dev proxy (recommended)
```bash
cp proxy.conf.sample.json proxy.conf.json
# adjust target if your backend is not on http://localhost:8080
```

3) Start the app (with proxy)
```bash
npm run start:proxy
```

- Or without proxy:
```bash
npm start
```
Then open http://localhost:4200/

### Optional: LAN HTTPS dev server
- Put your local certs in `certs/` (ignored by Git), e.g. `cert.pem` and `cert-key.pem`.
- Update the `start:lan` script in `package.json` to point to your files if names differ.
- Run:
```bash
npm run start:lan
```

## Scripts

- `npm start` — ng serve
- `npm run start:proxy` — ng serve with proxy.conf.json
- `npm run start:lan` — dev server bound to 0.0.0.0 over HTTPS (edit cert paths as needed)
- `npm run build` — production build
- `npm run watch` — dev build in watch mode
- `npm test` — unit tests (Karma/Jasmine)

## Configuration

- API base path
  - Frontend expects endpoints under `/api/...` and forwards via the dev proxy to the backend.

## Expected API Endpoints

This app calls the Pronunciation Service with the following routes (payloads inferred from the UI):

- POST `/api/pronunciation/score`
  - FormData: `audio` (File), `referenceText` (string), `languageCode` (string, e.g. `en-US`)
  - Returns: `{ score: number, transcribedText: string, wordDetails: Array<...> }`
- POST `/api/pronunciation/evaluate-align`
  - FormData: `audio` (File), `referenceText` (string)
  - Returns: `{ transcript: string, words: [{ word, startTime, endTime, evaluation, phonemes: [...] }] }`
- POST `/api/transcription/transcribe`
  - FormData: `file` (File), `languageCode` (string, optional)
  - Returns: `{ transcript: string, segments?: [{ text, startMs, endMs }] }`
- GET `/api/transcription/languages`
  - Returns: `[{ code: string, name: string }]`

See backend for authoritative API contracts and examples.

## Testing

```bash
npm test
```

## License

MIT License

