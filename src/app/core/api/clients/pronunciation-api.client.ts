import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiConfigService } from '../api-config.service';
import {
  PronunciationScore,
  PronunciationEvaluationResult,
  DetailedAnalysisDto
} from '../../models/pronunciation.model';

/**
 * API client for pronunciation endpoints
 * Handles all HTTP communication for pronunciation features
 * Centralizes error handling and FormData creation
 */
@Injectable({
  providedIn: 'root'
})
export class PronunciationApiClient {
  constructor(
    private http: HttpClient,
    private config: ApiConfigService
  ) {}

  /**
   * Score pronunciation with basic analysis
   */
  scorePronunciation(
    audio: File,
    referenceText: string,
    languageCode: string = 'en-US'
  ): Observable<PronunciationScore> {
    const endpoint = this.config.getEndpoint('pronunciation.score');
    const formData = this.createFormData({
      audio,
      referenceText,
      languageCode
    });
    
    return this.http.post<PronunciationScore>(endpoint, formData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Score pronunciation with word alignment
   */
  scorePronunciationWithAlignment(
    audio: File,
    referenceText: string
  ): Observable<PronunciationEvaluationResult> {
    const endpoint = this.config.getEndpoint('pronunciation.evaluateAlign');
    const formData = this.createFormData({
      audio,
      referenceText
    });
    
    return this.http.post<PronunciationEvaluationResult>(endpoint, formData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Analyze pronunciation with detailed metrics
   */
  analyzeDetailed(
    audio: File,
    referenceText: string,
    languageCode: string = 'en-US'
  ): Observable<DetailedAnalysisDto> {
    const endpoint = this.config.getEndpoint('pronunciation.analyzeDetailed');
    const formData = this.createFormData({ audio });
    const params = new URLSearchParams({ referenceText, languageCode });
    
    return this.http.post<DetailedAnalysisDto>(`${endpoint}?${params.toString()}`, formData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Centralized FormData creation
   */
  private createFormData(data: Record<string, any>): FormData {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    
    return formData;
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
