import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { ProsodyScoreDto } from '../../core/models';

@Component({
  selector: 'app-prosody-panel',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatDividerModule],
  templateUrl: './prosody-panel.component.html',
  styleUrl: './prosody-panel.component.scss'
})
export class ProsodyPanelComponent {
  @Input({ required: true }) set score(value: ProsodyScoreDto | null) {
    this.scoreSignal.set(value);
  }
  @Input() title: string = 'Prosody Analysis';

  private scoreSignal = signal<ProsodyScoreDto | null>(null);

  currentScore = computed(() => this.scoreSignal());
  hasScore = computed(() => this.scoreSignal() !== null);

  overallPct = computed(() => {
    return Math.round((this.scoreSignal()?.overallScore ?? 0) * 100);
  });

  subScores = computed(() => {
    const s = this.scoreSignal()?.subScores;
    if (!s) return [] as Array<{ key: string; label: string; value: number }>;
    return [
      { key: 'rhythm', label: 'Rhythm', value: s.rhythm },
      { key: 'intonation', label: 'Intonation', value: s.intonation },
      { key: 'stress', label: 'Stress', value: s.stress },
      { key: 'pacing', label: 'Pacing', value: s.pacing },
      { key: 'fluency', label: 'Fluency', value: s.fluency },
    ];
  });

  severityClass(sev?: string): string {
    switch (sev) {
      case 'CRITICAL': return 'sev-critical';
      case 'WARNING': return 'sev-warning';
      default: return 'sev-info';
    }
  }

  scoreGradient(val: number): string {
    if (val >= 0.9) return 'linear-gradient(135deg, #10b981 0%, #34d399 100%)';
    if (val >= 0.75) return 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)';
    if (val >= 0.6) return 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)';
    return 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)';
  }
}
