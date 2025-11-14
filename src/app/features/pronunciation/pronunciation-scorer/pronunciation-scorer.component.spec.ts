import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { signal } from '@angular/core';

import { PronunciationScorerComponent } from './pronunciation-scorer.component';
import { PronunciationService } from '../../../core/services/pronunciation.service';
import { PronunciationStore } from '../state/pronunciation.store';
import { ProsodyPanelComponent } from '../../prosody/prosody-panel.component';

describe('PronunciationScorerComponent', () => {
  let component: PronunciationScorerComponent;
  let fixture: ComponentFixture<PronunciationScorerComponent>;
  let mockPronunciationService: jasmine.SpyObj<PronunciationService>;
  let mockStore: jasmine.SpyObj<PronunciationStore>;

  beforeEach(async () => {
    const pronunciationServiceSpy = jasmine.createSpyObj('PronunciationService', [], {
      getLanguagesSignal: jasmine.createSpy().and.returnValue(signal([
        { code: 'en-US', name: 'English (US)' },
        { code: 'es-ES', name: 'Spanish' }
      ]))
    });

    const storeSpy = jasmine.createSpyObj('PronunciationStore', ['clearError', 'reset', 'analyze'], {
      detailedAnalysis: jasmine.createSpy().and.returnValue(null),
      prosodyScore: jasmine.createSpy().and.returnValue(null),
      loading: jasmine.createSpy().and.returnValue(false),
      error: jasmine.createSpy().and.returnValue(null)
    });

    await TestBed.configureTestingModule({
      imports: [
        PronunciationScorerComponent,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatCardModule,
        MatProgressBarModule,
        MatIconModule,
        MatDividerModule
      ],
      providers: [
        { provide: PronunciationService, useValue: pronunciationServiceSpy },
        { provide: PronunciationStore, useValue: storeSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PronunciationScorerComponent);
    component = fixture.componentInstance;
    mockPronunciationService = TestBed.inject(PronunciationService) as jasmine.SpyObj<PronunciationService>;
    mockStore = TestBed.inject(PronunciationStore) as jasmine.SpyObj<PronunciationStore>;
    // Don't call detectChanges() to avoid template rendering issues
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.referenceText()).toBe('');
    expect(component.languageCode()).toBe('en-US');
    expect(component.isRecording()).toBe(false);
    expect(component.audioBlob()).toBe(null);
    expect(component.audioUrl()).toBe(null);
    expect(component.uiError()).toBe(null);
  });

  describe('getOverallScore', () => {
    it('should return 0 when no analysis result', () => {
      (mockStore.detailedAnalysis as jasmine.Spy).and.returnValue(null);
      expect(component.getOverallScore()).toBe(0);
    });

    it('should calculate score from word evaluations', () => {
      const mockAnalysis = {
        words: [
          { evaluation: 0.8 },
          { evaluation: 0.6 },
          { evaluation: 0.9 }
        ],
        wer: 0.1
      };
      (mockStore.detailedAnalysis as jasmine.Spy).and.returnValue(mockAnalysis);
      expect(component.getOverallScore()).toBeCloseTo(0.7666666666666667, 10); // (0.8 + 0.6 + 0.9) / 3
    });

    it('should fallback to WER calculation when no word evaluations', () => {
      const mockAnalysis = {
        words: [],
        wer: 0.2
      };
      (mockStore.detailedAnalysis as jasmine.Spy).and.returnValue(mockAnalysis);
      expect(component.getOverallScore()).toBe(0.8); // 1 - 0.2
    });
  });

  describe('getScoreColor', () => {
    it('should return primary color for high scores', () => {
      expect(component.getScoreColor(0.9)).toBe('var(--primary)');
    });

    it('should return amber for medium scores', () => {
      expect(component.getScoreColor(0.7)).toBe('#f59e0b');
    });

    it('should return red for low scores', () => {
      expect(component.getScoreColor(0.3)).toBe('#ef4444');
    });
  });

  describe('formatSec', () => {
    it('should format seconds correctly', () => {
      expect(component.formatSec(0)).toBe('0:00');
      expect(component.formatSec(59)).toBe('0:59');
      expect(component.formatSec(60)).toBe('1:00');
      expect(component.formatSec(125)).toBe('2:05');
    });

    it('should handle invalid inputs', () => {
      expect(component.formatSec(null as any)).toBe('0:00');
      expect(component.formatSec(undefined)).toBe('0:00');
      expect(component.formatSec(-1)).toBe('0:00');
      expect(component.formatSec(Infinity)).toBe('0:00');
    });
  });

  describe('getScoreRating', () => {
    it('should return correct ratings for different scores', () => {
      expect(component.getScoreRating(0.95)).toBe('Excellent! 🎉');
      expect(component.getScoreRating(0.8)).toBe('Great Job! 👏');
      expect(component.getScoreRating(0.65)).toBe('Good Effort 👍');
      expect(component.getScoreRating(0.45)).toBe('Keep Practicing 💪');
      expect(component.getScoreRating(0.2)).toBe('Needs Work 📚');
    });
  });

  describe('getScoreMessage', () => {
    it('should return appropriate messages for different scores', () => {
      expect(component.getScoreMessage(0.95)).toContain('Outstanding');
      expect(component.getScoreMessage(0.8)).toContain('Very good');
      expect(component.getScoreMessage(0.65)).toContain('Decent');
      expect(component.getScoreMessage(0.45)).toContain('Keep practicing');
      expect(component.getScoreMessage(0.2)).toContain('Significant improvements');
    });
  });

  describe('clamp01', () => {
    it('should clamp values between 0 and 1', () => {
      expect(component['clamp01'](-0.5)).toBe(0);
      expect(component['clamp01'](0.5)).toBe(0.5);
      expect(component['clamp01'](1.5)).toBe(1);
    });
  });

  describe('onFileSelected', () => {
    it('should handle file selection', () => {
      const mockFile = new File(['test'], 'test.wav', { type: 'audio/wav' });
      const mockEvent = {
        target: { files: [mockFile] }
      } as any;

      spyOn(URL, 'createObjectURL').and.returnValue('blob:test-url');

      component.onFileSelected(mockEvent);

      expect(component.audioBlob()).toBe(mockFile);
      expect(component.audioUrl()).toBe('blob:test-url');
      expect(mockStore.reset).toHaveBeenCalled();
    });
  });

  describe('submitForScoring', () => {
    it('should not submit without audio', () => {
      component.referenceText.set('test text');
      component.submitForScoring();
      expect(mockStore.analyze).not.toHaveBeenCalled();
    });

    it('should not submit without reference text', () => {
      const mockFile = new File(['test'], 'test.wav', { type: 'audio/wav' });
      component.audioBlob.set(mockFile);
      component.referenceText.set('');
      component.submitForScoring();
      expect(mockStore.analyze).not.toHaveBeenCalled();
    });

    it('should submit with valid data', () => {
      const mockFile = new File(['test'], 'test.wav', { type: 'audio/wav' });
      component.audioBlob.set(mockFile);
      component.referenceText.set('test text');
      component.languageCode.set('es-ES');

      component.submitForScoring();

      expect(mockStore.analyze).toHaveBeenCalledWith(mockFile, 'test text', 'es-ES');
    });
  });

  describe('resetForm', () => {
    it('should reset all form data', () => {
      component.referenceText.set('test');
      component.audioBlob.set(new File(['test'], 'test.wav'));
      component.audioUrl.set('blob:test-url');

      spyOn(URL, 'revokeObjectURL');

      component.resetForm();

      expect(component.referenceText()).toBe('');
      expect(component.audioBlob()).toBe(null);
      expect(component.audioUrl()).toBe(null);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test-url');
      expect(mockStore.reset).toHaveBeenCalled();
    });
  });
});
