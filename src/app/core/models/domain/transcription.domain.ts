/**
 * Domain models for transcription feature
 * These models represent the application's business logic view of data
 * They are independent of API contracts and can evolve separately
 */

export interface TranscriptionLanguage {
  code: string;
  name: string;
}

export interface TranscriptionSegment {
  text: string;
  startMs: number;
  endMs: number;
}

export interface TranscriptionResult {
  transcript: string;
  segments?: TranscriptionSegment[];
}
