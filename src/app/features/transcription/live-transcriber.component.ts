import {Component, OnDestroy, signal, computed, effect, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PronunciationService } from '../../core/services';
import { TranscriptionResponse } from '../../core/api';

interface TranscriptSegment { text: string; at: number; }

@Component({
  selector: 'app-live-transcriber',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressBarModule,
    MatTooltipModule,
  ],
  templateUrl: './live-transcriber.component.html',
  styleUrl: './live-transcriber.component.scss'
})
export class LiveTranscriberComponent implements OnDestroy {
  private readonly svc = inject(PronunciationService);

  languageCode = signal<string>('en-US');
  isSupported = signal<boolean>(false);
  isListening = signal<boolean>(false);
  interim = signal<string>('');
  segments = signal<TranscriptSegment[]>([]);
  errorMessage = signal<string | null>(null);
  isTranscribing = signal<boolean>(false);
  languages = this.svc.getLanguagesSignal();
  private recognition: any | null = null;
  private startedAt = 0;

  fullTranscript = computed(() => {
    const text = this.segments().map(s => s.text).join(' ');
    const interim = this.interim();
    return interim ? text + ' ' + interim : text;
  });

  constructor() {
    const w = window as any;
    const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.isSupported.set(true);
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;

      effect(() => {
        if (this.recognition) {
          this.recognition.lang = this.languageCode();
        }
      });

      this.recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          const text = res[0].transcript.trim();
          if (res.isFinal) {
            this.segments.update(list => [...list, { text, at: Date.now() - this.startedAt }]);
          } else {
            interim += text + ' ';
          }
        }
        this.interim.set(interim.trim());
      };

      this.recognition.onerror = (e: any) => {
        this.errorMessage.set(e?.error || 'Speech recognition error');
        this.isListening.set(false);
      };

      this.recognition.onend = () => {
        if (this.isListening()) {
          // auto-restart for resilience
          try { this.recognition.start(); } catch {}
        }
      };
    } else {
      this.isSupported.set(false);
    }
  }

  ngOnDestroy(): void {
    this.stop();
  }

  start() {
    if (!this.recognition) return;
    this.errorMessage.set(null);
    this.segments.set([]);
    this.interim.set('');
    this.startedAt = Date.now();
    this.recognition.lang = this.languageCode();
    try {
      this.recognition.start();
      this.isListening.set(true);
    } catch (e) {
      this.errorMessage.set('Could not start recognition.');
    }
  }

  stop() {
    if (!this.recognition) return;
    try { this.recognition.stop(); } catch {}
    this.isListening.set(false);
  }

  clear() {
    this.segments.set([]);
    this.interim.set('');
  }

  speak(text: string) {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = this.languageCode();
    window.speechSynthesis.speak(u);
  }

  copy() {
    navigator.clipboard?.writeText(this.fullTranscript());
  }

  formatMs(ms: number | string): string {
    const n = Number(ms);
    if (!isFinite(n) || n < 0) return '0:00';
    // support seconds inputs by converting values < 1000 (and >0) to ms
    const msVal = n > 0 && n < 1000 ? n * 1000 : n;
    const totalSec = Math.floor(msVal / 1000);
    const minutes = Math.floor(totalSec / 60);
    const seconds = totalSec % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      this.errorMessage.set(null);
      this.isTranscribing.set(true);
      this.svc.transcribeAudio(file, this.languageCode()).subscribe({
        next: (res: TranscriptionResponse) => {
          const segs = (res.segments && res.segments.length)
            ? res.segments.map(s => ({ text: s.text, at: s.startMs }))
            : (res.transcript ? [{ text: res.transcript, at: 0 }] : []);
          this.segments.set(segs);
          this.interim.set('');
          this.isTranscribing.set(false);
        },
        error: (err) => {
          console.error(err);
          const status = err?.status;
          if (status === 400) this.errorMessage.set('Invalid or unsupported media. Please upload a valid audio/video file.');
          else if (status === 413) this.errorMessage.set('File too large. Please upload a smaller file.');
          else this.errorMessage.set('Transcription failed. Please try again.');
          this.isTranscribing.set(false);
        }
      });
    }
  }
}
