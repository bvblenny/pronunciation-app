import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

import { ProsodyPanelComponent } from './prosody-panel.component';
import { ProsodyScoreDto } from '../../core/models';

describe('ProsodyPanelComponent', () => {
  let component: ProsodyPanelComponent;
  let fixture: ComponentFixture<ProsodyPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ProsodyPanelComponent,
        MatCardModule,
        MatIconModule,
        MatDividerModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProsodyPanelComponent);
    component = fixture.componentInstance;
    // Don't call detectChanges() initially to avoid template rendering issues
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('score input', () => {
    it('should handle null score', () => {
      component.score = null;
      expect(component.currentScore()).toBe(null);
      expect(component.hasScore()).toBe(false);
      expect(component.overallPct()).toBe(0);
      expect(component.subScores()).toEqual([]);
    });

    it('should handle valid score', () => {
      const mockScore: ProsodyScoreDto = {
        overallScore: 0.85,
        subScores: {
          rhythm: 0.8,
          intonation: 0.9,
          stress: 0.7,
          pacing: 0.95,
          fluency: 0.8
        },
        diagnostics: {
          rhythmMetrics: {
            syllableTimingVariance: 0.1,
            expectedVariance: 0.05,
            isochronyIndex: 0.9,
            interpretation: 'Good rhythm'
          },
          intonationMetrics: {
            pitchRangeHz: 150,
            pitchVariationCoefficient: 0.2,
            meanPitchHz: 180,
            contourSmoothness: 0.8,
            interpretation: 'Good intonation'
          },
          stressMetrics: {
            stressedSyllableCount: 5,
            expectedStressCount: 5,
            stressPlacementAccuracy: 0.9,
            energyContrastRatio: 2.1,
            interpretation: 'Good stress'
          },
          pacingMetrics: {
            syllablesPerSecond: 4.2,
            wordsPerMinute: 140,
            optimalRangeMin: 120,
            optimalRangeMax: 160,
            interpretation: 'Good pacing'
          },
          fluencyMetrics: {
            pauseCount: 2,
            longPauseCount: 0,
            filledPauseCount: 1,
            averagePauseDurationSec: 0.3,
            disfluencyRate: 0.1,
            interpretation: 'Good fluency'
          }
        },
        feedback: [],
        features: {
          duration: 3.5,
          pitchContour: [],
          energyContour: [],
          wordTimings: [],
          pauseRegions: []
        },
        metadata: {
          scorerVersion: '1.0.0',
          modelType: 'HEURISTIC',
          referenceLanguage: 'en-US',
          processingTimestamp: Date.now()
        }
      };

      component.score = mockScore;

      expect(component.currentScore()).toBe(mockScore);
      expect(component.hasScore()).toBe(true);
      expect(component.overallPct()).toBe(85); // 0.85 * 100, rounded

      const subScores = component.subScores();
      expect(subScores).toEqual([
        { key: 'rhythm', label: 'Rhythm', value: 0.8 },
        { key: 'intonation', label: 'Intonation', value: 0.9 },
        { key: 'stress', label: 'Stress', value: 0.7 },
        { key: 'pacing', label: 'Pacing', value: 0.95 },
        { key: 'fluency', label: 'Fluency', value: 0.8 }
      ]);
    });
  });

  describe('severityClass', () => {
    it('should return correct CSS classes for severity levels', () => {
      expect(component.severityClass('CRITICAL')).toBe('sev-critical');
      expect(component.severityClass('WARNING')).toBe('sev-warning');
      expect(component.severityClass('INFO')).toBe('sev-info');
      expect(component.severityClass(undefined)).toBe('sev-info');
    });
  });

  describe('scoreGradient', () => {
    it('should return green gradient for high scores', () => {
      const gradient = component.scoreGradient(0.95);
      expect(gradient).toContain('#10b981');
      expect(gradient).toContain('#34d399');
    });

    it('should return blue gradient for good scores', () => {
      const gradient = component.scoreGradient(0.8);
      expect(gradient).toContain('#3b82f6');
      expect(gradient).toContain('#60a5fa');
    });

    it('should return amber gradient for medium scores', () => {
      const gradient = component.scoreGradient(0.65);
      expect(gradient).toContain('#f59e0b');
      expect(gradient).toContain('#fbbf24');
    });

    it('should return red gradient for low scores', () => {
      const gradient = component.scoreGradient(0.3);
      expect(gradient).toContain('#ef4444');
      expect(gradient).toContain('#f87171');
    });
  });

  describe('title input', () => {
    it('should use default title when not provided', () => {
      expect(component.title).toBe('Prosody Analysis');
    });

    it('should use custom title when provided', () => {
      component.title = 'Custom Prosody Title';
      expect(component.title).toBe('Custom Prosody Title');
    });
  });
});
