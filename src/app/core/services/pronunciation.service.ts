import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PronunciationApiClient } from '../api/clients/pronunciation-api.client';
import { TranscriptionApiClient } from '../api/clients/transcription-api.client';
import { PronunciationAdapter } from '../api/adapters/pronunciation.adapter';
import { TranscriptionAdapter } from '../api/adapters/transcription.adapter';
import {
  PronunciationScore,
  PronunciationEvaluation,
  PronunciationAnalysis
} from '../models/domain/pronunciation.domain';
import {
  TranscriptionResult,
  TranscriptionLanguage as DomainTranscriptionLanguage
} from '../models/domain/transcription.domain';

// Re-export types for backward compatibility
export interface TranscriptionLanguage { code: string; name: string }
export interface TranscriptionSegment { text: string; startMs: number; endMs: number }
export interface TranscriptionResponse { transcript: string; segments?: TranscriptionSegment[] }

export const DEFAULT_TRANSCRIPTION_LANGUAGES: ReadonlyArray<TranscriptionLanguage> = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'fr-FR', name: 'French' },
  { code: 'de-DE', name: 'German' },
] as const;

/**
 * Pronunciation Service
 * Business logic layer that uses API clients and adapters
 * Components work with domain models, not API contracts
 */
@Injectable({
  providedIn: 'root'
})
export class PronunciationService {
  constructor(
    private pronunciationApi: PronunciationApiClient,
    private transcriptionApi: TranscriptionApiClient
  ) {}

  /**
   * Score pronunciation with basic analysis
   * Returns domain model, not API response
   */
  scorePronunciation(
    audio: File,
    referenceText: string,
    languageCode: string = 'en-US'
  ): Observable<PronunciationScore> {
    return this.pronunciationApi.scorePronunciation(audio, referenceText, languageCode)
      .pipe(map(apiResponse => PronunciationAdapter.scoreToDomain(apiResponse)));
  }

  /**
   * Score pronunciation with word alignment
   * Returns domain model, not API response
   */
  scorePronunciationWithAlignment(
    audio: File,
    referenceText: string
  ): Observable<PronunciationEvaluation> {
    return this.pronunciationApi.scorePronunciationWithAlignment(audio, referenceText)
      .pipe(map(apiResponse => PronunciationAdapter.evaluationToDomain(apiResponse)));
  }

  /**
   * Detailed pronunciation analysis
   * Returns domain model, not API response
   */
  analyzeDetailed(
    audio: File,
    referenceText: string,
    languageCode: string = 'en-US'
  ): Observable<PronunciationAnalysis> {
    return this.pronunciationApi.analyzeDetailed(audio, referenceText, languageCode)
      .pipe(map(apiResponse => PronunciationAdapter.detailedAnalysisToDomain(apiResponse)));
  }

  /**
   * Transcribe audio or video file
   * Returns domain model, not API response
   */
  transcribeAudio(
    file: File,
    languageCode: string = 'en-US'
  ): Observable<TranscriptionResult> {
    return this.transcriptionApi.transcribeAudio(file, languageCode)
      .pipe(map(apiResponse => TranscriptionAdapter.resultToDomain(apiResponse)));
  }

  /**
   * Get available transcription languages
   * Returns domain models, not API responses
   */
  getTranscriptionLanguages(): Observable<TranscriptionLanguage[]> {
    return this.transcriptionApi.getLanguages()
      .pipe(map(apiLanguages => TranscriptionAdapter.languagesToDomain(apiLanguages)));
  }
}
