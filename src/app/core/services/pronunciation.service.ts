import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {PronunciationEvaluationResult, PronunciationScore} from '../models/pronunciation.model';

@Injectable({
  providedIn: 'root'
})
export class PronunciationService {
  private apiUrl = 'http://localhost:8080'; // Adjust this to match your Spring Boot server URL

  constructor(private http: HttpClient) { }

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

    return this.http.post<PronunciationScore>(`${this.apiUrl}/api/pronunciation/evaluate-align`, formData);
  }

  scorePronunciationWithAlignment(
    audio: File,
    referenceText: string,
  ): Observable<PronunciationEvaluationResult> {
    const formData = new FormData();
    formData.append('audio', audio);
    formData.append('referenceText', referenceText);

    return this.http.post<PronunciationEvaluationResult>(`${this.apiUrl}/api/pronunciation/evaluate-align`, formData);
  }
}
