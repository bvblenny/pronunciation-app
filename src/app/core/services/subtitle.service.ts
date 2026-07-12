import { Injectable } from '@angular/core';
import { TranscriptionSegment } from '../api';
import { SubtitleFormat, SubtitleOptions } from '../models';

/**
 * Subtitle format metadata
 */
export interface SubtitleFormatInfo {
  extension: string;
  mimeType: string;
  displayName: string;
}

/**
 * Supported subtitle formats
 */
export const SUBTITLE_FORMATS: Record<SubtitleFormat, SubtitleFormatInfo> = {
  srt: {
    extension: 'srt',
    mimeType: 'application/x-subrip',
    displayName: 'SubRip (.srt)'
  },
  vtt: {
    extension: 'vtt',
    mimeType: 'text/vtt',
    displayName: 'WebVTT (.vtt)'
  },
  txt: {
    extension: 'txt',
    mimeType: 'text/plain',
    displayName: 'Plain Text (.txt)'
  }
};

/**
 * Subtitle Service
 * Handles subtitle generation and format conversion from transcription data
 */
@Injectable({
  providedIn: 'root'
})
export class SubtitleService {
  private readonly defaultOptions: Required<Pick<SubtitleOptions, 'maxCharsPerLine' | 'maxLinesPerSubtitle'>> = {
    maxCharsPerLine: 42,
    maxLinesPerSubtitle: 2
  };

  /**
   * Generate subtitles blob from transcription segments
   */
  generateSubtitles(
    segments: TranscriptionSegment[],
    format: SubtitleFormat,
    options?: Partial<SubtitleOptions>
  ): Blob {
    const content = this.generateContent(segments, format, options);
    const formatInfo = SUBTITLE_FORMATS[format];
    return new Blob([content], { type: formatInfo.mimeType });
  }

  /**
   * Generate subtitle content based on format
   */
  private generateContent(
    segments: TranscriptionSegment[],
    format: SubtitleFormat,
    options?: Partial<SubtitleOptions>
  ): string {
    const normalizedSegments = this.normalizeSegments(segments);
    if (normalizedSegments.length === 0) {
      return '';
    }

    const cues = this.buildCues(normalizedSegments, options);

    switch (format) {
      case 'srt':
        return this.generateSRT(cues);
      case 'vtt':
        return this.generateVTT(cues);
      case 'txt':
        return this.generateTXT(cues);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Generate SRT format
   * Format:
   * 1
   * 00:00:00,000 --> 00:00:02,500
   * Text content
   */
  private generateSRT(segments: TranscriptionSegment[]): string {
    return segments.map((seg, idx) => {
      const start = this.formatSRTTime(seg.startMs);
      const end = this.formatSRTTime(seg.endMs);
      return `${idx + 1}\n${start} --> ${end}\n${seg.text}\n`;
    }).join('\n');
  }

  /**
   * Generate WebVTT format
   * Format:
   * WEBVTT
   *
   * 00:00:00.000 --> 00:00:02.500
   * Text content
   */
  private generateVTT(segments: TranscriptionSegment[]): string {
    const header = 'WEBVTT\n\n';
    const content = segments.map(seg => {
      const start = this.formatVTTTime(seg.startMs);
      const end = this.formatVTTTime(seg.endMs);
      return `${start} --> ${end}\n${seg.text}\n`;
    }).join('\n');
    return header + content;
  }

  /**
   * Generate plain text format with timestamps
   */
  private generateTXT(segments: TranscriptionSegment[]): string {
    return segments.map(seg => {
      const timestamp = this.formatReadableTime(seg.startMs);
      return `[${timestamp}] ${seg.text.replace(/\n/g, ' ')}`;
    }).join('\n');
  }

  private normalizeSegments(segments: TranscriptionSegment[] | null | undefined): TranscriptionSegment[] {
    if (!segments?.length) {
      return [];
    }

    const cleaned = segments
      .map(seg => {
        const text = (seg?.text ?? '').replace(/\s+/g, ' ').trim();
        if (!text) return null;

        let startMs = this.toNonNegativeInt(seg.startMs);
        let endMs = this.toNonNegativeInt(seg.endMs);

        if (endMs <= startMs) {
          endMs = startMs + 1000;
        }

        return { text, startMs, endMs };
      })
      .filter((seg): seg is TranscriptionSegment => seg !== null)
      .sort((a, b) => a.startMs - b.startMs || a.endMs - b.endMs);

    for (let i = 1; i < cleaned.length; i++) {
      const prev = cleaned[i - 1];
      const current = cleaned[i];
      if (current.startMs < prev.endMs) {
        current.startMs = prev.endMs;
      }
      if (current.endMs <= current.startMs) {
        current.endMs = current.startMs + 500;
      }
    }

    return cleaned;
  }

  private buildCues(
    segments: TranscriptionSegment[],
    options?: Partial<SubtitleOptions>
  ): TranscriptionSegment[] {
    const maxCharsPerLine = this.resolvePositiveInt(options?.maxCharsPerLine, this.defaultOptions.maxCharsPerLine);
    const maxLinesPerSubtitle = this.resolvePositiveInt(options?.maxLinesPerSubtitle, this.defaultOptions.maxLinesPerSubtitle);

    const cues: TranscriptionSegment[] = [];

    for (const segment of segments) {
      const lines = this.wrapText(segment.text, maxCharsPerLine);
      const chunks: string[] = [];
      for (let i = 0; i < lines.length; i += maxLinesPerSubtitle) {
        chunks.push(lines.slice(i, i + maxLinesPerSubtitle).join('\n'));
      }

      const texts = chunks.length ? chunks : [segment.text];
      const duration = Math.max(segment.endMs - segment.startMs, 500);
      const step = Math.max(Math.floor(duration / texts.length), 200);

      texts.forEach((text, idx) => {
        const startMs = segment.startMs + idx * step;
        const endMs = idx === texts.length - 1 ? segment.endMs : Math.min(segment.endMs, startMs + step);
        cues.push({
          text,
          startMs,
          endMs: endMs > startMs ? endMs : startMs + 200
        });
      });
    }

    return cues;
  }

  private wrapText(text: string, maxChars: number): string[] {
    return text
      .split('\n')
      .flatMap(part => this.wrapLine(part.trim(), maxChars))
      .filter(Boolean);
  }

  private wrapLine(line: string, maxChars: number): string[] {
    if (!line) return [];
    if (line.length <= maxChars) return [line];

    const words = line.split(/\s+/).filter(Boolean);
    const hasWordBoundaries = words.length > 1;

    if (!hasWordBoundaries) {
      const chunks: string[] = [];
      for (let i = 0; i < line.length; i += maxChars) {
        chunks.push(line.slice(i, i + maxChars));
      }
      return chunks;
    }

    const lines: string[] = [];
    let current = '';

    for (const word of words) {
      if (word.length > maxChars) {
        if (current) {
          lines.push(current);
          current = '';
        }
        for (let i = 0; i < word.length; i += maxChars) {
          lines.push(word.slice(i, i + maxChars));
        }
        continue;
      }

      const next = current ? `${current} ${word}` : word;
      if (next.length > maxChars) {
        lines.push(current);
        current = word;
      } else {
        current = next;
      }
    }

    if (current) {
      lines.push(current);
    }

    return lines;
  }

  /**
   * Format time for SRT (HH:MM:SS,mmm)
   */
  private formatSRTTime(ms: number): string {
    const normalizedMs = this.toNonNegativeInt(ms);
    const totalSeconds = Math.floor(normalizedMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = normalizedMs % 1000;

    return `${this.pad(hours, 2)}:${this.pad(minutes, 2)}:${this.pad(seconds, 2)},${this.pad(milliseconds, 3)}`;
  }

  /**
   * Format time for WebVTT (HH:MM:SS.mmm)
   */
  private formatVTTTime(ms: number): string {
    return this.formatSRTTime(ms).replace(',', '.');
  }

  /**
   * Format time for human reading (MM:SS)
   */
  private formatReadableTime(ms: number): string {
    const totalSeconds = Math.floor(this.toNonNegativeInt(ms) / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${this.pad(minutes, 2)}:${this.pad(seconds, 2)}`;
  }

  private toNonNegativeInt(value: number): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return 0;
    return Math.max(0, Math.floor(parsed));
  }

  private resolvePositiveInt(value: number | undefined, fallback: number): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
    return Math.floor(parsed);
  }

  /**
   * Pad number with leading zeros
   */
  private pad(num: number, size: number): string {
    return num.toString().padStart(size, '0');
  }

  /**
   * Get format info for a subtitle format
   */
  getFormatInfo(format: SubtitleFormat): SubtitleFormatInfo {
    return SUBTITLE_FORMATS[format];
  }
}
