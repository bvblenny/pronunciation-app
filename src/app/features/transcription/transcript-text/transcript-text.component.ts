import { Component, Input, Output, EventEmitter, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextSegmentComponent } from '../text-segment/text-segment.component';
import { TextOverlayComponent } from '../text-overlay/text-overlay.component';
import { splitIntoWords } from '../../../core/utils';
import { OverlayContent, SegmentData, TranscriptSegment } from '../../../core';
import { DatamuseService, DatamuseWordResult } from '../../../core';

@Component({
  selector: 'app-transcript-text',
  standalone: true,
  imports: [CommonModule, TextSegmentComponent, TextOverlayComponent],
  templateUrl: './transcript-text.component.html',
  styleUrls: ['./transcript-text.component.scss']
})
export class TranscriptTextComponent {
  @Input() set segmentList(value: TranscriptSegment[]) {
    this.segments.set(value);
  }
  @Input() set interimText(value: string) {
    this.interim.set(value);
  }
  @Output() segmentSpeak = new EventEmitter<string>();

  private readonly datamuse = inject(DatamuseService);

  segments = signal<TranscriptSegment[]>([]);
  interim = signal<string>('');
  selectedSegment = signal<SegmentData | null>(null);
  overlayContent = signal<OverlayContent | null>(null);
  showOverlay = signal<boolean>(false);
  isOverlayLoading = signal<boolean>(false);
  overlayError = signal<string | null>(null);

  paragraphs = computed(() => {
    const segs = this.segments();
    return segs.map((seg, segIndex) => {
      const words = splitIntoWords(seg.text);
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

  interimWords = computed(() => {
    const text = this.interim();
    if (!text) return [];
    const words = splitIntoWords(text);
    return words.map((word, index) => ({
      text: word,
      type: 'word' as const,
      index,
      metadata: { isInterim: true }
    }));
  });

  private buildDescriptionFromDatamuse(word: string, results: DatamuseWordResult[]): string {
    if (!results || results.length === 0) {
      return `No definition found for "${word}".`;
    }

    const first = results[0];
    if (!first.defs || first.defs.length === 0) {
      return `No definition found for "${word}".`;
    }

    // Datamuse defs are formatted like "n\tdefinition text"; strip POS prefix.
    const rawDef = first.defs[0];
    const parts = rawDef.split('\t');
    const defText = parts.length > 1 ? parts[1] : rawDef;

    return `Definition of "${word}": ${defText}`;
  }

  onSegmentClick(segment: SegmentData) {
    this.selectedSegment.set(segment);
    this.overlayError.set(null);
    this.isOverlayLoading.set(true);

    this.overlayContent.set({
      title: 'Word Details',
      description: `Loading details for "${segment.text}"...`,
      metadata: segment.metadata,
      customData: true
    });
    this.showOverlay.set(true);

    this.datamuse.getWordInfo(segment.text).subscribe({
      next: (results) => {
        const description = this.buildDescriptionFromDatamuse(segment.text, results);
        const current = this.overlayContent();
        this.overlayContent.set({
          ...(current ?? { title: 'Word Details', metadata: segment.metadata, customData: true }),
          description
        });
        this.isOverlayLoading.set(false);
      },
      error: () => {
        const message = 'Could not load word details. Please try again.';
        this.overlayError.set(message);
        const current = this.overlayContent();
        this.overlayContent.set({
          ...(current ?? { title: 'Word Details', metadata: segment.metadata, customData: true }),
          description: message
        });
        this.isOverlayLoading.set(false);
      }
    });

    // this.segmentSpeak.emit(segment.text);
  }

  onSegmentHover(segment: SegmentData) {
    // TODO: use for preview tooltips
  }

  onOverlayClosed() {
    this.showOverlay.set(false);
    this.selectedSegment.set(null);
    this.overlayContent.set(null);
    this.isOverlayLoading.set(false);
    this.overlayError.set(null);
  }
}
