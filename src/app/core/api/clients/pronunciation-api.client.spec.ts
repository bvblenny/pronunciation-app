import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PronunciationApiClient } from './pronunciation-api.client';
import { ApiConfigService } from '../api-config.service';

describe('PronunciationApiClient', () => {
  let client: PronunciationApiClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PronunciationApiClient, ApiConfigService],
    });
    client = TestBed.inject(PronunciationApiClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(client).toBeTruthy();
  });

  it('should call scorePronunciation endpoint with correct data', () => {
    const audioFile = new File(['audio'], 'audio.wav', { type: 'audio/wav' });
    const referenceText = 'hello world';
    const languageCode = 'en-US';

    client.scorePronunciation(audioFile, referenceText, languageCode).subscribe();

    const req = httpMock.expectOne('/api/pronunciation/score');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.has('audio')).toBeTrue();
    expect(req.request.body.has('referenceText')).toBeTrue();
    expect(req.request.body.has('languageCode')).toBeTrue();
    req.flush({ score: 0.85, transcribedText: 'hello world', wordDetails: [] });
  });

  it('should call scorePronunciationWithAlignment endpoint', () => {
    const audioFile = new File(['audio'], 'audio.wav', { type: 'audio/wav' });
    const referenceText = 'hello world';

    client.scorePronunciationWithAlignment(audioFile, referenceText).subscribe();

    const req = httpMock.expectOne('/api/pronunciation/evaluate-align');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.has('audio')).toBeTrue();
    expect(req.request.body.has('referenceText')).toBeTrue();
    req.flush({ transcript: 'hello world', words: [] });
  });

  it('should call analyzeDetailed endpoint with query params', (done) => {
    const audioFile = new File(['audio'], 'audio.wav', { type: 'audio/wav' });
    const referenceText = 'hello world';
    const languageCode = 'en-US';

    client.analyzeDetailed(audioFile, referenceText, languageCode).subscribe({
      next: (result) => {
        expect(result.referenceText).toBe(referenceText);
        done();
      },
    });

    const req = httpMock.expectOne((request) => 
      request.url.startsWith('/api/pronunciation/analyze-detailed')
    );
    expect(req.request.method).toBe('POST');
    req.flush({
      referenceText,
      transcript: referenceText,
      wer: 0,
      substitutions: 0,
      insertions: 0,
      deletions: 0,
      pauses: [],
      words: [],
    });
  });

  it('should handle 400 error', (done) => {
    const audioFile = new File(['audio'], 'audio.wav', { type: 'audio/wav' });
    
    client.scorePronunciation(audioFile, 'test').subscribe({
      next: () => fail('Expected error'),
      error: (error) => {
        expect(error.message).toContain('Invalid request');
        done();
      },
    });

    const req = httpMock.expectOne('/api/pronunciation/score');
    req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
  });

  it('should handle 413 error', (done) => {
    const audioFile = new File(['audio'], 'audio.wav', { type: 'audio/wav' });
    
    client.scorePronunciation(audioFile, 'test').subscribe({
      next: () => fail('Expected error'),
      error: (error) => {
        expect(error.message).toContain('too large');
        done();
      },
    });

    const req = httpMock.expectOne('/api/pronunciation/score');
    req.flush('Payload Too Large', { status: 413, statusText: 'Payload Too Large' });
  });

  it('should handle 500 error', (done) => {
    const audioFile = new File(['audio'], 'audio.wav', { type: 'audio/wav' });
    
    client.scorePronunciation(audioFile, 'test').subscribe({
      next: () => fail('Expected error'),
      error: (error) => {
        expect(error.message).toContain('Server error');
        done();
      },
    });

    const req = httpMock.expectOne('/api/pronunciation/score');
    req.flush('Server Error', { status: 500, statusText: 'Server Error' });
  });
});
