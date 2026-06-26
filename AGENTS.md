# Pronunciation App Context Guide

## Project Overview

**Pronunciation App** is an Angular 20 web application that helps users learn and improve their language pronunciation through AI-powered speech analysis and transcription.

**Tech Stack:**
- Frontend: Angular 20, Angular Material, RxJS, TypeScript, SCSS/HTML
- Build: Angular CLI with development proxy
- Testing: Jasmine/Karma
- Architecture: Component-based Angular with service layer

**Backend Dependency:**
- Spring Boot microservice (pronunciation-service) running on `http://localhost:8080`
- API contracts defined in README.md

---

## Core Use Cases

### 1. **Pronunciation Analysis & Scoring**
Users record or upload audio files to receive detailed pronunciation feedback:
- **Input:** Audio file (mic recording or file upload) + reference text + language code
- **Output:** Detailed pronunciation analysis including:
  - Overall pronunciation score (0-100)
  - Word-Error-Rate (WER) with substitutions, insertions, deletions
  - Transcript text
  - Per-word metrics: error type (MATCH/SUBSTITUTION/INSERTION/DELETION), accuracy %, duration, phonemes
  - Pause detection with timestamps and durations
- **API:** `POST /api/pronunciation/analyze-detailed`

### 2. **Audio/Video Transcription**
Users upload or stream audio/video to get transcribed text with temporal segments:
- **Input:** Audio/video file or browser microphone stream + language code
- **Output:** Full transcript + optional segment data (text, startMs, endMs)
- **Methods:**
  - File upload transcription: `POST /api/transcription/transcribe`
  - Browser live transcription: Web Speech API (if supported)
- **API:** `GET /api/transcription/languages` (returns available languages)

### 3. **Transcript Interaction**
Users interact with transcripts through playback, highlighting, and navigation:
- Segment-based navigation (click segment → play audio at that timestamp)
- Text highlighting synchronized with audio playback
- Language switching

---

## Application Architecture

### High-Level Structure

```
src/
├── app/
│   ├── components/           # Reusable UI components
│   ├── services/             # API clients, audio handling, transcription
│   ├── models/               # TypeScript interfaces (API DTOs)
│   ├── app.component.*       # Root component
│   └── app.config.ts         # App configuration & providers
├── assets/                   # Static files, icons
└── environments/             # Environment-specific config
```

### Key Services

**AudioService:** Audio recording/playback, format handling, audio state management
**PronunciationService:** API calls to pronunciation analysis endpoint
**TranscriptionService:** API calls to transcription endpoint, language management
**WebSpeechService:** Browser Web Speech API integration for live transcription

### Key Components

**Pronunciation Scorer:** Main analysis workflow (upload/record → analyze → display results)
**Transcriber:** Transcription interface (upload/stream → transcribe → display + segments)
**Result Display:** Renders pronunciation scores, word-level errors, phoneme data, pauses
**Transcript Viewer:** Displays segments with timestamps, click-to-play navigation

### Data Models

**DetailedAnalysisDto:** {score, wer, substitutions, insertions, deletions, transcript, words[], pauses[]}
- words[]: {text, errorType, accuracy, startMs, endMs, phonemes[]}
- pauses[]: {startMs, endMs, durationMs}

**TranscriptionResult:** {transcript, segments[]}
- segments[]: {text, startMs, endMs}

**LanguageDto:** {code, name} (e.g., "en-US", "English")

---

## Common Development Tasks

### Adding Features
- **New Analysis Metrics:** Extend `DetailedAnalysisDto` model, update result components
- **New Languages:** Update backend supported languages, UI language selector
- **UI Enhancements:** Modify components in `src/app/components/`, use Angular Material for consistency
- **Audio Format Support:** Update `AudioService` to handle new MIME types

### Bug Fixes & Improvements
- **Error Handling:** Network errors (400, 413, 500) handled in services with user-facing messages
- **Performance:** Optimize RxJS subscriptions, lazy load transcript segments
- **Accessibility:** Ensure keyboard navigation, ARIA labels on Material components
- **Mobile Responsiveness:** Test on mobile breakpoints, use Angular CDK responsive utilities

### Testing
- Unit tests: `src/**/*.spec.ts` using Jasmine
- Run tests: `npm run test`
- Coverage: Karma reports in `./coverage/`

---

## API Integration Patterns

### Pronunciation Analysis Flow
```
User Input (Audio File + Reference Text)
↓
PronunciationService.analyzeDetailed(file, referenceText, languageCode)
↓
POST /api/pronunciation/analyze-detailed?referenceText=...&languageCode=...
↓
Backend: Whisper transcription + pronunciation scoring
↓
Response: DetailedAnalysisDto
↓
Component renders results (score, word-level breakdown, pauses)
```

### Transcription Flow
```
User Input (Audio/Video File or Browser Microphone)
↓
TranscriptionService.transcribe(file, languageCode) OR WebSpeechService.startLive()
↓
POST /api/transcription/transcribe?languageCode=...
↓
Backend: Whisper transcription with segment timestamps
↓
Response: {transcript, segments[]}
↓
Component renders transcript + segment buttons for time-based navigation
```

---

## Development Workflow

### Feature Implementation Order — Backend First

**Always implement backend before frontend.** The frontend depends entirely on real API contracts (response shapes, error codes, field names). Building frontend against assumed contracts almost always causes rework when the real backend differs.

Recommended order for any new feature:
1. Define the API contract (endpoint, request/response shape, error codes)
2. Implement and test the backend endpoint
3. Implement the Angular frontend against the real API

**If backend is not yet available** (e.g. blocked or in progress), use Angular mock services to stub the contract explicitly — never hardcode assumptions in the real service files. Create a `*.mock.service.ts` alongside the real service and swap it via Angular's DI in `app.config.ts` during development. Remove the mock once the real backend is ready.

### Setup
```bash
# 1. Start backend (pronunciation-service on port 8080)
# 2. Install dependencies
npm install

# 3. Dev server with proxy
npm run start:proxy  # Proxies /api/* requests to http://localhost:8080

# 4. Build for production
npm build
```

### Proxy Configuration
- File: `proxy.conf.json`
- Maps `/api/*` → `http://localhost:8080/api/*`
- Enables CORS-free development

### Environment Config
- Development: `src/environments/environment.ts`
- Production: `src/environments/environment.prod.ts`
- Update API base URL if backend location changes

---

## Key Constraints & Considerations

### File Upload Limits
- Max file size: 413 error from backend if exceeded
- Supported formats: MP3, WAV, OGG, M4A, WebM (backend-dependent)

### Language Support
- Fetch available languages: `GET /api/transcription/languages`
- Default language: `en-US`
- Users can select language per request

### Browser Compatibility
- Web Speech API (live transcription): Limited browser support
  - Chrome/Edge: Full support
  - Firefox/Safari: Limited/no support
  - Fallback to file upload on unsupported browsers

### Performance Notes
- Large audio files may take time to process (depends on backend)
- Show loading states during analysis
- Consider streaming for very long audio files (future enhancement)

### Error Scenarios Handled
- Missing/invalid audio file → 400 error, user message
- Unsupported media type → 400 error, prompt valid formats
- File too large → 413 error, suggest compression
- Backend failure → 500 error, retry/contact support message

---

## Roadmap

### Priority Features
- Real-time feedback during recording
- Phoneme-level visualization
- Stress/intonation analysis
- Spaced repetition scheduling

### Low Priority
- Batch analysis, result export, history tracking, comparison view
- Offline mode, mobile app, social features, LMS integration

---

## Notes for AI Agents

When working with this project:

1. **Backend first.** Never implement frontend for an endpoint that doesn't exist yet. If the backend is missing, create a mock service (`*.mock.service.ts`) and make the contract explicit — do not assume shapes.
2. **Always verify API contracts** before implementation (see README.md)
3. **Maintain backward compatibility** with existing result models
4. **Update error handling** if new error codes are introduced
5. **Test with multiple file formats** and sizes
6. **Consider accessibility** (WCAG 2.1 AA) in UI changes
7. **Use Angular Material** for consistent styling and components
8. **Document new services** with JSDoc comments and usage examples
9. **Mock backend responses** in tests using `HttpTestingController`
10. **Handle network failures gracefully** (retry logic, offline detection)
11. **Keep UI responsive** (debounce user input, show loading states)
