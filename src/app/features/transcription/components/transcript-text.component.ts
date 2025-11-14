import { Component, Input, Output, EventEmitter, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextSegmentComponent, SegmentData } from './text-segment.component';
import { TextOverlayComponent, OverlayContent } from './text-overlay.component';

export interface TranscriptSegment {
  text: string;
  at: number;
}

@Component({
  selector: 'app-transcript-text',
  standalone: true,
  imports: [CommonModule, TextSegmentComponent, TextOverlayComponent],
  template: `
    <div class="transcript-text-container">
      @if (segments().length === 0 && !interim()) {
        <div class="empty-state">
          <div class="empty-icon">📝</div>
          <p class="empty-title">Your transcript will appear here</p>
          <span class="empty-subtitle">Start speaking or upload a file to begin</span>
        </div>
      } @else {
        <div class="transcript-flow">
          @for (paragraph of paragraphs(); track paragraph.index) {
            <p class="transcript-paragraph">
              @for (word of paragraph.words; track word.index) {
                <app-text-segment
                  [data]="word"
                  (segmentClick)="onSegmentClick($event)"
                  (segmentHover)="onSegmentHover($event)"
                ></app-text-segment>@if (word.index < paragraph.words.length - 1) {<span> </span>}
              }
            </p>
          }
          @if (interim()) {
            <p class="transcript-paragraph interim-paragraph">
              @for (word of interimWords(); track word.index) {
                <app-text-segment
                  [data]="word"
                  (segmentClick)="onSegmentClick($event)"
                  (segmentHover)="onSegmentHover($event)"
                ></app-text-segment>@if (word.index < interimWords().length - 1) {<span> </span>}
              }
            </p>
          }
        </div>
      }
    </div>

    <app-text-overlay
      [selectedSegment]="selectedSegment()"
      [content]="overlayContent()"
      [isVisible]="showOverlay()"
      (closed)="onOverlayClosed()"
    ></app-text-overlay>
  `,
  styles: [`
    .transcript-text-container {
      min-height: 400px;
      max-height: 600px;
      overflow-y: auto;
      padding: var(--space-6);
      background: var(--glass-bg);
      backdrop-filter: blur(var(--blur-md));
      -webkit-backdrop-filter: blur(var(--blur-md));
      border: 1px solid var(--glass-border);
      box-shadow: var(--glass-shadow);
      border-radius: var(--radius-lg);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 350px;
      text-align: center;
      color: var(--text-tertiary);
    }

    .empty-icon {
      font-size: 64px;
      margin-bottom: var(--space-4);
      opacity: 0.5;
    }

    .empty-title {
      font-size: 1.25rem;
      font-weight: var(--font-weight-semibold);
      color: var(--text-secondary);
      margin-bottom: var(--space-2);
    }

    .empty-subtitle {
      font-size: 0.9375rem;
      color: var(--text-tertiary);
    }

    .transcript-flow {
      line-height: var(--line-height-relaxed);
    }

    .transcript-paragraph {
      font-size: 1.125rem;
      line-height: 1.8;
      color: var(--text-primary);
      margin: 0 0 var(--space-5) 0;
      text-align: left;
      font-weight: var(--font-weight-regular);
      letter-spacing: 0.01em;
    }

    .transcript-paragraph:last-child {
      margin-bottom: 0;
    }

    .interim-paragraph {
      color: var(--info);
      font-style: italic;
      opacity: 0.9;
      animation: fadeIn 0.3s ease-out;
    }

    /* Mobile optimizations */
    @media (max-width: 768px) {
      .transcript-text-container {
        min-height: 300px;
        max-height: 500px;
        padding: var(--space-4);
      }

      .transcript-paragraph {
        font-size: 1rem;
        line-height: 1.7;
      }
    }

    @media (max-width: 480px) {
      .transcript-paragraph {
        font-size: 0.9375rem;
      }
    }

    /* Scrollbar styling */
    .transcript-text-container::-webkit-scrollbar {
      width: 8px;
    }

    .transcript-text-container::-webkit-scrollbar-track {
      background: var(--bg-tertiary);
      border-radius: var(--radius-full);
    }

    .transcript-text-container::-webkit-scrollbar-thumb {
      background: var(--text-tertiary);
      border-radius: var(--radius-full);
    }

    .transcript-text-container::-webkit-scrollbar-thumb:hover {
      background: var(--text-secondary);
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(4px);
      }
      to {
        opacity: 0.9;
        transform: translateY(0);
      }
    }
  `]
})
export class TranscriptTextComponent {
  @Input() set segmentList(value: TranscriptSegment[]) {
    this.segments.set(value);
  }
  @Input() set interimText(value: string) {
    this.interim.set(value);
  }
  @Output() segmentSpeak = new EventEmitter<string>();

  segments = signal<TranscriptSegment[]>([]);
  interim = signal<string>('');
  selectedSegment = signal<SegmentData | null>(null);
  overlayContent = signal<OverlayContent | null>(null);
  showOverlay = signal<boolean>(false);

  // Convert segments into paragraphs with words
  paragraphs = computed(() => {
    const segs = this.segments();
    return segs.map((seg, segIndex) => {
      const words = this.splitIntoWords(seg.text);
      return {
        index: segIndex,
        text: seg.text,
        timestamp: seg.at,
        words: words.map((word, wordIndex) => ({
          text: word,
          type: 'word' as const,
          index: wordIndex,
          metadata: { segmentIndex: segIndex, timestamp: seg.at }
        }))
      };
    });
  });

  // Convert interim text into words
  interimWords = computed(() => {
    const text = this.interim();
    if (!text) return [];
    const words = this.splitIntoWords(text);
    return words.map((word, index) => ({
      text: word,
      type: 'word' as const,
      index,
      metadata: { isInterim: true }
    }));
  });

  private splitIntoWords(text: string): string[] {
    // Split by spaces and filter out empty strings
    return text.split(/\s+/).filter(w => w.length > 0);
  }

  onSegmentClick(segment: SegmentData) {
    this.selectedSegment.set(segment);
    this.overlayContent.set({
      title: 'Word Details',
      description: `You selected: "${segment.text}". This is where detailed information about pronunciation, grammar, or translations could appear.`,
      metadata: segment.metadata,
      customData: true // This triggers the extensibility placeholder
    });
    this.showOverlay.set(true);

    // Also speak the word
    this.segmentSpeak.emit(segment.text);
  }

  onSegmentHover(segment: SegmentData) {
    // Could be used for preview tooltips in the future
  }

  onOverlayClosed() {
    this.showOverlay.set(false);
    this.selectedSegment.set(null);
    this.overlayContent.set(null);
  }
}
