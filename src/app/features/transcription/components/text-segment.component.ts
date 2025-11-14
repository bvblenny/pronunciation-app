import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SegmentData {
  text: string;
  type: 'word' | 'sentence';
  index: number;
  metadata?: any;
}

@Component({
  selector: 'app-text-segment',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="text-segment"
      [class.text-segment--word]="data.type === 'word'"
      [class.text-segment--sentence]="data.type === 'sentence'"
      [class.text-segment--hovered]="isHovered"
      (mouseenter)="onMouseEnter()"
      (mouseleave)="onMouseLeave()"
      (click)="onClick($event)"
    >{{ data.text }}</span>
  `,
  styles: [`
    .text-segment {
      display: inline;
      cursor: pointer;
      transition: all var(--transition-fast);
      border-radius: 4px;
      padding: 2px 0;
    }

    .text-segment--word {
      position: relative;
    }

    .text-segment--word:hover {
      background: var(--accent-light);
      color: var(--accent-primary);
      box-shadow: 0 2px 8px rgba(94, 92, 230, 0.15);
    }

    .text-segment--sentence {
      display: inline;
    }

    .text-segment--hovered {
      background: var(--accent-light);
    }
  `]
})
export class TextSegmentComponent {
  @Input() data!: SegmentData;
  @Output() segmentClick = new EventEmitter<SegmentData>();
  @Output() segmentHover = new EventEmitter<SegmentData>();

  isHovered = false;

  onMouseEnter() {
    this.isHovered = true;
    this.segmentHover.emit(this.data);
  }

  onMouseLeave() {
    this.isHovered = false;
  }

  onClick(event: MouseEvent) {
    event.stopPropagation();
    this.segmentClick.emit(this.data);
  }
}
