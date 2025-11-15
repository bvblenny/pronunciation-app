import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

/**
 * Extensible data model for overlay content
 * Allows easy addition of new content types
 */
export interface OverlayContent {
  type: 'placeholder' | 'pronunciation' | 'definition' | 'translation' | 'grammar' | 'custom';
  title?: string;
  text?: string;
  audioUrl?: string;
  metadata?: Record<string, any>;
}

/**
 * Text segment overlay/popover component
 * Displays detailed information about selected text segments
 * Designed to be extensible for future enhancements
 */
@Component({
  selector: 'app-text-segment-overlay',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="overlay-backdrop" (click)="onClose.emit()"></div>
    <div class="overlay-container" [style.top.px]="position().top" [style.left.px]="position().left">
      <div class="overlay-header">
        <h3 class="overlay-title">{{ content().title || 'Text Information' }}</h3>
        <button mat-icon-button (click)="onClose.emit()" class="overlay-close">
          <mat-icon>close</mat-icon>
        </button>
      </div>
      <div class="overlay-body">
        @switch (content().type) {
          @case ('placeholder') {
            <div class="overlay-content">
              <div class="selected-text">"{{ selectedText() }}"</div>
              <p class="placeholder-text">{{ content().text || 'More information about this text segment will appear here.' }}</p>
              <div class="placeholder-features">
                <div class="feature-item">
                  <mat-icon>record_voice_over</mat-icon>
                  <span>Pronunciation guide (coming soon)</span>
                </div>
                <div class="feature-item">
                  <mat-icon>volume_up</mat-icon>
                  <span>Audio playback (coming soon)</span>
                </div>
                <div class="feature-item">
                  <mat-icon>translate</mat-icon>
                  <span>Translation options (coming soon)</span>
                </div>
                <div class="feature-item">
                  <mat-icon>menu_book</mat-icon>
                  <span>Grammar information (coming soon)</span>
                </div>
              </div>
            </div>
          }
          @case ('definition') {
            <div class="overlay-content">
              <div class="selected-text">"{{ selectedText() }}"</div>
              <p class="definition-text">{{ content().text }}</p>
            </div>
          }
          @case ('pronunciation') {
            <div class="overlay-content">
              <div class="selected-text">"{{ selectedText() }}"</div>
              @if (content().text) {
                <div class="pronunciation-guide">
                  <mat-icon>record_voice_over</mat-icon>
                  <span>{{ content().text }}</span>
                </div>
              }
              @if (content().audioUrl) {
                <button mat-raised-button color="primary" (click)="playAudio()">
                  <mat-icon>volume_up</mat-icon>
                  Listen
                </button>
              }
            </div>
          }
          @default {
            <div class="overlay-content">
              <div class="selected-text">"{{ selectedText() }}"</div>
              <p>{{ content().text || 'No content available' }}</p>
            </div>
          }
        }
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
      background: rgba(0, 0, 0, 0.3);
      z-index: 1000;
      animation: fadeIn 0.2s ease-out;
    }

    .overlay-container {
      position: fixed;
      background: var(--glass-bg-strong);
      backdrop-filter: blur(var(--blur-md));
      -webkit-backdrop-filter: blur(var(--blur-md));
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xl);
      max-width: 400px;
      width: 90vw;
      max-height: 80vh;
      overflow-y: auto;
      z-index: 1001;
      animation: slideInScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes slideInScale {
      from {
        opacity: 0;
        transform: scale(0.9) translateY(-10px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    .overlay-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-4) var(--space-5);
      border-bottom: 1px solid var(--glass-border);
      background: var(--bg-secondary-alpha);
    }

    .overlay-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }

    .overlay-close {
      width: 32px;
      height: 32px;
      color: var(--text-secondary);
      
      &:hover {
        color: var(--text-primary);
        background: var(--bg-secondary-alpha-heavy);
      }
    }

    .overlay-body {
      padding: var(--space-5);
    }

    .overlay-content {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .selected-text {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--accent-primary);
      padding: var(--space-3);
      background: var(--accent-light);
      border-radius: var(--radius-sm);
      border-left: 4px solid var(--accent-primary);
    }

    .placeholder-text {
      color: var(--text-secondary);
      line-height: 1.6;
      margin: 0;
    }

    .placeholder-features {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      margin-top: var(--space-3);
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3);
      background: var(--bg-secondary);
      border-radius: var(--radius-sm);
      border: 1px solid var(--glass-border);
      color: var(--text-secondary);
      font-size: 0.875rem;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: var(--accent-primary);
        opacity: 0.5;
      }
    }

    .definition-text {
      color: var(--text-primary);
      line-height: 1.6;
      margin: 0;
    }

    .pronunciation-guide {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-4);
      background: var(--bg-secondary);
      border-radius: var(--radius-sm);
      font-family: var(--font-mono);
      color: var(--text-primary);

      mat-icon {
        color: var(--accent-primary);
      }
    }

    @media (max-width: 768px) {
      .overlay-container {
        max-width: none;
        width: 95vw;
        left: 50% !important;
        transform: translateX(-50%);
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `]
})
export class TextSegmentOverlayComponent {
  selectedText = input.required<string>();
  content = input.required<OverlayContent>();
  position = input<{ top: number; left: number }>({ top: 100, left: 100 });
  
  onClose = output<void>();

  playAudio() {
    const audioUrl = this.content().audioUrl;
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  }
}
