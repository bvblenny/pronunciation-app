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
