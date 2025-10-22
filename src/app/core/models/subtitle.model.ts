/**
 * Subtitle-related models and types
 */

export type SubtitleFormat = 'srt' | 'vtt' | 'txt';

export interface SubtitleSegment {
  index: number;
  startMs: number;
  endMs: number;
  text: string;
}

export interface SubtitleOptions {
  format: SubtitleFormat;
  maxCharsPerLine?: number;
  maxLinesPerSubtitle?: number;
}

export interface SubtitleGenerationResult {
  content: string;
  format: SubtitleFormat;
  segmentCount: number;
  filename: string;
}

