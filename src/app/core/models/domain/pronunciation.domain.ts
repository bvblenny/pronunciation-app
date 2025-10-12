/**
 * Domain models for pronunciation feature
 * These models represent the application's business logic view of data
 * They are independent of API contracts and can evolve separately
 */

export type WordErrorType = 'MATCH' | 'SUBSTITUTION' | 'INSERTION' | 'DELETION';

export interface PhonemeEvaluation {
  phoneme: string;
  startTime: number;
  endTime: number;
  evaluation: number;
}

export interface WordAnalysis {
  index: number;
  expected?: string;
  actual?: string;
  errorType: WordErrorType;
  startTime?: number;
  endTime?: number;
  duration?: number;
  evaluation?: number;
  phonemes?: PhonemeEvaluation[];
}

export interface Pause {
  startTime: number;
  endTime: number;
  duration: number;
  precedingWord?: string;
  followingWord?: string;
}

export interface PronunciationAnalysis {
  referenceText: string;
  transcript: string;
  wer: number;
  substitutions: number;
  insertions: number;
  deletions: number;
  totalDuration?: number;
  speechRateWpm?: number;
  averageWordDuration?: number;
  pauses: Pause[];
  words: WordAnalysis[];
}

export interface WordDetail {
  word: string;
  confidence: number;
  isCorrect: boolean;
  expectedWord: string | null;
}

export interface PronunciationScore {
  score: number;
  transcribedText: string;
  wordDetails: WordDetail[];
}

export interface WordEvaluation {
  word: string;
  startTime: number;
  endTime: number;
  evaluation: number;
  phonemes: PhonemeEvaluation[];
}

export interface PronunciationEvaluation {
  transcript: string;
  words: WordEvaluation[];
}
