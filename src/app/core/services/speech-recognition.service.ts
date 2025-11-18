import { Injectable, signal } from '@angular/core';
import { TranscriptSegment } from '../models';

/**
 * Speech Recognition Service
 * Encapsulates browser Web Speech API for live speech-to-text
 */
@Injectable({
  providedIn: 'root'
})
export class SpeechRecognitionService {
  private recognition: any | null = null;
  private startedAt = 0;

  // State signals
  private _isSupported = signal<boolean>(false);
  private _isListening = signal<boolean>(false);
  private _segments = signal<TranscriptSegment[]>([]);
  private _interim = signal<string>('');
  private _error = signal<string | null>(null);

  // Public readonly signals
  readonly isSupported = this._isSupported.asReadonly();
  readonly isListening = this._isListening.asReadonly();
  readonly segments = this._segments.asReadonly();
  readonly interim = this._interim.asReadonly();
  readonly error = this._error.asReadonly();

  constructor() {
    this.initialize();
  }

  /**
   * Initialize the speech recognition API
   */
  private initialize(): void {
    const w = window as any;
    const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;

    if (SpeechRecognition) {
      this._isSupported.set(true);
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.setupEventHandlers();
    } else {
      this._isSupported.set(false);
    }
  }

  /**
   * Set up event handlers for speech recognition
   */
  private setupEventHandlers(): void {
    if (!this.recognition) return;

    this.recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        const text = res[0].transcript.trim();
        if (res.isFinal) {
          this._segments.update(list => [...list, { text, at: Date.now() - this.startedAt }]);
        } else {
          interim += text + ' ';
        }
      }
      this._interim.set(interim.trim());
    };

    this.recognition.onerror = (e: any) => {
      this._error.set(e?.error || 'Speech recognition error');
      this._isListening.set(false);
    };

    this.recognition.onend = () => {
      if (this._isListening()) {
        // Auto-restart for resilience
        try {
          this.recognition.start();
        } catch {}
      }
    };
  }

  /**
   * Start speech recognition
   * @param languageCode Language code (e.g., 'en-US')
   */
  start(languageCode: string = 'en-US'): void {
    if (!this.recognition) return;

    this._error.set(null);
    this._segments.set([]);
    this._interim.set('');
    this.startedAt = Date.now();
    this.recognition.lang = languageCode;

    try {
      this.recognition.start();
      this._isListening.set(true);
    } catch (e) {
      this._error.set('Could not start recognition.');
    }
  }

  /**
   * Stop speech recognition
   */
  stop(): void {
    if (!this.recognition) return;

    try {
      this.recognition.stop();
    } catch {}

    this._isListening.set(false);
  }

  /**
   * Update language for speech recognition
   * @param languageCode Language code (e.g., 'en-US')
   */
  setLanguage(languageCode: string): void {
    if (this.recognition) {
      this.recognition.lang = languageCode;
    }
  }

  /**
   * Clear all segments and interim text
   */
  clear(): void {
    this._segments.set([]);
    this._interim.set('');
  }

  /**
   * Clear error message
   */
  clearError(): void {
    this._error.set(null);
  }

  /**
   * Set segments manually (e.g., from file transcription)
   * @param segments Array of transcript segments
   */
  setSegments(segments: TranscriptSegment[]): void {
    this._segments.set(segments);
    this._interim.set('');
  }
}

