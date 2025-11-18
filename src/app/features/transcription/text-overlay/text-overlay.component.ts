import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { SegmentData, OverlayContent } from '../../../core/models/transcription.models';

@Component({
  selector: 'app-text-overlay',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './text-overlay.component.html',
  styleUrls: ['./text-overlay.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state('void', style({ opacity: 0 })),
      transition(':enter', [
        animate('200ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('slideInOut', [
      state('void', style({ transform: 'translateY(20px)', opacity: 0 })),
      transition(':enter', [
        animate('250ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'translateY(20px)', opacity: 0 }))
      ])
    ])
  ]
})
export class TextOverlayComponent implements AfterViewInit, OnDestroy {
  @Input() selectedSegment: SegmentData | null = null;
  @Input() content: OverlayContent | null = null;
  @Input() isVisible = false;
  @Output() closed = new EventEmitter<void>();

  @ViewChild('overlayElement') overlayElement?: ElementRef;

  ngAfterViewInit() {
    this.handleKeyboard = this.handleKeyboard.bind(this);
    document.addEventListener('keydown', this.handleKeyboard);
  }

  ngOnDestroy() {
    document.removeEventListener('keydown', this.handleKeyboard);
  }

  private handleKeyboard(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.isVisible) {
      this.close();
    }
  }

  onBackdropClick() {
    this.close();
  }

  close() {
    this.isVisible = false;
    this.closed.emit();
  }
}
