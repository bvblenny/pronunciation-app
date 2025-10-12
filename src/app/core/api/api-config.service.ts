import { Injectable } from '@angular/core';

/**
 * Centralized API configuration service
 * Provides a single source of truth for API endpoints and configuration
 */
@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  private readonly apiVersion = 'v1';
  
  private readonly endpoints = {
    // Pronunciation endpoints
    'pronunciation.score': `/api/pronunciation/score`,
    'pronunciation.evaluateAlign': `/api/pronunciation/evaluate-align`,
    'pronunciation.analyzeDetailed': `/api/pronunciation/analyze-detailed`,
    
    // Transcription endpoints
    'transcription.transcribe': `/api/transcription/transcribe`,
    'transcription.languages': `/api/transcription/languages`,
  } as const;
  
  /**
   * Get an API endpoint by key
   * @param key The endpoint key (e.g., 'pronunciation.score')
   * @returns The full endpoint path
   */
  getEndpoint(key: keyof typeof this.endpoints): string {
    return this.endpoints[key];
  }
  
  /**
   * Get the current API version
   * @returns The API version string
   */
  getApiVersion(): string {
    return this.apiVersion;
  }
}
