import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PronunciationService } from './pronunciation.service';
import { PronunciationEvaluationResult, PronunciationScore } from '../models/pronunciation.model';

describe('PronunciationService', () => {
  let service: PronunciationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PronunciationService],
    });
    service = TestBed.inject(PronunciationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should send audio and reference text for scoring and return PronunciationScore', () => {
    const mockResponse: PronunciationScore = {
      score: 0.85,
      transcribedText: 'hello world',
      wordDetails: [
        { word: 'hello', confidence: 0.9, isCorrect: true, expectedWord: null },
        { word: 'world', confidence: 0.8, isCorrect: true, expectedWord: null },
      ],
    };

    const audioFile = new File(['audio'], 'audio.wav', { type: 'audio/wav' });
    const referenceText = 'hello world';
    const languageCode = 'en-US';

    service.scorePronunciation(audioFile, referenceText, languageCode).subscribe((result) => {
      expect(result).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('/api/pronunciation/score');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.has('audio')).toBeTrue();
    expect(req.request.body.has('referenceText')).toBeTrue();
    expect(req.request.body.has('languageCode')).toBeTrue();
    req.flush(mockResponse);
  });

  it('should send audio and reference text for alignment scoring and return PronunciationEvaluationResult', () => {
    const mockResponse: PronunciationEvaluationResult = {
      transcript: 'hello world',
      words: [
        {
          word: 'hello',
          startTime: 0.0,
          endTime: 0.5,
          evaluation: 0.85,
          phonemes: [
            { phoneme: 'HH', startTime: 0.0, endTime: 0.1, evaluation: 0.9 },
          ],
        },
      ],
    };

    const audioFile = new File(['audio'], 'audio.wav', { type: 'audio/wav' });
    const referenceText = 'hello world';

    service.scorePronunciationWithAlignment(audioFile, referenceText).subscribe((result) => {
      expect(result).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('/api/pronunciation/evaluate-align');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.has('audio')).toBeTrue();
    expect(req.request.body.has('referenceText')).toBeTrue();
    req.flush(mockResponse);
  });

  it('should handle error response for scorePronunciation', () => {
    const audioFile = new File(['audio'], 'audio.wav', { type: 'audio/wav' });
    const referenceText = 'hello world';
    const languageCode = 'en-US';

    service.scorePronunciation(audioFile, referenceText, languageCode).subscribe({
      next: () => fail('Expected error, but got success response'),
      error: (error) => {
        expect(error.status).toBe(500);
      },
    });

    const req = httpMock.expectOne('/api/pronunciation/score');
    req.flush('Internal Server Error', { status: 500, statusText: 'Server Error' });
  });

  it('should handle error response for scorePronunciationWithAlignment', () => {
    const audioFile = new File(['audio'], 'audio.wav', { type: 'audio/wav' });
    const referenceText = 'hello world';

    service.scorePronunciationWithAlignment(audioFile, referenceText).subscribe({
      next: () => fail('Expected error, but got success response'),
      error: (error) => {
        expect(error.status).toBe(400);
      },
    });

    const req = httpMock.expectOne('/api/pronunciation/evaluate-align');
    req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
  });
});
