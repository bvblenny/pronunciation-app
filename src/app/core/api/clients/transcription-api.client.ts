import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiConfigService } from '../api-config.service';
import { TranscriptionResponse, TranscriptionLanguage } from '../../services/pronunciation.service';

/**
 * API client for transcription endpoints
 * Handles all HTTP communication for transcription features
 * Centralizes error handling and request formatting
 */
@Injectable({
  providedIn: 'root'
})
export class TranscriptionApiClient {
  constructor(
    private http: HttpClient,
    private config: ApiConfigService
  ) {}

  /**
   * Transcribe audio or video file
   */
  transcribeAudio(
    file: File,
    languageCode: string = 'en-US'
  ): Observable<TranscriptionResponse> {
    const endpoint = this.config.getEndpoint('transcription.transcribe');
    const formData = new FormData();
    formData.append('file', file);
    
    const params = new URLSearchParams({ languageCode });
    
    return this.http.post<TranscriptionResponse>(`${endpoint}?${params.toString()}`, formData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get available transcription languages
   */
  getLanguages(): Observable<TranscriptionLanguage[]> {
    const endpoint = this.config.getEndpoint('transcription.languages');
    
    return this.http.get<TranscriptionLanguage[]>(endpoint)
      .pipe(catchError(this.handleError));
  }

  /**
   * Centralized error handling
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred while processing your request.';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = 'Invalid request. Please check your input.';
          break;
        case 413:
          errorMessage = 'File is too large. Please try a smaller file.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
