import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { SegmentData } from './text-segment.component';

export interface OverlayContent {
  title?: string;
  description?: string;
  metadata?: any;
  customData?: any;
}

@Component({
  selector: 'app-text-overlay',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="overlay-backdrop" 
         [@fadeInOut] 
         (click)="onBackdropClick()"
         *ngIf="isVisible">
      <div class="overlay-content" 
           #overlayElement
           (click)="$event.stopPropagation()"
           [@slideInOut]>
        <div class="overlay-header">
          <h3 class="overlay-title">{{ content?.title || 'Text Details' }}</h3>
          <button mat-icon-button 
                  class="overlay-close" 
                  (click)="close()"
                  aria-label="Close overlay">
            <mat-icon>close</mat-icon>
          </button>
        </div>
        
        <div class="overlay-body">
          <div class="selected-text">
            <span class="text-label">Selected:</span>
            <span class="text-value">"{{ selectedSegment?.text }}"</span>
          </div>
          
          <div class="overlay-section">
            <p class="overlay-description">
              {{ content?.description || 'This is a placeholder for detailed information about the selected text segment.' }}
            </p>
          </div>
          
          <!-- Extensible content area for future features -->
          <div class="overlay-extensible" *ngIf="content?.customData">
            <div class="extension-placeholder">
              <mat-icon>info_outline</mat-icon>
              <p>Additional features coming soon:</p>
              <ul class="feature-list">
                <li>Pronunciation guide</li>
                <li>Audio playback</li>
                <li>Translation options</li>
                <li>Grammar information</li>
              </ul>
            </div>
          </div>
          
          <div class="overlay-meta" *ngIf="content?.metadata">
            <div class="meta-item">
              <span class="meta-label">Type:</span>
              <span class="meta-value">{{ selectedSegment?.type }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Position:</span>
              <span class="meta-value">{{ selectedSegment?.index }}</span>
            </div>
          </div>
        </div>
        
        <div class="overlay-footer">
          <button mat-stroked-button (click)="close()">Close</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .overlay-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: var(--space-4);
    }

    .overlay-content {
      background: var(--bg-secondary);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xl);
      max-width: 600px;
      width: 100%;
      max-height: 80vh;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }

    .overlay-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-6);
      border-bottom: 1px solid var(--glass-border);
    }

    .overlay-title {
      font-size: 1.25rem;
      font-weight: var(--font-weight-semibold);
      color: var(--text-primary);
      margin: 0;
    }

    .overlay-close {
      color: var(--text-secondary);
    }

    .overlay-body {
      padding: var(--space-6);
      flex: 1;
      overflow-y: auto;
    }

    .selected-text {
      background: var(--accent-light);
      padding: var(--space-4);
      border-radius: var(--radius-md);
      margin-bottom: var(--space-5);
      border-left: 3px solid var(--accent-primary);
    }

    .text-label {
      display: block;
      font-size: 0.75rem;
      font-weight: var(--font-weight-semibold);
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: var(--space-2);
    }

    .text-value {
      display: block;
      font-size: 1.125rem;
      font-weight: var(--font-weight-medium);
      color: var(--accent-primary);
      line-height: var(--line-height-relaxed);
    }

    .overlay-section {
      margin-bottom: var(--space-5);
    }

    .overlay-description {
      color: var(--text-secondary);
      line-height: var(--line-height-relaxed);
      margin: 0;
    }

    .overlay-extensible {
      background: var(--bg-tertiary);
      padding: var(--space-5);
      border-radius: var(--radius-md);
      margin-top: var(--space-5);
    }

    .extension-placeholder {
      text-align: left;
    }

    .extension-placeholder mat-icon {
      color: var(--info);
      margin-bottom: var(--space-3);
    }

    .extension-placeholder p {
      font-weight: var(--font-weight-semibold);
      color: var(--text-primary);
      margin-bottom: var(--space-3);
    }

    .feature-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .feature-list li {
      padding: var(--space-2) 0;
      color: var(--text-secondary);
      font-size: 0.9375rem;
      display: flex;
      align-items: center;
    }

    .feature-list li::before {
      content: '→';
      margin-right: var(--space-2);
      color: var(--accent-primary);
      font-weight: bold;
    }

    .overlay-meta {
      display: flex;
      gap: var(--space-4);
      padding-top: var(--space-5);
      border-top: 1px solid var(--glass-border);
      margin-top: var(--space-5);
    }

    .meta-item {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .meta-label {
      font-size: 0.75rem;
      font-weight: var(--font-weight-semibold);
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .meta-value {
      font-size: 0.9375rem;
      font-weight: var(--font-weight-medium);
      color: var(--text-primary);
    }

    .overlay-footer {
      padding: var(--space-6);
      border-top: 1px solid var(--glass-border);
      display: flex;
      justify-content: flex-end;
    }

    /* Mobile optimizations */
    @media (max-width: 768px) {
      .overlay-backdrop {
        padding: var(--space-2);
      }

      .overlay-content {
        max-height: 90vh;
      }

      .overlay-header,
      .overlay-body,
      .overlay-footer {
        padding: var(--space-4);
      }

      .text-value {
        font-size: 1rem;
      }
    }

    /* Scrollbar styling */
    .overlay-content::-webkit-scrollbar {
      width: 8px;
    }

    .overlay-content::-webkit-scrollbar-track {
      background: var(--bg-tertiary);
      border-radius: var(--radius-full);
    }

    .overlay-content::-webkit-scrollbar-thumb {
      background: var(--text-tertiary);
      border-radius: var(--radius-full);
    }

    .overlay-content::-webkit-scrollbar-thumb:hover {
      background: var(--text-secondary);
    }
  `],
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
    // Handle escape key to close overlay
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
