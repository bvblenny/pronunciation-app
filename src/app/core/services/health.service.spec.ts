import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;
  let httpMock: HttpTestingController;

  function setupWithInitialStatus(status: string | null, httpError = false): void {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HealthService],
    });
    service = TestBed.inject(HealthService);
    httpMock = TestBed.inject(HttpTestingController);

    if (status !== null) {
      const req = httpMock.expectOne('/api/health');
      if (httpError) {
        req.flush('Service unavailable', { status: 503, statusText: 'Service Unavailable' });
      } else {
        req.flush({ status, service: 'pronunciation-analysis' });
      }
    }
  }

  afterEach(() => {
    httpMock?.verify();
  });

  it('should have null as initial state before first check completes', () => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HealthService],
    });
    service = TestBed.inject(HealthService);
    httpMock = TestBed.inject(HttpTestingController);

    // Signal starts as null before the first request is resolved
    expect(service.backendAvailable()).toBeNull();

    // Clean up pending request
    const req = httpMock.expectOne('/api/health');
    req.flush({ status: 'ok', service: 'pronunciation-analysis' });
  });

  it('should set backendAvailable to true when health check returns ok', () => {
    setupWithInitialStatus('ok');
    expect(service.backendAvailable()).toBeTrue();
  });

  it('should set backendAvailable to false when health check returns non-ok status', () => {
    setupWithInitialStatus('error');
    expect(service.backendAvailable()).toBeFalse();
  });

  it('should set backendAvailable to false when health check request fails', () => {
    setupWithInitialStatus('any', true);
    expect(service.backendAvailable()).toBeFalse();
  });
});
