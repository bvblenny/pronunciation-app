import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {PronunciationEvaluationResult, PronunciationScore} from '../models/pronunciation.model';

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
  constructor(private http: HttpClient) {}

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

  /**
   * Transcribe an uploaded audio or video file via backend.
   * Expects a JSON payload like: { transcript: string, segments?: [...] }
   */
  transcribeAudio(file: File, languageCode: string = 'en-US'): Observable<TranscriptionResponse> {
    const form = new FormData();
    form.append('file', file);
    form.append('languageCode', languageCode);
    return this.http.post<TranscriptionResponse>(`/api/transcription/transcribe`, form);
  }

  /**
   * Fetch available transcription languages from backend.
   */
  getTranscriptionLanguages(): Observable<TranscriptionLanguage[]> {
    return this.http.get<TranscriptionLanguage[]>(`/api/transcription/languages`);
  }
}
