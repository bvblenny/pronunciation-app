import { TestBed } from '@angular/core/testing';
import { ApiConfigService } from './api-config.service';

describe('ApiConfigService', () => {
  let service: ApiConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ApiConfigService]
    });
    service = TestBed.inject(ApiConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return correct pronunciation endpoints', () => {
    expect(service.getEndpoint('pronunciation.score')).toBe('/api/pronunciation/score');
    expect(service.getEndpoint('pronunciation.evaluateAlign')).toBe('/api/pronunciation/evaluate-align');
    expect(service.getEndpoint('pronunciation.analyzeDetailed')).toBe('/api/pronunciation/analyze-detailed');
  });

  it('should return correct transcription endpoints', () => {
    expect(service.getEndpoint('transcription.transcribe')).toBe('/api/transcription/transcribe');
    expect(service.getEndpoint('transcription.languages')).toBe('/api/transcription/languages');
  });

  it('should return API version', () => {
    expect(service.getApiVersion()).toBe('v1');
  });
});
