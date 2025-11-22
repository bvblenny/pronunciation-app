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

   For local development, edit `src/environments/environment.ts` and set your API key:
   ```typescript
   export const environment = {
     production: false,
     apiKey: 'your-actual-api-key-here',  // Your development API key
     apiBaseUrl: '/api'
   };
   ```
   
   **⚠️ SECURITY WARNING**: Do NOT commit your API key to version control. Only commit environment files with empty or placeholder values.

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

1. **Edit the development environment file**:
   ```bash
   # Open src/environments/environment.ts
   ```

2. **Set your API key**:
   ```typescript
   export const environment = {
     production: false,
     apiKey: 'your-development-api-key-here',
     apiBaseUrl: '/api'
   };
   ```

3. **Important**: Do NOT commit your API key. Use git to exclude changes to environment files:
   ```bash
   git update-index --skip-worktree src/environments/environment.ts
   ```

### Production Deployment

For production, you have several options:

**Option 1: Build-time Environment Variable Replacement**
Use a build script to replace the API key during CI/CD:
```bash
# In your build pipeline
sed -i "s/apiKey: ''/apiKey: '$API_KEY'/" src/environments/environment.prod.ts
ng build --configuration production
```

**Option 2: Configuration File**
Serve a `config.json` from your web server and load it at runtime:
```typescript
// In a ConfigService
loadConfig() {
  return this.http.get<Config>('/assets/config.json');
}
```

**Option 3: Environment-specific Builds**
Use Angular's file replacement feature in `angular.json` with different environment files per deployment target.

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
