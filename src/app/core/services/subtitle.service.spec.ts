import { TestBed } from '@angular/core/testing';
import { SubtitleService } from './subtitle.service';
import { TranscriptionSegment } from '../api';

describe('SubtitleService', () => {
  let service: SubtitleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubtitleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('generateSubtitles', () => {
    const mockSegments: TranscriptionSegment[] = [
      { text: 'Hello world', startMs: 0, endMs: 2500 },
      { text: 'How are you?', startMs: 3000, endMs: 5500 }
    ];

    it('should generate SRT format', () => {
      const blob = service.generateSubtitles(mockSegments, 'srt');
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/x-subrip');

      const content = blob.text();
      content.then(text => {
        expect(text).toContain('1');
        expect(text).toContain('00:00:00,000 --> 00:00:02,500');
        expect(text).toContain('Hello world');
        expect(text).toContain('2');
        expect(text).toContain('00:00:03,000 --> 00:00:05,500');
        expect(text).toContain('How are you?');
      });
    });

    it('should generate VTT format', () => {
      const blob = service.generateSubtitles(mockSegments, 'vtt');
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('text/vtt');

      const content = blob.text();
      content.then(text => {
        expect(text).toContain('WEBVTT');
        expect(text).toContain('00:00:00.000 --> 00:00:02.500');
        expect(text).toContain('Hello world');
        expect(text).toContain('00:00:03.000 --> 00:00:05.500');
        expect(text).toContain('How are you?');
      });
    });

    it('should generate TXT format', () => {
      const blob = service.generateSubtitles(mockSegments, 'txt');
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('text/plain');

      const content = blob.text();
      content.then(text => {
        expect(text).toContain('[00:00] Hello world');
        expect(text).toContain('[00:03] How are you?');
      });
    });

    it('should handle empty segments array', () => {
      const blob = service.generateSubtitles([], 'srt');
      expect(blob).toBeInstanceOf(Blob);

      const content = blob.text();
      content.then(text => {
        expect(text).toBe('');
      });
    });

    it('should handle null/undefined segments', () => {
      const blob = service.generateSubtitles(null as any, 'srt');
      expect(blob).toBeInstanceOf(Blob);

      const content = blob.text();
      content.then(text => {
        expect(text).toBe('');
      });
    });
  });

  describe('getFormatInfo', () => {
    it('should return correct info for SRT format', () => {
      const info = service.getFormatInfo('srt');
      expect(info.extension).toBe('srt');
      expect(info.mimeType).toBe('application/x-subrip');
      expect(info.displayName).toBe('SubRip (.srt)');
    });

    it('should return correct info for VTT format', () => {
      const info = service.getFormatInfo('vtt');
      expect(info.extension).toBe('vtt');
      expect(info.mimeType).toBe('text/vtt');
      expect(info.displayName).toBe('WebVTT (.vtt)');
    });

    it('should return correct info for TXT format', () => {
      const info = service.getFormatInfo('txt');
      expect(info.extension).toBe('txt');
      expect(info.mimeType).toBe('text/plain');
      expect(info.displayName).toBe('Plain Text (.txt)');
    });
  });
});
