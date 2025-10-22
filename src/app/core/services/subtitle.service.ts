import { Injectable } from '@angular/core';
import { TranscriptionSegment } from '../api';
import { SubtitleFormat } from '../models';

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

  /**
   * Generate subtitles blob from transcription segments
   */
  generateSubtitles(segments: TranscriptionSegment[], format: SubtitleFormat): Blob {
    const content = this.generateContent(segments, format);
    const formatInfo = SUBTITLE_FORMATS[format];
    return new Blob([content], { type: formatInfo.mimeType });
  }

  /**
   * Generate subtitle content based on format
   */
  private generateContent(segments: TranscriptionSegment[], format: SubtitleFormat): string {
    if (!segments || segments.length === 0) {
      return '';
    }

    switch (format) {
      case 'srt':
        return this.generateSRT(segments);
      case 'vtt':
        return this.generateVTT(segments);
      case 'txt':
        return this.generateTXT(segments);
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
      return `[${timestamp}] ${seg.text}`;
    }).join('\n');
  }

  /**
   * Format time for SRT (HH:MM:SS,mmm)
   */
  private formatSRTTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = ms % 1000;

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
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${this.pad(minutes, 2)}:${this.pad(seconds, 2)}`;
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
