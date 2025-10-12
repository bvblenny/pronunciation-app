# ADR 001: API Abstraction Layer Architecture

**Date**: 2025-10-12  
**Status**: Implemented  
**Context**: Phase 1 of Architecture Improvement Plan

## Context and Problem Statement

The original architecture had tight coupling between components and API contracts, making it difficult to:
- Integrate new features without modifying existing code
- Support multiple API versions
- Change API implementations
- Test components in isolation
- Maintain consistent error handling

## Decision

Implement a three-layer architecture pattern separating API concerns from business logic:

### 1. API Configuration Layer (`ApiConfigService`)
- Centralized endpoint configuration
- Single source of truth for all API URLs
- Enables easy versioning and feature flags

### 2. API Client Layer (`*ApiClient` classes)
- Handles all HTTP communication
- Centralizes error handling
- Manages request/response formatting
- No business logic

### 3. Adapter Layer (`*Adapter` classes)
- Translates between API contracts (DTOs) and domain models
- Isolates API changes from components
- Enables multiple API versions to coexist

### 4. Domain Models
- Represent business logic view of data
- Independent of API contracts
- Used by all components

## Architecture Diagram

```
┌─────────────────┐
│   Components    │ (Use domain models only)
└────────┬────────┘
         │
┌────────▼────────┐
│    Services     │ (Business logic)
└────────┬────────┘
         │
┌────────▼────────┐
│    Adapters     │ (API DTO → Domain Model)
└────────┬────────┘
         │
┌────────▼────────┐
│  API Clients    │ (HTTP communication)
└────────┬────────┘
         │
┌────────▼────────┐
│  API Config     │ (Endpoint configuration)
└─────────────────┘
```

## Benefits

✅ **Separation of Concerns**: Each layer has a single responsibility
✅ **API Independence**: Components don't depend on API contracts
✅ **Easy Versioning**: Endpoints configured centrally, can support v1, v2, etc.
✅ **Testability**: Clear boundaries make unit testing easier
✅ **Maintainability**: Changes to API don't ripple through codebase
✅ **Flexibility**: Easy to swap implementations or add new features

## Implementation

### Files Created

```
src/app/core/
├── api/
│   ├── api-config.service.ts          # Centralized endpoint config
│   ├── adapters/
│   │   ├── pronunciation.adapter.ts   # API → Domain translation
│   │   └── transcription.adapter.ts   # API → Domain translation
│   └── clients/
│       ├── pronunciation-api.client.ts # HTTP layer
│       └── transcription-api.client.ts # HTTP layer
├── models/
│   ├── domain/
│   │   ├── pronunciation.domain.ts    # Business logic models
│   │   └── transcription.domain.ts    # Business logic models
│   └── pronunciation.model.ts         # API contract models (DTOs)
```

### Example Usage

**Before** (Tight Coupling):
```typescript
export class PronunciationService {
  scorePronunciation(audio: File, text: string): Observable<PronunciationScore> {
    const formData = new FormData();
    formData.append('audio', audio);
    formData.append('referenceText', text);
    return this.http.post<PronunciationScore>('/api/pronunciation/score', formData);
  }
}
```

**After** (Loose Coupling):
```typescript
export class PronunciationService {
  scorePronunciation(audio: File, text: string): Observable<PronunciationScore> {
    return this.apiClient.scorePronunciation(audio, text)
      .pipe(map(apiResponse => PronunciationAdapter.scoreToDomain(apiResponse)));
  }
}
```

## Consequences

### Positive
- Components are isolated from API changes
- Easy to add new API versions
- Consistent error handling across all API calls
- Clear separation makes code easier to understand and test
- Ready for future enhancements (feature flags, A/B testing)

### Negative
- More files and layers (increased initial complexity)
- Requires discipline to maintain separation
- Need to keep adapters in sync with API changes

### Neutral
- Existing tests needed updates to work with new architecture
- One-time migration effort required

## Alternatives Considered

1. **Direct HTTP in Services**: Keep existing pattern
   - Rejected: Tight coupling, hard to maintain
   
2. **Single Adapter for All APIs**: One adapter class
   - Rejected: Would become too large and hard to maintain
   
3. **Generated Client from OpenAPI**: Auto-generate all API code
   - Deferred: Good future enhancement, but requires OpenAPI spec first

## Follow-up Work

- [ ] Create OpenAPI specification (Phase 2)
- [ ] Generate TypeScript types from OpenAPI (Phase 2)
- [ ] Add API versioning to backend (Phase 1, backend side)
- [ ] Implement feature flag system (Phase 3)
- [ ] Add state management (Phase 3)

## References

- ARCHITECTURE_ANALYSIS.md - Original analysis and recommendations
- Implementation Roadmap - Phase 1: Foundation

## Test Coverage

- 25 passing tests covering new architecture
- All adapters have unit tests
- All API clients have integration tests with HttpClientTestingModule
- Service layer tests updated for new architecture
