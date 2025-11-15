import { Component, input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextSegmentComponent, SegmentType } from './text-segment.component';
import { TextSegmentOverlayComponent, OverlayContent } from './text-segment-overlay.component';

/**
 * Represents a word or sentence segment with metadata
 */
interface TextSegmentData {
  text: string;
  type: SegmentType;
  index: number;
  originalSegmentIndex?: number; // reference to original transcript segment
}

/**
 * Interactive text view component
 * Displays transcription as flowing, interactive text
 * Optimized for mobile-first design with word and sentence level interactions
 */
@Component({
  selector: 'app-interactive-text-view',
  standalone: true,
  imports: [CommonModule, TextSegmentComponent, TextSegmentOverlayComponent],
  template: `
    <div class="interactive-text-container">
      <!-- Interactive mode selector -->
      <div class="mode-selector">
        <button
          class="mode-button"
          [class.active]="interactionMode() === 'word'"
          (click)="interactionMode.set('word')"
          [attr.aria-pressed]="interactionMode() === 'word'">
          <span class="mode-icon">✏️</span>
          Word Level
        </button>
        <button
          class="mode-button"
          [class.active]="interactionMode() === 'sentence'"
          (click)="interactionMode.set('sentence')"
          [attr.aria-pressed]="interactionMode() === 'sentence'">
          <span class="mode-icon">📝</span>
          Sentence Level
        </button>
      </div>

      <!-- Interactive text display -->
      <div class="interactive-text-content">
        @if (textSegments().length === 0) {
          <div class="empty-state">
            <p>No text to display</p>
          </div>
        } @else {
          <div class="text-flow">
            @for (segment of textSegments(); track segment.index) {
              <app-text-segment
                [text]="segment.text"
                [type]="segment.type"
                [index]="segment.index"
                (onSegmentClick)="handleSegmentClick($event)"
                (onSegmentHover)="handleSegmentHover($event)" />
              @if (segment.type === 'sentence' && segment.index < textSegments().length - 1) {
                <span class="sentence-separator"> </span>
              }
            }
          </div>
        }
      </div>

      <!-- Overlay for selected segment -->
      @if (selectedSegment()) {
        <app-text-segment-overlay
          [selectedText]="selectedSegment()!.text"
          [content]="overlayContent()"
          [position]="overlayPosition()"
          (onClose)="closeOverlay()" />
      }

      <!-- Keyboard shortcuts help -->
      <div class="keyboard-hints">
        <span class="hint">💡 Tip: Use Tab to navigate, Enter/Space to select</span>
      </div>
    </div>
  `,
  styles: [`
    .interactive-text-container {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
      padding: var(--space-6);
    }

    .mode-selector {
      display: flex;
      gap: var(--space-3);
      padding: var(--space-2);
      background: var(--bg-secondary);
      border-radius: var(--radius-lg);
      border: 1px solid var(--glass-border);
      width: fit-content;
      margin: 0 auto;
    }

    .mode-button {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-3) var(--space-5);
      background: transparent;
      border: none;
      border-radius: var(--radius-md);
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover {
        background: var(--bg-secondary-alpha);
        color: var(--text-primary);
      }

      &.active {
        background: var(--accent-primary);
        color: white;
        box-shadow: var(--shadow-sm);
      }

      .mode-icon {
        font-size: 1.25rem;
      }
    }

    .interactive-text-content {
      background: var(--bg-primary);
      padding: var(--space-8);
      border-radius: var(--radius-lg);
      min-height: 300px;
    }

    .text-flow {
      font-size: 1.25rem;
      line-height: 2.2;
      color: var(--text-primary);
      text-align: justify;
      max-width: 900px;
      margin: 0 auto;
      letter-spacing: 0.01em;
      word-spacing: 0.1em;
    }

    .sentence-separator {
      display: inline;
    }

    .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 300px;
      color: var(--text-tertiary);
      font-size: 1.125rem;
    }

    .keyboard-hints {
      display: flex;
      justify-content: center;
      padding: var(--space-3);
      background: var(--info-bg);
      border: 1px solid var(--info);
      border-radius: var(--radius-md);
      
      .hint {
        font-size: 0.875rem;
        color: var(--info);
        font-weight: 500;
      }
    }

    /* Mobile optimizations */
    @media (max-width: 768px) {
      .interactive-text-container {
        padding: var(--space-4);
      }

      .mode-selector {
        width: 100%;
        justify-content: center;
      }

      .mode-button {
        flex: 1;
        justify-content: center;
        font-size: 0.875rem;
        padding: var(--space-2) var(--space-3);
      }

      .interactive-text-content {
        padding: var(--space-5);
      }

      .text-flow {
        font-size: 1.125rem;
        line-height: 2;
        text-align: left;
      }

      .keyboard-hints {
        display: none; /* Hide on mobile as it's touch-based */
      }
    }

    @media (max-width: 480px) {
      .text-flow {
        font-size: 1rem;
        line-height: 1.9;
      }
    }
  `]
})
export class InteractiveTextViewComponent {
  // Input: array of text segments (from parent component)
  transcriptSegments = input<{ text: string; at: number }[]>([]);
  
  // Interaction mode: word or sentence level
  interactionMode = signal<SegmentType>('word');
  
  // Selected segment for overlay
  selectedSegment = signal<TextSegmentData | null>(null);
  overlayPosition = signal<{ top: number; left: number }>({ top: 100, left: 100 });
  
  // Compute text segments based on interaction mode
  textSegments = computed(() => {
    const mode = this.interactionMode();
    const segments = this.transcriptSegments();
    
    if (segments.length === 0) return [];
    
    const result: TextSegmentData[] = [];
    let globalIndex = 0;
    
    segments.forEach((segment, segIdx) => {
      if (mode === 'word') {
        // Split into words
        const words = segment.text.split(/(\s+|[.,;:!?])/g).filter(w => w.trim().length > 0);
        words.forEach(word => {
          result.push({
            text: word,
            type: 'word',
            index: globalIndex++,
            originalSegmentIndex: segIdx
          });
        });
      } else {
        // Treat each segment as a sentence
        result.push({
          text: segment.text,
          type: 'sentence',
          index: globalIndex++,
          originalSegmentIndex: segIdx
        });
      }
    });
    
    return result;
  });
  
  // Overlay content (extensible for future enhancements)
  overlayContent = computed<OverlayContent>(() => {
    const segment = this.selectedSegment();
    if (!segment) {
      return { type: 'placeholder', text: '' };
    }
    
    // Currently showing placeholder content
    // This can be extended to fetch real data based on segment
    return {
      type: 'placeholder',
      title: segment.type === 'word' ? 'Word Information' : 'Sentence Information',
      text: `This is a ${segment.type} segment. Future enhancements will provide detailed information here.`,
      metadata: {
        segmentIndex: segment.index,
        originalIndex: segment.originalSegmentIndex
      }
    };
  });
  
  handleSegmentClick(event: { text: string; type: SegmentType; index: number; event: MouseEvent | KeyboardEvent }) {
    const segment = this.textSegments().find(s => s.index === event.index);
    if (!segment) return;
    
    this.selectedSegment.set(segment);
    
    // Calculate overlay position based on click position
    if (event.event instanceof MouseEvent) {
      const mouseEvent = event.event as MouseEvent;
      const x = mouseEvent.clientX;
      const y = mouseEvent.clientY;
      
      // Position overlay near click but ensure it stays in viewport
      const offsetX = 20;
      const offsetY = 20;
      
      this.overlayPosition.set({
        left: Math.min(x + offsetX, window.innerWidth - 420), // 420 = overlay width + padding
        top: Math.min(y + offsetY, window.innerHeight - 300) // 300 = approx overlay height
      });
    } else {
      // Keyboard event - center overlay
      this.overlayPosition.set({
        left: window.innerWidth / 2 - 200,
        top: window.innerHeight / 2 - 150
      });
    }
  }
  
  handleSegmentHover(event: { text: string; type: SegmentType; index: number; isHovering: boolean }) {
    // Can be used for preview tooltips or other hover effects
    // Currently not implemented to keep it simple
  }
  
  closeOverlay() {
    this.selectedSegment.set(null);
  }
}
