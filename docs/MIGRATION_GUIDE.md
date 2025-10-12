# Migration Guide: New API Architecture

This guide helps developers understand and work with the new API abstraction architecture.

## Overview

We've implemented a layered architecture that separates API concerns from business logic. This makes the codebase more maintainable and flexible.

## Key Changes

### 1. Domain Models vs API Models

**Before**: Components used API response types directly
```typescript
import { DetailedAnalysisDto } from '../models/pronunciation.model';

// Component used API model directly
detailedAnalysis = signal<DetailedAnalysisDto | null>(null);
```

**After**: Components use domain models
```typescript
import { PronunciationAnalysis } from '../models/domain/pronunciation.domain';

// Component uses domain model
detailedAnalysis = signal<PronunciationAnalysis | null>(null);
```

**Why?**: Domain models represent your business logic and are independent of API changes. If the API changes field names or structure, only adapters need updates.

### 2. Service Layer Changes

**Before**: Services made HTTP calls directly
```typescript
scorePronunciation(audio: File, text: string): Observable<PronunciationScore> {
  const formData = new FormData();
  formData.append('audio', audio);
  formData.append('referenceText', text);
  return this.http.post<PronunciationScore>('/api/pronunciation/score', formData);
}
```

**After**: Services use API clients and adapters
```typescript
scorePronunciation(audio: File, text: string): Observable<PronunciationScore> {
  return this.apiClient.scorePronunciation(audio, text)
    .pipe(map(apiResponse => PronunciationAdapter.scoreToDomain(apiResponse)));
}
```

**Why?**: 
- HTTP logic centralized in API clients
- Error handling consistent across all endpoints
- Easy to swap implementations or add versioning

### 3. Property Name Changes

When we migrated to domain models, some property names changed for consistency:

| API Model (Old)      | Domain Model (New) |
|---------------------|-------------------|
| `totalDurationSec`  | `totalDuration`   |
| `startTimeSec`      | `startTime`       |
| `endTimeSec`        | `endTime`         |
| `durationSec`       | `duration`        |

**Migration**: Update templates and components to use new property names.

## How to Use the New Architecture

### Adding a New API Endpoint

1. **Add endpoint to ApiConfigService**
```typescript
// src/app/core/api/api-config.service.ts
private readonly endpoints = {
  'myFeature.newEndpoint': `/api/my-feature/new-endpoint`,
  // ... other endpoints
};
```

2. **Add method to appropriate API client**
```typescript
// src/app/core/api/clients/my-feature-api.client.ts
myNewMethod(param: string): Observable<ApiResponseType> {
  const endpoint = this.config.getEndpoint('myFeature.newEndpoint');
  return this.http.get<ApiResponseType>(endpoint)
    .pipe(catchError(this.handleError));
}
```

3. **Create domain model** (if needed)
```typescript
// src/app/core/models/domain/my-feature.domain.ts
export interface MyFeatureResult {
  // Domain model fields
}
```

4. **Add adapter method** (if needed)
```typescript
// src/app/core/api/adapters/my-feature.adapter.ts
static toDomain(apiResponse: ApiResponseType): MyFeatureResult {
  return {
    // Map API fields to domain fields
  };
}
```

5. **Use in service**
```typescript
// src/app/core/services/my-feature.service.ts
myMethod(param: string): Observable<MyFeatureResult> {
  return this.apiClient.myNewMethod(param)
    .pipe(map(apiResponse => MyFeatureAdapter.toDomain(apiResponse)));
}
```

### Creating a New Component

1. Import domain models, not API models:
```typescript
import { MyFeatureResult } from '../core/models/domain/my-feature.domain';
```

2. Inject the service (not API client):
```typescript
constructor(private myService: MyFeatureService) {}
```

3. Use the service methods:
```typescript
this.myService.myMethod('param').subscribe(result => {
  // result is a domain model
  this.data.set(result);
});
```

### Writing Tests

**For API Clients** (use HttpClientTestingModule):
```typescript
it('should call endpoint', () => {
  client.myMethod().subscribe();
  
  const req = httpMock.expectOne('/api/my-endpoint');
  expect(req.request.method).toBe('GET');
  req.flush(mockApiResponse);
});
```

**For Adapters** (pure functions, easy to test):
```typescript
it('should convert API to domain', () => {
  const apiResponse = { /* mock API response */ };
  const result = MyAdapter.toDomain(apiResponse);
  
  expect(result.fieldName).toBe(expectedValue);
});
```

**For Services** (mock dependencies):
```typescript
it('should return domain model', () => {
  const mockApiResponse = { /* mock */ };
  spyOn(apiClient, 'myMethod').and.returnValue(of(mockApiResponse));
  
  service.myMethod().subscribe(result => {
    // result should be domain model
    expect(result).toBeDefined();
  });
});
```

## Best Practices

### DO ✅

- Use domain models in all components and templates
- Put HTTP logic in API clients only
- Use adapters for all API → domain conversions
- Add new endpoints to ApiConfigService first
- Write tests for each layer independently

### DON'T ❌

- Import API models in components
- Make HTTP calls directly from services
- Mix API and domain model types
- Hard-code endpoint URLs
- Skip adapter layer, even if API matches domain

## Common Patterns

### Handling Errors

Errors are centralized in API clients:
```typescript
private handleError(error: HttpErrorResponse): Observable<never> {
  let errorMessage = 'An error occurred...';
  
  if (error.status === 400) {
    errorMessage = 'Invalid request...';
  } else if (error.status === 500) {
    errorMessage = 'Server error...';
  }
  
  return throwError(() => new Error(errorMessage));
}
```

Components get clean error messages:
```typescript
this.service.myMethod().subscribe({
  next: (result) => { /* success */ },
  error: (error) => {
    // error.message is user-friendly
    this.errorMessage.set(error.message);
  }
});
```

### Query Parameters

API clients handle query parameter formatting:
```typescript
transcribeAudio(file: File, languageCode: string): Observable<Response> {
  const endpoint = this.config.getEndpoint('transcription.transcribe');
  const formData = new FormData();
  formData.append('file', file);
  
  const params = new URLSearchParams({ languageCode });
  return this.http.post(`${endpoint}?${params.toString()}`, formData);
}
```

### Optional Fields

Adapters handle optional fields gracefully:
```typescript
static toDomain(api: ApiType): DomainType {
  return {
    requiredField: api.requiredField,
    optionalField: api.optionalField, // undefined if not present
    computedField: api.value ?? 0,     // provide default
  };
}
```

## Troubleshooting

### "Property does not exist" errors

**Problem**: Template references old API property names
```
Property 'totalDurationSec' does not exist on type 'PronunciationAnalysis'
```

**Solution**: Update to domain model property names
```typescript
// Before: detailedAnalysis()!.totalDurationSec
// After:  detailedAnalysis()!.totalDuration
```

### Type mismatch in tests

**Problem**: Tests expect API types but service returns domain types

**Solution**: Update test expectations to use domain models
```typescript
// Update imports
import { PronunciationScore as DomainScore } from '../models/domain/pronunciation.domain';

// Update expectations
expect(result).toEqual(domainModel); // not apiModel
```

### Can't find new files

**Problem**: IDE doesn't recognize new directories

**Solution**: Restart TypeScript server or rebuild
```bash
npm run build
```

## Questions?

Refer to:
- `ARCHITECTURE_ANALYSIS.md` - Original analysis and rationale
- `docs/adr/001-api-abstraction-layer.md` - Architecture decision record
- Source code examples in `src/app/core/api/`

## Next Steps

The current implementation is Phase 1. Future phases will add:
- API versioning (v1, v2 endpoints)
- OpenAPI contract-first development
- Feature flags and A/B testing
- State management patterns
