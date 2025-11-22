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

3) **Configure API Key** (if required by backend):

   Create a `.env` file in the root directory (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file and set your API key:
   ```
   API_KEY=your-actual-api-key-here
   ```
   
   **⚠️ SECURITY WARNING**: Never commit the `.env` file to version control. It's already included in `.gitignore`.

4) Start the dev server with proxy to the backend:

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
- 401 missing or expired API key
- 403 invalid or unauthorized API key
- 413 payload too large
- 500 generic failure

## API Key Configuration

The frontend now supports API key authentication for secure communication with the backend.

### Development Setup

1. **Copy the example environment file**:
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` and add your API key**:
   ```
   API_KEY=your-api-key-here
   ```

3. **Configure the environment file** (if needed):
   - For development: Edit `src/environments/environment.ts`
   - For production: Edit `src/environments/environment.prod.ts`
   
   The API key from your `.env` file should be set in the `apiKey` field.

### Production Deployment

For production deployments, set the API key via environment variables:

```bash
export API_KEY=your-production-api-key
```

Or in your deployment configuration (e.g., Docker, Kubernetes, Cloud Platform):
```yaml
env:
  - name: API_KEY
    value: your-production-api-key
```

### Security Best Practices

⚠️ **IMPORTANT SECURITY NOTES**:
- **NEVER** commit API keys to version control
- **NEVER** expose API keys in client-side code that's publicly accessible
- Store API keys in environment variables or secure secret management systems
- Rotate API keys regularly
- Use different API keys for development, staging, and production environments
- The `.env` file is already added to `.gitignore` to prevent accidental commits

### Troubleshooting

If you see authentication errors (401 or 403):
1. Verify your API key is correctly set in the environment configuration
2. Check that the API key is valid and not expired
3. Ensure the backend service is configured to accept your API key
4. Check browser console for detailed error messages (development mode only)
