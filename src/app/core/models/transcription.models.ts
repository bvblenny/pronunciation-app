/**
 * Transcription feature models
 * Shared type definitions for transcription functionality
 */

/**
 * Represents a transcribed text segment with timestamp
 */
export interface TranscriptSegment {
  text: string;
  at: number;
}

/**
 * Data structure for individual text segments (words or sentences)
 */
export interface SegmentData {
  text: string;
  type: 'word' | 'sentence';
  index: number;
  metadata?: any;
}

/**
 * Content structure for overlay/detail view
 */
export interface OverlayContent {
  title?: string;
  description?: string;
  metadata?: any;
  customData?: any;
}

/**
 * State of speech recognition
 */
export interface SpeechRecognitionState {
  isSupported: boolean;
  isListening: boolean;
  segments: TranscriptSegment[];
  interim: string;
  error: string | null;
}

/**
 * State of file transcription
 */
export interface FileTranscriptionState {
  isTranscribing: boolean;
  error: string | null;
}

