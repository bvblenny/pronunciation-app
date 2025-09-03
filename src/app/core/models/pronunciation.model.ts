export interface PhonemeEvaluation {
  phoneme: string;
  startTime: number;
  endTime: number;
  evaluation: number;
}

export interface WordEvaluation {
  word: string;
  startTime: number;
  endTime: number;
  evaluation: number;
  phonemes: PhonemeEvaluation[];
}

export interface PronunciationEvaluationResult {
  transcript: string;
  words: WordEvaluation[];
}

export interface PronunciationScore {
  score: number;
  transcribedText: string;
  wordDetails: WordDetail[];
}

export interface WordDetail {
  word: string;
  confidence: number;
  isCorrect: boolean;
  expectedWord: string | null;
}

// New models aligned with DetailedAnalysisDto from backend
export type WordErrorType = 'MATCH' | 'SUBSTITUTION' | 'INSERTION' | 'DELETION';

export interface PauseDto {
  startTimeSec: number;
  endTimeSec: number;
  durationSec: number;
  precedingWord?: string;
  followingWord?: string;
}

export interface WordAnalysisDto {
  index: number;
  expected?: string;
  actual?: string;
  errorType: WordErrorType;
  startTimeSec?: number;
  endTimeSec?: number;
  durationSec?: number;
  evaluation?: number;
  phonemes?: PhonemeEvaluation[];
}

export interface DetailedAnalysisDto {
  referenceText: string;
  transcript: string;
  wer: number;
  substitutions: number;
  insertions: number;
  deletions: number;
  totalDurationSec?: number;
  speechRateWpm?: number;
  averageWordDurationSec?: number;
  pauses: PauseDto[];
  words: WordAnalysisDto[];
}
