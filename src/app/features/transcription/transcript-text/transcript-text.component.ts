import { Component, Input, Output, EventEmitter, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextSegmentComponent } from '../text-segment/text-segment.component';
import { TextOverlayComponent } from '../text-overlay/text-overlay.component';
import { splitIntoWords } from '../../../core/utils';
import { OverlayContent, SegmentData, TranscriptSegment } from '../../../core';

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

  segments = signal<TranscriptSegment[]>([]);
  interim = signal<string>('');
  selectedSegment = signal<SegmentData | null>(null);
  overlayContent = signal<OverlayContent | null>(null);
  showOverlay = signal<boolean>(false);

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

  // Convert interim text into words
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
