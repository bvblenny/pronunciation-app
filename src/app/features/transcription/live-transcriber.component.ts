import {Component, OnDestroy, signal, computed, effect, inject, viewChild, ElementRef} from '@angular/core';
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
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { PronunciationService, SubtitleService, TranscriptionResponse, SubtitleFormat, TranscriptionSegment } from '../../core';

interface TranscriptSegment {
  text: string;
  at: number;
  speaker?: string;
  isHighlighted?: boolean;
}

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
    MatMenuModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatChipsModule,
  ],
  templateUrl: './live-transcriber.component.html',
  styleUrl: './live-transcriber.component.scss'
})
export class LiveTranscriberComponent implements OnDestroy {
  private readonly svc = inject(PronunciationService);
  private readonly subtitleSvc = inject(SubtitleService);

  transcriptContainer = viewChild<ElementRef<HTMLDivElement>>('transcriptContainer');

  languageCode = signal<string>('en-US');
  isSupported = signal<boolean>(false);
  isListening = signal<boolean>(false);
  interim = signal<string>('');
  segments = signal<TranscriptSegment[]>([]);
  errorMessage = signal<string | null>(null);
  isTranscribing = signal<boolean>(false);
  isExportingSubtitles = signal<boolean>(false);
  languages = this.svc.getLanguagesSignal();
  lastTranscription = signal<TranscriptionResponse | null>(null);

  // Enhanced UI features
  autoScroll = signal<boolean>(true);
  isFullscreen = signal<boolean>(false);
  searchQuery = signal<string>('');
  selectedTabIndex = signal<number>(0);
  activeSegmentIndex = signal<number>(-1);
  isTranscriptExpanded = signal<boolean>(true);

  private recognition: any | null = null;
  private startedAt = 0;
  private scrollTimeout: any = null;

  fullTranscript = computed(() => {
    const text = this.segments().map(s => s.text).join(' ');
    const interim = this.interim();
    return interim ? text + ' ' + interim : text;
  });

  subtitleSegments = computed<TranscriptionSegment[]>(() => {
    const transcription = this.lastTranscription();
    if (transcription?.segments?.length) {
      return transcription.segments;
    }

    const liveSegments = this.segments()
      .map((seg, idx, all) => {
        const startMs = Math.max(0, Number(seg.at) || 0);
        const nextStart = idx < all.length - 1 ? Math.max(startMs + 1, Number(all[idx + 1].at) || 0) : startMs + 2000;
        return {
          text: seg.text,
          startMs,
          endMs: nextStart
        };
      })
      .filter(seg => seg.text?.trim().length > 0);

    return liveSegments;
  });

  hasSubtitleData = computed(() => this.subtitleSegments().length > 0);

  filteredSegments = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.segments();

    return this.segments().map((seg, idx) => ({
      ...seg,
      isHighlighted: seg.text.toLowerCase().includes(query),
      originalIndex: idx
    })).filter(seg => seg.isHighlighted);
  });

  hasSearchResults = computed(() => {
    const query = this.searchQuery().trim();
    return query.length > 0 && this.filteredSegments().length > 0;
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
            this.scrollToBottom();
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
    this.lastTranscription.set(null);
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
    this.lastTranscription.set(null);
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
          this.lastTranscription.set(res);
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

  downloadSubtitles(format: SubtitleFormat) {
    if (this.isExportingSubtitles()) return;

    const subtitleSegments = this.subtitleSegments();
    if (!subtitleSegments.length) return;

    this.isExportingSubtitles.set(true);
    this.errorMessage.set(null);
    try {
      const blob = this.subtitleSvc.generateSubtitles(subtitleSegments, format);
      const formatInfo = this.subtitleSvc.getFormatInfo(format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transcription.${formatInfo.extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate subtitles:', err);
      this.errorMessage.set('Failed to generate subtitles. Please try again.');
    } finally {
      this.isExportingSubtitles.set(false);
    }
  }

  toggleFullscreen() {
    this.isFullscreen.update(v => !v);
  }

  toggleTranscriptExpansion() {
    this.isTranscriptExpanded.update(v => !v);
  }

  jumpToSegment(index: number) {
    this.activeSegmentIndex.set(index);
    const element = document.querySelector(`[data-segment-index="${index}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Temporarily disable auto-scroll when manually jumping
      if (this.autoScroll()) {
        this.autoScroll.set(false);
        setTimeout(() => this.autoScroll.set(true), 3000);
      }
    }
  }

  clearSearch() {
    this.searchQuery.set('');
  }

  private scrollToBottom() {
    if (!this.autoScroll()) return;

    clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(() => {
      const containerRef = this.transcriptContainer();
      if (containerRef?.nativeElement) {
        const container = containerRef.nativeElement;
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }

  onUserScroll() {
    // Disable auto-scroll when user manually scrolls
    const containerRef = this.transcriptContainer();
    if (!containerRef?.nativeElement) return;

    const container = containerRef.nativeElement;
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 50;

    if (!isAtBottom && this.autoScroll()) {
      this.autoScroll.set(false);
    } else if (isAtBottom && !this.autoScroll()) {
      this.autoScroll.set(true);
    }
  }

  highlightText(text: string): string {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }
}
