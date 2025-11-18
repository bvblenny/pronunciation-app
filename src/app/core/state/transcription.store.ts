import { Injectable, signal, computed, inject } from '@angular/core';
import { PronunciationService } from '../services';
import { TranscriptSegment } from '../models';
import {TranscriptionResponse} from '../api';

/**
 * File Transcription State
 */
interface FileTranscriptionState {
  isTranscribing: boolean;
  error: string | null;
}

/**
 * Transcription Store
 * Centralized state management for file-based transcription
 */
@Injectable({
  providedIn: 'root'
})
export class TranscriptionStore {
  private readonly pronunciationService = inject(PronunciationService);

  // Private state signal
  private state = signal<FileTranscriptionState>({
    isTranscribing: false,
    error: null
  });

  // Public selectors (computed signals)
  readonly isTranscribing = computed(() => this.state().isTranscribing);
  readonly error = computed(() => this.state().error);
  readonly hasError = computed(() => this.state().error !== null);

  /**
   * Transcribe an audio/video file
   * @param file Audio or video file
   * @param languageCode Language code (e.g., 'en-US')
   * @param onSuccess Callback with transcription segments
   */
  transcribeFile(
    file: File,
    languageCode: string,
    onSuccess: (segments: TranscriptSegment[]) => void
  ): void {
    // Set loading state
    this.state.update(s => ({ ...s, isTranscribing: true, error: null }));

    this.pronunciationService.transcribeAudio(file, languageCode).subscribe({
      next: (res: TranscriptionResponse) => {
        const segments = this.mapResponseToSegments(res);
        this.state.update(s => ({ ...s, isTranscribing: false, error: null }));
        onSuccess(segments);
      },
      error: (err) => {
        console.error('Transcription error:', err);
        const errorMessage = this.getErrorMessage(err);
        this.state.update(s => ({ ...s, isTranscribing: false, error: errorMessage }));
      }
    });
  }

  /**
   * Map API response to transcript segments
   */
  private mapResponseToSegments(res: TranscriptionResponse): TranscriptSegment[] {
    if (res.segments && res.segments.length) {
      return res.segments.map(s => ({ text: s.text, at: s.startMs }));
    } else if (res.transcript) {
      return [{ text: res.transcript, at: 0 }];
    }
    return [];
  }

  /**
   * Get user-friendly error message based on error status
   */
  private getErrorMessage(err: any): string {
    const status = err?.status;
    if (status === 400) {
      return 'Invalid or unsupported media. Please upload a valid audio/video file.';
    } else if (status === 413) {
      return 'File too large. Please upload a smaller file.';
    }
    return 'Transcription failed. Please try again.';
  }

  /**
   * Clear error
   */
  clearError(): void {
    this.state.update(s => ({ ...s, error: null }));
  }

  /**
   * Reset the state
   */
  reset(): void {
    this.state.set({
      isTranscribing: false,
      error: null
    });
  }
}

