import { Injectable, signal, inject } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import {
  PronunciationApiClient,
  DEFAULT_TRANSCRIPTION_LANGUAGES,
  TranscriptionLanguage,
  TranscriptionResponse
} from '../api';
import {
  PronunciationEvaluationResult,
  PronunciationScore,
  DetailedAnalysisDto,
  ProsodyScoreDto,
  ProsodyFeatures
} from '../models';

/**
 * Pronunciation Service
 * High-level service providing domain-focused API for pronunciation features
 */
@Injectable({
  providedIn: 'root'
})
export class PronunciationService {
  private readonly apiClient = inject(PronunciationApiClient);
  
  // Cache languages as a signal
  private languagesCache = signal<TranscriptionLanguage[]>([]);

  constructor() {
    // Pre-load languages
    this.loadLanguages();
  }

  private loadLanguages(): void {
    this.apiClient.getTranscriptionLanguages()
      .pipe(
        catchError(() => of([...DEFAULT_TRANSCRIPTION_LANGUAGES]))
      )
      .subscribe(langs => {
        this.languagesCache.set(langs && langs.length ? langs : [...DEFAULT_TRANSCRIPTION_LANGUAGES]);
      });
  }

  /**
   * Get cached languages as a readonly signal
   */
  getLanguagesSignal() {
    return this.languagesCache.asReadonly();
  }

  /**
   * Sends audio file, reference text, and language code to the server for pronunciation scoring
   *
   * @param audio The audio file containing the pronunciation to score
   * @param referenceText The text that should have been pronounced
   * @param languageCode The language code (default: 'en-US')
   * @returns An Observable with the pronunciation score results
   */
  scorePronunciation(
    audio: File,
    referenceText: string,
    languageCode: string = 'en-US'
  ): Observable<PronunciationScore> {
    return this.apiClient.scorePronunciation({ audio, referenceText, languageCode });
  }

  /**
   * Score pronunciation with word alignment
   */
  scorePronunciationWithAlignment(
    audio: File,
    referenceText: string,
  ): Observable<PronunciationEvaluationResult> {
    return this.apiClient.evaluateWithAlignment(audio, referenceText);
  }

  /**
   * Detailed pronunciation analysis
   */
  analyzeDetailed(
    audio: File,
    referenceText: string,
    languageCode: string = 'en-US'
  ): Observable<DetailedAnalysisDto> {
    return this.apiClient.analyzeDetailed({ audio, referenceText, languageCode });
  }

  /**
   * Prosody: evaluate suprasegmental features returning scores + diagnostics
   */
  evaluateProsody(
    audio: File,
    referenceText: string = '',
    languageCode: string = 'en-US'
  ): Observable<ProsodyScoreDto> {
    return this.apiClient.evaluateProsody({ audio, referenceText, languageCode });
  }

  /**
   * Prosody: extract raw features (pitch, energy, timings)
   */
  extractProsodyFeatures(audio: File): Observable<ProsodyFeatures> {
    return this.apiClient.extractProsodyFeatures(audio);
  }

  /**
   * Transcribe an uploaded audio or video file via backend
   */
  transcribeAudio(file: File, languageCode: string = 'en-US'): Observable<TranscriptionResponse> {
    return this.apiClient.transcribeAudio({ file, languageCode });
  }

  /**
   * Fetch available transcription languages from backend
   * @deprecated Use getLanguagesSignal() instead for reactive updates
   */
  getTranscriptionLanguages(): Observable<TranscriptionLanguage[]> {
    return this.apiClient.getTranscriptionLanguages();
  }
}
