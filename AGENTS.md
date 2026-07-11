# Project Overview
Pronunciation App is an Angular 20 frontend for language learners to upload or record speech, send
it to a backend pronunciation service, and receive detailed feedback (WER, word/phoneme analysis,
prosody) plus file and live transcription flows in a Material-based UI.

## Repository Structure
- `/` — Angular app root with workspace config, scripts, and primary docs.
  - `.vscode/` — VS Code launch/tasks and recommended extensions.
  - `public/` — static assets copied at build time (for example `favicon.ico`).
  - `src/` — application source (bootstrap, core services/API/models, feature components).
- `README.md` — product/API overview and quick-start instructions.
- `angular.json` — Angular CLI build/serve/test target configuration.
- `package.json` — npm scripts and dependency manifest.
- `proxy.conf.json` — local dev proxy mapping `/api` to `http://localhost:8080`.
- `tsconfig*.json` — strict TypeScript and Angular compiler settings.
- `AGENTS.md` — repository guidance for AI coding agents.

## Build & Development Commands
```bash
# Install dependencies
npm install

# Run dev server
npm run start

# Run dev server with backend proxy (/api -> localhost:8080)
npm run start:proxy

# Run dev server on LAN with SSL cert/key paths from package.json
npm run start:lan

# Production build
npm run build

# Development watch build
npm run watch

# Unit tests (Karma/Jasmine)
npm run test
```

```bash
# Lint
> TODO: No lint script is defined in package.json.

# Explicit type-check
> TODO: No dedicated type-check script is defined (type-checking occurs during Angular build).

# Debug
# Option 1: run and debug in browser with source maps
npm run start
# Option 2: VS Code launch targets "ng serve" / "ng test" from .vscode/launch.json

# Deploy
> TODO: No deploy script or deployment workflow is defined in this repository.
```

## Code Style & Conventions
- Use 2-space indentation, UTF-8, final newline, and trimmed trailing whitespace
  (`/.editorconfig`).
- Use single quotes in TypeScript (`.editorconfig` `quote_type = single`).
- Angular components are standalone and colocated as `*.component.ts|html|scss`.
- Core layers are organized by concern: `core/api`, `core/services`, `core/models`,
  `core/config`, `core/interceptors`.
- Prefer typed interfaces for API DTOs in `src/app/core/models/pronunciation.model.ts`.
- State management in features uses Angular Signals (`signal`, `computed`) and store-style classes.
- Barrel exports (`index.ts`) are used for stable import surfaces.
- Commit message template:
  > TODO: No commit-message convention/template is documented in this repository.

## Architecture Notes
```mermaid
flowchart TD
  UI[Standalone Angular Components\n(pronunciation, transcribe, prosody)]
  Store[PronunciationStore\nSignals state]
  Service[PronunciationService\nDomain API]
  Client[PronunciationApiClient\nHttpClient + FormData]
  Config[ApiConfigService/API_CONFIG]
  Interceptor[errorInterceptor]
  Backend[(pronunciation-service\nhttp://localhost:8080)]
  Health[HealthService\n/api/health polling]

  UI --> Store
  UI --> Service
  Store --> Service
  Service --> Client
  Client --> Config
  Client --> Interceptor
  Client --> Backend
  Health --> Backend
  Health --> UI
```

The app boots from `src/main.ts` into a standalone root component and routes users to
pronunciation analysis (`/`) or lazy-loaded transcription (`/transcribe`). Feature components call
`PronunciationService`, which delegates HTTP details to `PronunciationApiClient`; endpoints are
centralized in `API_CONFIG`, and `errorInterceptor` maps transport/backend errors to user-facing
messages. Pronunciation analysis state is coordinated through `PronunciationStore`, while
`HealthService` continuously polls backend availability for UI status signaling.

## Feature Enhancement Protocol
When tasked with enhancing an existing feature or building a new one, you are responsible for autonomously identifying and defining the requirements before writing any code. Follow this strict process:

1. **Autonomous Requirement Discovery**:
   - **Codebase Scanning**: Analyze the relevant standalone components, services, `PronunciationStore` (Signals), and routes to understand the current technical implementation.
   - **Dependency & State Mapping**: Map out how data flows through `PronunciationService` and `PronunciationApiClient`. Identify any API endpoints in `API_CONFIG` that are affected or need to be added.
   - **Specification Drafting**: Generate a concise list of functional and non-functional requirements based on your discovery. Explicitly think about edge cases (e.g., audio upload failures, slow backend polling, or missing transcription languages).

2. **User Approval Gate (STOP & ASK)**:
   - Present your discovered requirements and a brief technical implementation plan to the user *before* writing or modifying any implementation code.
   - **Do not proceed** to step 3 until the user explicitly approves or modifies your specification.

3. **Implementation Plan**:
   - Once approved, create a step-by-step checklist of the files you intend to create or modify.
   - Ensure the plan aligns with the Angular 20 standalone architecture, maintains strict typing, and properly updates the Signal-based reactive state.

4. **Drafting & Coding**:
   - Write clean, strictly typed TypeScript code (avoid `any`).
   - Adhere to the project design patterns (Material-based UI, standalone components, 2-space indentation, single quotes).
   - Keep your changes minimal and scoped tightly to the approved requirements. Do not refactor unrelated files or barrel exports.

5. **Testing & Self-Correction**:
   - Run the unit tests via `npm run test` (Karma/Jasmine).
   - If unit tests fail, analyze the error logs, form a hypothesis, and attempt to resolve the issue autonomously before reporting back or asking for help.

6. **Delivery Review**:
   - Summarize the changes made, map them back to the approved requirements list, and verify that all unit tests pass successfully.

## Testing Strategy
1. **Unit tests:** Jasmine + Karma via Angular test builder (`ng test` through `npm run test`).
2. **HTTP-focused service tests:** use `HttpClientTestingModule` and `HttpTestingController`
   (see `src/app/core/services/*.spec.ts`).
3. **Component tests:** run via Angular TestBed (for example `src/app/app.spec.ts`).
4. **Integration tests:**
   > TODO: No separate integration-test suite is configured.
5. **E2E tests:**
   > TODO: No e2e framework/configuration is present.
6. **CI execution:**
   > TODO: No CI workflow files are present in this repository snapshot.

## Security & Compliance
- Keep local-only certs and proxy overrides out of version control (`certs/`, `proxy.conf.json`
  ignored in `.gitignore`).
- Route backend calls through the local proxy in development to avoid ad-hoc CORS workarounds.
- Centralize API paths in `API_CONFIG` to reduce endpoint sprawl and review surface.
- Error handling is centralized in `errorInterceptor` to avoid leaking raw backend details into UI.
- Dependency scanning / SCA:
  > TODO: No repository-level dependency scanning workflow is defined here.
- License:
  > TODO: No `LICENSE` file is present in this repository snapshot.

## Agent Guardrails
1. Treat backend API contracts in `README.md` as source of truth; do not invent response shapes.
2. Follow backend-first workflow already documented in repository guidance.
3. Avoid committing local secrets/certs/proxy overrides (see `.gitignore`).
4. Prefer minimal, scoped changes in the relevant feature/core module.
5. Preserve standalone-component structure and existing barrel exports.
6. Root `AGENTS.md` exists; no nested `AGENTS.md` overrides were found.
7. Required review boundaries:
   > TODO: No CODEOWNERS or formal required-review policy is defined in this snapshot.
8. Rate limits / automation quotas:
   > TODO: No explicit agent/API rate-limit policy is documented in this repository.

## Extensibility Hooks
- `src/app/core/config/api.config.ts`: add/adjust backend endpoints in one place.
- `ApiConfigService.getEndpoint(category, action)`: extension point for endpoint resolution logic.
- `src/app/app.routes.ts`: add new routes; supports lazy-loaded feature components.
- `PronunciationService`: domain façade to add new pronunciation/transcription use cases.
- `PronunciationStore`: feature state orchestration extension point for combined analyses.
- Language options are backend-driven via `/api/transcription/languages` with local fallback defaults.
- Environment variables / feature flags:
  > TODO: No explicit env-var or feature-flag system is currently defined.

## Further Reading
- `./README.md`
- `./angular.json`
- `./package.json`
- `./src/app/app.routes.ts`
- `./src/app/core/config/api.config.ts`
- `./src/app/core/api/pronunciation-api.client.ts`
- `./src/app/features/pronunciation/state/pronunciation.store.ts`
