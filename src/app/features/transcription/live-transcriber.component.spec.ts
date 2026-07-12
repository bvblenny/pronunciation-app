import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';

import { LiveTranscriberComponent } from './live-transcriber.component';
import { PronunciationService, SubtitleService } from '../../core';
import { TranscriptionResponse } from '../../core';

describe('LiveTranscriberComponent', () => {
  let component: LiveTranscriberComponent;
  let fixture: ComponentFixture<LiveTranscriberComponent>;
  let mockPronunciationService: jasmine.SpyObj<PronunciationService>;
  let mockSubtitleService: jasmine.SpyObj<SubtitleService>;

  beforeEach(async () => {
    const pronunciationServiceSpy = jasmine.createSpyObj('PronunciationService', ['transcribeAudio'], {
      getLanguagesSignal: jasmine.createSpy().and.returnValue(signal([
        { code: 'en-US', name: 'English (US)' },
        { code: 'es-ES', name: 'Spanish' }
      ]))
    });

    const subtitleServiceSpy = jasmine.createSpyObj('SubtitleService', ['generateSubtitles', 'getFormatInfo']);

    // Mock SpeechRecognition API
    const mockSpeechRecognition = jasmine.createSpyObj('SpeechRecognition', ['start', 'stop'], {
      continuous: true,
      interimResults: true,
      lang: 'en-US',
      onresult: null,
      onerror: null,
      onend: null
    });

    spyOn(window as any, 'SpeechRecognition').and.returnValue(mockSpeechRecognition);
    spyOn(window as any, 'webkitSpeechRecognition').and.returnValue(mockSpeechRecognition);

    await TestBed.configureTestingModule({
      imports: [
        LiveTranscriberComponent,
        FormsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatProgressBarModule,
        MatTooltipModule,
        MatMenuModule
      ],
      providers: [
        { provide: PronunciationService, useValue: pronunciationServiceSpy },
        { provide: SubtitleService, useValue: subtitleServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LiveTranscriberComponent);
    component = fixture.componentInstance;
    mockPronunciationService = TestBed.inject(PronunciationService) as jasmine.SpyObj<PronunciationService>;
    mockSubtitleService = TestBed.inject(SubtitleService) as jasmine.SpyObj<SubtitleService>;
    // Don't call detectChanges() to avoid template rendering issues
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.languageCode()).toBe('en-US');
    expect(component.isSupported()).toBe(true);
    expect(component.isListening()).toBe(false);
    expect(component.interim()).toBe('');
    expect(component.segments()).toEqual([]);
    expect(component.errorMessage()).toBe(null);
    expect(component.isTranscribing()).toBe(false);
    expect(component.lastTranscription()).toBe(null);
  });

  describe('fullTranscript computed signal', () => {
    it('should combine segments and interim text', () => {
      component.segments.set([
        { text: 'Hello', at: 1000 },
        { text: 'world', at: 2000 }
      ]);
      component.interim.set('how are you');

      expect(component.fullTranscript()).toBe('Hello world how are you');
    });

    it('should handle empty interim text', () => {
      component.segments.set([
        { text: 'Hello', at: 1000 },
        { text: 'world', at: 2000 }
      ]);
      component.interim.set('');

      expect(component.fullTranscript()).toBe('Hello world');
    });
  });

  describe('hasSubtitleData computed signal', () => {
    it('should return false when no transcription', () => {
      component.lastTranscription.set(null);
      expect(component.hasSubtitleData()).toBe(false);
    });

    it('should return false when transcription has no segments', () => {
      const mockTranscription: TranscriptionResponse = {
        transcript: 'test',
        segments: []
      };
      component.lastTranscription.set(mockTranscription);
      expect(component.hasSubtitleData()).toBe(false);
    });

    it('should return true when transcription has segments', () => {
      const mockTranscription: TranscriptionResponse = {
        transcript: 'test',
        segments: [{ text: 'test', startMs: 0, endMs: 1000 }]
      };
      component.lastTranscription.set(mockTranscription);
      expect(component.hasSubtitleData()).toBe(true);
    });

    it('should return true when live segments exist without api transcription', () => {
      component.lastTranscription.set(null);
      component.segments.set([{ text: 'live segment', at: 0 }]);
      expect(component.hasSubtitleData()).toBe(true);
    });
  });

  describe('formatMs', () => {
    it('should format milliseconds correctly', () => {
      expect(component.formatMs(0)).toBe('0:00');
      expect(component.formatMs(59000)).toBe('0:59');
      expect(component.formatMs(60000)).toBe('1:00');
      expect(component.formatMs(125000)).toBe('2:05');
    });

    it('should convert seconds to milliseconds when value is small', () => {
      expect(component.formatMs(59)).toBe('0:59'); // 59 seconds = 59000 ms
      expect(component.formatMs(125)).toBe('2:05'); // 125 seconds = 125000 ms
    });

    it('should handle invalid inputs', () => {
      expect(component.formatMs(null as any)).toBe('0:00');
      expect(component.formatMs(undefined as any)).toBe('0:00');
      expect(component.formatMs(-1)).toBe('0:00');
      expect(component.formatMs(Infinity)).toBe('0:00');
    });
  });

  describe('onFileSelected', () => {
    it('should handle successful transcription', async () => {
      const mockFile = new File(['test'], 'test.wav', { type: 'audio/wav' });
      const mockEvent = {
        target: { files: [mockFile] }
      } as any;

      const mockResponse: TranscriptionResponse = {
        transcript: 'Hello world',
        segments: [
          { text: 'Hello', startMs: 0, endMs: 1000 },
          { text: 'world', startMs: 1000, endMs: 2000 }
        ]
      };

      mockPronunciationService.transcribeAudio.and.returnValue(of(mockResponse));

      component.onFileSelected(mockEvent);

      expect(component.errorMessage()).toBe(null);

      // Wait for async operation
      await fixture.whenStable();

      expect(component.isTranscribing()).toBe(false);
      expect(component.segments()).toEqual([
        { text: 'Hello', at: 0 },
        { text: 'world', at: 1000 }
      ]);
      expect(component.interim()).toBe('');
      expect(component.lastTranscription()).toBe(mockResponse);
    });

    it('should handle transcription with no segments', async () => {
      const mockFile = new File(['test'], 'test.wav', { type: 'audio/wav' });
      const mockEvent = {
        target: { files: [mockFile] }
      } as any;

      const mockResponse: TranscriptionResponse = {
        transcript: 'Hello world',
        segments: undefined
      };

      mockPronunciationService.transcribeAudio.and.returnValue(of(mockResponse));

      component.onFileSelected(mockEvent);

      await fixture.whenStable();

      expect(component.segments()).toEqual([
        { text: 'Hello world', at: 0 }
      ]);
    });

    it('should handle transcription error', async () => {
      const mockFile = new File(['test'], 'test.wav', { type: 'audio/wav' });
      const mockEvent = {
        target: { files: [mockFile] }
      } as any;

      const mockError = { status: 400 };
      mockPronunciationService.transcribeAudio.and.returnValue(throwError(() => mockError));

      component.onFileSelected(mockEvent);

      await fixture.whenStable();

      expect(component.isTranscribing()).toBe(false);
      expect(component.errorMessage()).toBe('Invalid or unsupported media. Please upload a valid audio/video file.');
    });

    it('should handle file too large error', async () => {
      const mockFile = new File(['test'], 'test.wav', { type: 'audio/wav' });
      const mockEvent = {
        target: { files: [mockFile] }
      } as any;

      const mockError = { status: 413 };
      mockPronunciationService.transcribeAudio.and.returnValue(throwError(() => mockError));

      component.onFileSelected(mockEvent);

      await fixture.whenStable();

      expect(component.errorMessage()).toBe('File too large. Please upload a smaller file.');
    });
  });

  describe('downloadSubtitles', () => {
    it('should download subtitles successfully', () => {
      const mockTranscription: TranscriptionResponse = {
        transcript: 'Hello world',
        segments: [
          { text: 'Hello', startMs: 0, endMs: 1000 },
          { text: 'world', startMs: 1000, endMs: 2000 }
        ]
      };

      const mockBlob = new Blob(['test content'], { type: 'text/vtt' });
      const mockFormatInfo = {
        extension: 'vtt',
        mimeType: 'text/vtt',
        displayName: 'WebVTT (.vtt)'
      };

      component.lastTranscription.set(mockTranscription);
      mockSubtitleService.generateSubtitles.and.returnValue(mockBlob);
      mockSubtitleService.getFormatInfo.and.returnValue(mockFormatInfo);

      spyOn(URL, 'createObjectURL').and.returnValue('blob:test-url');
      spyOn(URL, 'revokeObjectURL');
      spyOn(document, 'createElement').and.returnValue({
        href: '',
        download: '',
        click: jasmine.createSpy(),
        style: {}
      } as any);
      spyOn(document.body, 'appendChild');
      spyOn(document.body, 'removeChild');

      component.downloadSubtitles('vtt');

      expect(mockSubtitleService.generateSubtitles).toHaveBeenCalledWith(mockTranscription.segments!, 'vtt');
      expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test-url');
    });

    it('should not download when no transcription data', () => {
      component.segments.set([]);
      component.lastTranscription.set(null);
      component.downloadSubtitles('vtt');
      expect(mockSubtitleService.generateSubtitles).not.toHaveBeenCalled();
    });

    it('should download subtitles from live segments when transcription payload is unavailable', () => {
      component.lastTranscription.set(null);
      component.segments.set([
        { text: 'Hello', at: 0 },
        { text: 'world', at: 1200 }
      ]);

      const mockBlob = new Blob(['test content'], { type: 'text/vtt' });
      const mockFormatInfo = {
        extension: 'vtt',
        mimeType: 'text/vtt',
        displayName: 'WebVTT (.vtt)'
      };

      mockSubtitleService.generateSubtitles.and.returnValue(mockBlob);
      mockSubtitleService.getFormatInfo.and.returnValue(mockFormatInfo);

      spyOn(URL, 'createObjectURL').and.returnValue('blob:test-url');
      spyOn(URL, 'revokeObjectURL');
      spyOn(document, 'createElement').and.returnValue({
        href: '',
        download: '',
        click: jasmine.createSpy(),
        style: {}
      } as any);
      spyOn(document.body, 'appendChild');
      spyOn(document.body, 'removeChild');

      component.downloadSubtitles('vtt');

      expect(mockSubtitleService.generateSubtitles).toHaveBeenCalled();
      const generatedSegments = mockSubtitleService.generateSubtitles.calls.mostRecent().args[0];
      expect(generatedSegments.length).toBe(2);
      expect(generatedSegments[0].text).toBe('Hello');
      expect(generatedSegments[0].startMs).toBe(0);
      expect(generatedSegments[0].endMs).toBe(1200);
    });

    it('should handle subtitle generation errors', () => {
      const mockTranscription: TranscriptionResponse = {
        transcript: 'Hello world',
        segments: [{ text: 'Hello', startMs: 0, endMs: 1000 }]
      };

      component.lastTranscription.set(mockTranscription);
      mockSubtitleService.generateSubtitles.and.throwError('Generation failed');

      spyOn(console, 'error');

      component.downloadSubtitles('vtt');

      expect(component.errorMessage()).toBe('Failed to generate subtitles. Please try again.');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('clear', () => {
    it('should clear all transcription data', () => {
      component.segments.set([{ text: 'test', at: 1000 }]);
      component.interim.set('interim text');
      component.lastTranscription.set({
        transcript: 'test',
        segments: [{ text: 'test', startMs: 0, endMs: 1000 }]
      });

      component.clear();

      expect(component.segments()).toEqual([]);
      expect(component.interim()).toBe('');
      expect(component.lastTranscription()).toBeNull();
    });
  });

  describe('copy', () => {
    it('should copy transcript to clipboard', () => {
      component.segments.set([{ text: 'Hello world', at: 0 }]);
      component.interim.set('how are you');

      spyOn(navigator.clipboard, 'writeText');

      component.copy();

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Hello world how are you');
    });
  });

  describe('speak', () => {
    it('should speak the provided text', () => {
      spyOn(window.speechSynthesis, 'speak');

      component.speak('Hello world');

      expect(window.speechSynthesis.speak).toHaveBeenCalled();
      const utterance = (window.speechSynthesis.speak as jasmine.Spy).calls.argsFor(0)[0];
      expect(utterance.text).toBe('Hello world');
      expect(utterance.lang).toBe('en-US');
    });
  });
});
