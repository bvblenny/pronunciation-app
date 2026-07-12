import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { apiKeyInterceptor } from './api-key.interceptor';
import { ApiConfigService } from '../config';

describe('ApiKeyInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let apiConfigService: ApiConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiKeyInterceptor])),
        provideHttpClientTesting(),
        ApiConfigService
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    apiConfigService = TestBed.inject(ApiConfigService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add X-API-Key header to /api requests when API key is configured', () => {
    spyOn(apiConfigService, 'getApiKey').and.returnValue('test-api-key-123');

    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('X-API-Key')).toBeTrue();
    expect(req.request.headers.get('X-API-Key')).toBe('test-api-key-123');
    req.flush({});
  });

  it('should not add X-API-Key header to /api requests when API key is empty', () => {
    spyOn(apiConfigService, 'getApiKey').and.returnValue('');

    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('X-API-Key')).toBeFalse();
    req.flush({});
  });

  it('should not add X-API-Key header to non-API requests', () => {
    spyOn(apiConfigService, 'getApiKey').and.returnValue('test-api-key-123');

    httpClient.get('https://external-api.com/data').subscribe();

    const req = httpMock.expectOne('https://external-api.com/data');
    expect(req.request.headers.has('X-API-Key')).toBeFalse();
    req.flush({});
  });

  it('should add X-API-Key header to all /api endpoints', () => {
    spyOn(apiConfigService, 'getApiKey').and.returnValue('test-key');

    const endpoints = [
      '/api/pronunciation/analyze-detailed',
      '/api/transcription/transcribe',
      '/api/prosody/evaluate'
    ];

    endpoints.forEach(endpoint => {
      httpClient.post(endpoint, {}).subscribe();
      const req = httpMock.expectOne(endpoint);
      expect(req.request.headers.has('X-API-Key')).toBeTrue();
      expect(req.request.headers.get('X-API-Key')).toBe('test-key');
      req.flush({});
    });
  });

  it('should allow requests to proceed even without API key', () => {
    spyOn(apiConfigService, 'getApiKey').and.returnValue('');

    httpClient.get('/api/test').subscribe(response => {
      expect(response).toEqual({ success: true });
    });

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('X-API-Key')).toBeFalse();
    req.flush({ success: true });
  });
});
