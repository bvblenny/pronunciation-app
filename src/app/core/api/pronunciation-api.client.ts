import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../config';
import {
  DetailedAnalysisDto,
  PronunciationScore,
  PronunciationEvaluationResult,
  ProsodyScoreDto,
  ProsodyFeatures
} from '../models';

/**
 * Request interfaces for API calls
 */
export interface AnalyzeDetailedRequest {
  audio: File;
  referenceText: string;
  languageCode?: string;
}

export interface ScorePronunciationRequest {
  audio: File;
  referenceText: string;
  languageCode?: string;
}

export interface EvaluateProsodyRequest {
  audio: File;
  referenceText?: string;
  languageCode?: string;
}

export interface TranscribeRequest {
  file: File;
  languageCode?: string;
}

/**
 * Pronunciation API Client
 * Handles all HTTP communication with the pronunciation backend
 */
@Injectable({
  providedIn: 'root'
})
export class PronunciationApiClient {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(ApiConfigService);

  /**
   * Analyze pronunciation in detail
   */
  analyzeDetailed(request: AnalyzeDetailedRequest): Observable<DetailedAnalysisDto> {
    const endpoint = this.apiConfig.getEndpoint('pronunciation', 'analyzeDetailed');
    const formData = new FormData();
    formData.append('audio', request.audio);
    
    const params = new HttpParams()
      .set('referenceText', request.referenceText)
      .set('languageCode', request.languageCode ?? 'en-US');
    
    return this.http.post<DetailedAnalysisDto>(`${endpoint}?${params.toString()}`, formData);
  }

  /**
   * Score pronunciation
   */
  scorePronunciation(request: ScorePronunciationRequest): Observable<PronunciationScore> {
    const endpoint = this.apiConfig.getEndpoint('pronunciation', 'score');
    const formData = new FormData();
    formData.append('audio', request.audio);
    formData.append('referenceText', request.referenceText);
    formData.append('languageCode', request.languageCode ?? 'en-US');
    
    return this.http.post<PronunciationScore>(endpoint, formData);
  }

  /**
   * Evaluate pronunciation with alignment
   */
  evaluateWithAlignment(audio: File, referenceText: string): Observable<PronunciationEvaluationResult> {
    const endpoint = this.apiConfig.getEndpoint('pronunciation', 'evaluateAlign');
    const formData = new FormData();
    formData.append('audio', audio);
    formData.append('referenceText', referenceText);
    
    return this.http.post<PronunciationEvaluationResult>(endpoint, formData);
  }

  /**
   * Evaluate prosody features
   */
  evaluateProsody(request: EvaluateProsodyRequest): Observable<ProsodyScoreDto> {
    const endpoint = this.apiConfig.getEndpoint('prosody', 'evaluate');
    const formData = new FormData();
    formData.append('audio', request.audio);
    
    const params = new HttpParams()
      .set('referenceText', request.referenceText ?? '')
      .set('languageCode', request.languageCode ?? 'en-US');
    
    return this.http.post<ProsodyScoreDto>(`${endpoint}?${params.toString()}`, formData);
  }

  /**
   * Extract prosody features
   */
  extractProsodyFeatures(audio: File): Observable<ProsodyFeatures> {
    const endpoint = this.apiConfig.getEndpoint('prosody', 'features');
    const formData = new FormData();
    formData.append('audio', audio);
    
    return this.http.post<ProsodyFeatures>(endpoint, formData);
  }

  /**
   * Transcribe audio file
   */
  transcribeAudio(request: TranscribeRequest): Observable<TranscriptionResponse> {
    const endpoint = this.apiConfig.getEndpoint('transcription', 'transcribe');
    const formData = new FormData();
    formData.append('audio', request.file);

    const params = new HttpParams()
      .set('languageCode', request.languageCode ?? 'en-US');
    
    return this.http.post<TranscriptionResponse>(`${endpoint}?${params.toString()}`, formData);
  }

  /**
   * Get available transcription languages
   */
  getTranscriptionLanguages(): Observable<TranscriptionLanguage[]> {
    const endpoint = this.apiConfig.getEndpoint('transcription', 'languages');
    return this.http.get<TranscriptionLanguage[]>(endpoint);
  }
}

/**
 * Transcription-related types
 */
export interface TranscriptionLanguage {
  code: string;
  name: string;
}

export interface TranscriptionSegment {
  text: string;
  startMs: number;
  endMs: number;
}

export interface TranscriptionResponse {
  transcript: string;
  segments?: TranscriptionSegment[];
}

export const DEFAULT_TRANSCRIPTION_LANGUAGES: ReadonlyArray<TranscriptionLanguage> = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'fr-FR', name: 'French' },
  { code: 'de-DE', name: 'German' },
] as const;
