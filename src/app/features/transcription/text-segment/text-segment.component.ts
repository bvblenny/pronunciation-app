import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SegmentData } from '../../../core';

@Component({
  selector: 'app-text-segment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './text-segment.component.html',
  styleUrls: [`./text-segment.component.scss`]
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
