import { Injectable, signal, computed, inject } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PronunciationService } from '../../../core/services';
import { DetailedAnalysisDto, ProsodyScoreDto } from '../../../core/models';

/**
 * State interface for pronunciation analysis
 */
interface PronunciationState {
  detailedAnalysis: DetailedAnalysisDto | null;
  prosodyScore: ProsodyScoreDto | null;
  loading: boolean;
  error: string | null;
}

/**
 * Pronunciation Store
 * Centralized state management for pronunciation analysis feature
 */
@Injectable({
  providedIn: 'root'
})
export class PronunciationStore {
  private readonly pronunciationService = inject(PronunciationService);
  
  // Private state signal
  private state = signal<PronunciationState>({
    detailedAnalysis: null,
    prosodyScore: null,
    loading: false,
    error: null
  });

  // Public selectors (computed signals)
  readonly detailedAnalysis = computed(() => this.state().detailedAnalysis);
  readonly prosodyScore = computed(() => this.state().prosodyScore);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);
  readonly hasAnalysis = computed(() => this.state().detailedAnalysis !== null);
  readonly hasError = computed(() => this.state().error !== null);

  /**
   * Analyze pronunciation with both detailed and prosody analysis
   */
  analyze(audio: File, referenceText: string, languageCode: string): void {
    // Set loading state
    this.state.update(s => ({ ...s, loading: true, error: null }));

    const detailed$ = this.pronunciationService.analyzeDetailed(audio, referenceText, languageCode);
    const prosody$ = this.pronunciationService.evaluateProsody(audio, referenceText, languageCode)
      .pipe(catchError(err => {
        console.warn('Prosody evaluation failed', err);
        return of(null);
      }));

    forkJoin({ detailed: detailed$, prosody: prosody$ }).subscribe({
      next: ({ detailed, prosody }) => {
        this.state.update(s => ({
          ...s,
          detailedAnalysis: detailed,
          prosodyScore: prosody,
          loading: false,
          error: null
        }));
      },
      error: (error) => {
        const errorMessage = error?.message || 'Error analyzing pronunciation. Please try again.';
        this.state.update(s => ({
          ...s,
          loading: false,
          error: errorMessage
        }));
      }
    });
  }

  /**
   * Reset the state
   */
  reset(): void {
    this.state.set({
      detailedAnalysis: null,
      prosodyScore: null,
      loading: false,
      error: null
    });
  }

  /**
   * Clear error
   */
  clearError(): void {
    this.state.update(s => ({ ...s, error: null }));
  }
}
