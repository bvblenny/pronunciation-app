import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TranscriptionApiClient } from './transcription-api.client';
import { ApiConfigService } from '../api-config.service';

describe('TranscriptionApiClient', () => {
  let client: TranscriptionApiClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TranscriptionApiClient, ApiConfigService],
    });
    client = TestBed.inject(TranscriptionApiClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(client).toBeTruthy();
  });

  it('should call transcribeAudio endpoint with query params', (done) => {
    const file = new File(['audio'], 'audio.wav', { type: 'audio/wav' });
    const languageCode = 'en-US';

    client.transcribeAudio(file, languageCode).subscribe({
      next: (result) => {
        expect(result.transcript).toBe('hello world');
        done();
      },
    });

    const req = httpMock.expectOne((request) =>
      request.url.startsWith('/api/transcription/transcribe')
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body.has('file')).toBeTrue();
    req.flush({ transcript: 'hello world', segments: [] });
  });

  it('should call getLanguages endpoint', (done) => {
    client.getLanguages().subscribe({
      next: (languages) => {
        expect(languages.length).toBe(2);
        expect(languages[0].code).toBe('en-US');
        done();
      },
    });

    const req = httpMock.expectOne('/api/transcription/languages');
    expect(req.request.method).toBe('GET');
    req.flush([
      { code: 'en-US', name: 'English (US)' },
      { code: 'es-ES', name: 'Spanish' },
    ]);
  });

  it('should handle errors', (done) => {
    const file = new File(['audio'], 'audio.wav', { type: 'audio/wav' });
    
    client.transcribeAudio(file).subscribe({
      next: () => fail('Expected error'),
      error: (error) => {
        expect(error.message).toContain('Server error');
        done();
      },
    });

    const req = httpMock.expectOne((request) =>
      request.url.startsWith('/api/transcription/transcribe')
    );
    req.flush('Server Error', { status: 500, statusText: 'Server Error' });
  });
});
