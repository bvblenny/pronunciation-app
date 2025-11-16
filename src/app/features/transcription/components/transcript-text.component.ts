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
          <div class="transcript-inline" aria-label="Transcript text">
            @for (word of allWords(); track word.globalIndex) {
              <app-text-segment
                [data]="word"
                (segmentClick)="onSegmentClick($event)"
                (segmentHover)="onSegmentHover($event)"
              ></app-text-segment>
            }
            @if (interim()) {
              <span class="interim-inline">
                @for (word of interimWords(); track word.index) {
                  <app-text-segment
                    [data]="word"
                    (segmentClick)="onSegmentClick($event)"
                    (segmentHover)="onSegmentHover($event)"
                  ></app-text-segment>
                }
              </span>
            }
          </div>
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

    /* Inline continuous flow - no paragraph breaks */
    .transcript-inline {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      gap: 0.35rem;
      font-size: 1.125rem;
      line-height: 1.7;
      color: var(--text-primary);
      text-align: left;
    }

    /* Interim words visually distinct but inline */
    .interim-inline {
      opacity: 0.7;
      font-style: italic;
      display: contents;
      animation: fadeIn 0.3s ease-out;
    }

    /* Mobile optimizations */
    @media (max-width: 768px) {
      .transcript-text-container {
        min-height: 300px;
        max-height: 500px;
        padding: var(--space-4);
      }

      .transcript-inline {
        font-size: 1rem;
        line-height: 1.6;
      }
    }

    @media (max-width: 480px) {
      .transcript-inline {
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

  allWords = computed(() => {
    const paragraphs = this.paragraphs();
    const flattened: Array<SegmentData & { globalIndex: number }> = [];
    let counter = 0;
    for (const p of paragraphs) {
      for (const w of p.words) {
        flattened.push({ ...w, globalIndex: counter++ });
      }
    }
    return flattened;
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
    return text.split(/\s+/).filter(w => w.length > 0);
  }

  onSegmentClick(segment: SegmentData) {
    this.selectedSegment.set(segment);
    this.overlayContent.set({
      title: 'Word Details',
      description: `You selected: "${segment.text}".`,
      metadata: segment.metadata,
      customData: true // This triggers the extensibility placeholder
    });
    this.showOverlay.set(true);

    // this.segmentSpeak.emit(segment.text);
  }

  onSegmentHover(segment: SegmentData) {
    // TODO: use for preview tooltips
  }

  onOverlayClosed() {
    this.showOverlay.set(false);
    this.selectedSegment.set(null);
    this.overlayContent.set(null);
  }
}
