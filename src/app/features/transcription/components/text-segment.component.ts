import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Text segment type - can be word or sentence
 */
export type SegmentType = 'word' | 'sentence';

/**
 * Interactive text segment component
 * Represents a clickable/hoverable portion of text
 * Emits events for user interactions
 */
@Component({
  selector: 'app-text-segment',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="text-segment"
      [class.text-segment--word]="type() === 'word'"
      [class.text-segment--sentence]="type() === 'sentence'"
      [class.text-segment--highlighted]="isHighlighted()"
      (click)="onClick($event)"
      (mouseenter)="onHover(true)"
      (mouseleave)="onHover(false)"
      [attr.data-segment-index]="index()"
      [attr.tabindex]="0"
      [attr.role]="'button'"
      [attr.aria-label]="'Select text: ' + text()"
      (keydown.enter)="onClick($event)"
      (keydown.space)="onClick($event)">{{ text() }}</span>`,
  styles: [`
    .text-segment {
      position: relative;
      display: inline;
      cursor: pointer;
      transition: all var(--transition-fast);
      border-radius: 4px;
      padding: 2px 0;
      outline: none;
      
      /* Subtle underline to hint at interactivity */
      text-decoration: underline;
      text-decoration-color: transparent;
      text-decoration-thickness: 2px;
      text-underline-offset: 4px;
    }

    .text-segment--word {
      /* Word-level hover effect */
      &:hover,
      &:focus-visible {
        color: var(--accent-primary);
        text-decoration-color: var(--accent-primary);
        background: var(--accent-light);
        padding: 2px 4px;
        margin: 0 -4px;
        font-weight: 500;
      }

      &:active {
        background: var(--accent-hover);
        color: white;
      }
    }

    .text-segment--sentence {
      /* Sentence-level is more subtle */
      &:hover,
      &:focus-visible {
        background: var(--bg-secondary-alpha);
        text-decoration-color: var(--text-tertiary);
      }

      &:active {
        background: var(--bg-secondary-alpha-heavy);
      }
    }

    .text-segment--highlighted {
      background: var(--warning-bg);
      color: var(--text-primary);
      font-weight: 600;
      padding: 2px 4px;
      margin: 0 -4px;
    }

    .text-segment:focus-visible {
      outline: 2px solid var(--accent-primary);
      outline-offset: 2px;
    }

    /* Mobile touch optimization */
    @media (hover: none) and (pointer: coarse) {
      .text-segment {
        /* Increase touch target size */
        padding: var(--space-2);
        margin: 0 -2px;
      }

      .text-segment--word:hover {
        /* Disable hover on touch devices */
        background: transparent;
        color: inherit;
        text-decoration-color: transparent;
      }
    }
  `]
})
export class TextSegmentComponent {
  text = input.required<string>();
  type = input<SegmentType>('word');
  index = input.required<number>();
  isHighlighted = input<boolean>(false);

  onSegmentClick = output<{ text: string; type: SegmentType; index: number; event: MouseEvent | KeyboardEvent }>();
  onSegmentHover = output<{ text: string; type: SegmentType; index: number; isHovering: boolean }>();

  onClick(event: MouseEvent | KeyboardEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.onSegmentClick.emit({
      text: this.text(),
      type: this.type(),
      index: this.index(),
      event
    });
  }

  onHover(isHovering: boolean) {
    this.onSegmentHover.emit({
      text: this.text(),
      type: this.type(),
      index: this.index(),
      isHovering
    });
  }
}
