import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {PronunciationEvaluationResult, PronunciationScore, DetailedAnalysisDto, ProsodyScoreDto, ProsodyFeatures} from '../models/pronunciation.model';

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

@Injectable({
  providedIn: 'root'
})
export class PronunciationService {
  // Cache languages as a signal
  private languagesCache = signal<TranscriptionLanguage[]>([]);

  constructor(private http: HttpClient) {
    // Pre-load languages
    this.loadLanguages();
  }

  private loadLanguages(): void {
    this.http.get<TranscriptionLanguage[]>(`/api/transcription/languages`).subscribe({
      next: (langs) => {
        this.languagesCache.set(langs && langs.length ? langs : [...DEFAULT_TRANSCRIPTION_LANGUAGES]);
      },
      error: () => {
        this.languagesCache.set([...DEFAULT_TRANSCRIPTION_LANGUAGES]);
      }
    });
  }

  /**
   * Get cached languages as a signal
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
    const formData = new FormData();
    formData.append('audio', audio);
    formData.append('referenceText', referenceText);
    formData.append('languageCode', languageCode);

    return this.http.post<PronunciationScore>(`/api/pronunciation/score`, formData);
  }

  scorePronunciationWithAlignment(
    audio: File,
    referenceText: string,
  ): Observable<PronunciationEvaluationResult> {
    const formData = new FormData();
    formData.append('audio', audio);
    formData.append('referenceText', referenceText);

    return this.http.post<PronunciationEvaluationResult>(`/api/pronunciation/evaluate-align`, formData);
  }

  /** Detailed pronunciation analysis (new endpoint) */
  analyzeDetailed(audio: File, referenceText: string, languageCode: string = 'en-US'):
    Observable<DetailedAnalysisDto> {
    const form = new FormData();
    form.append('audio', audio);
    // referenceText and languageCode are query params per OpenAPI
    const params = new URLSearchParams({ referenceText, languageCode });
    return this.http.post<DetailedAnalysisDto>(`/api/pronunciation/analyze-detailed?${params.toString()}`, form);
  }

  /** Prosody: evaluate suprasegmental features returning scores + diagnostics */
  evaluateProsody(audio: File, referenceText: string = '', languageCode: string = 'en-US'):
    Observable<ProsodyScoreDto> {
    const form = new FormData();
    form.append('audio', audio);
    const params = new URLSearchParams();
    if (referenceText != null) params.set('referenceText', referenceText);
    if (languageCode != null) params.set('languageCode', languageCode);
    return this.http.post<ProsodyScoreDto>(`/api/prosody/evaluate?${params.toString()}`, form);
  }

  /** Prosody: extract raw features (pitch, energy, timings) */
  extractProsodyFeatures(audio: File): Observable<ProsodyFeatures> {
    const form = new FormData();
    form.append('audio', audio);
    return this.http.post<ProsodyFeatures>(`/api/prosody/features`, form);
  }

  /**
   * Transcribe an uploaded audio or video file via backend.
   * Expects a JSON payload like: { transcript: string, segments?: [...] }
   */
  transcribeAudio(file: File, languageCode: string = 'en-US'): Observable<TranscriptionResponse> {
    const form = new FormData();
    form.append('file', file);
    // languageCode is a query parameter per OpenAPI; keep only in URL
    const params = new URLSearchParams({ languageCode });
    return this.http.post<TranscriptionResponse>(`/api/transcription/transcribe?${params.toString()}`, form);
  }

  /**
   * Fetch available transcription languages from backend.
   * @deprecated Use getLanguagesSignal() instead for reactive updates
   */
  getTranscriptionLanguages(): Observable<TranscriptionLanguage[]> {
    return this.http.get<TranscriptionLanguage[]>(`/api/transcription/languages`);
  }
}
