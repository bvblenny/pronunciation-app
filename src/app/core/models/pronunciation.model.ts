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

// ===============================
// Prosody Models (from OpenAPI)
// ===============================
export interface PitchPoint {
  timeSec: number;
  frequencyHz: number;
  voiced: boolean;
}

export interface EnergyPoint {
  timeSec: number;
  energy: number;
}

export interface WordTiming {
  word: string;
  startSec: number;
  endSec: number;
  syllableCount: number;
  stressed: boolean;
}

export interface PauseRegion {
  startSec: number;
  endSec: number;
  filled: boolean;
}

export interface ProsodyFeatures {
  duration: number;
  pitchContour: PitchPoint[];
  energyContour: EnergyPoint[];
  wordTimings: WordTiming[];
  pauseRegions: PauseRegion[];
}

export interface RhythmMetrics {
  syllableTimingVariance: number;
  expectedVariance: number;
  isochronyIndex: number;
  interpretation: string;
}

export interface IntonationMetrics {
  pitchRangeHz: number;
  pitchVariationCoefficient: number;
  meanPitchHz: number;
  contourSmoothness: number;
  interpretation: string;
}

export interface StressMetrics {
  stressedSyllableCount: number;
  expectedStressCount: number;
  stressPlacementAccuracy: number;
  energyContrastRatio: number;
  interpretation: string;
}

export interface PacingMetrics {
  syllablesPerSecond: number;
  wordsPerMinute: number;
  optimalRangeMin: number;
  optimalRangeMax: number;
  interpretation: string;
}

export interface FluencyMetrics {
  pauseCount: number;
  longPauseCount: number;
  filledPauseCount: number;
  averagePauseDurationSec: number;
  disfluencyRate: number;
  interpretation: string;
}

export interface ProsodyDiagnostics {
  rhythmMetrics: RhythmMetrics;
  intonationMetrics: IntonationMetrics;
  stressMetrics: StressMetrics;
  pacingMetrics: PacingMetrics;
  fluencyMetrics: FluencyMetrics;
}

export type ProsodyFeedbackCategory = 'RHYTHM' | 'INTONATION' | 'STRESS' | 'PACING' | 'FLUENCY' | 'OVERALL';
export type ProsodyFeedbackSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface ProsodyFeedback {
  category: ProsodyFeedbackCategory;
  severity: ProsodyFeedbackSeverity;
  message: string;
  suggestion: string;
}

export type ProsodyModelType = 'HEURISTIC' | 'CALIBRATED' | 'ML_BASED';

export interface ProsodyMetadata {
  scorerVersion: string;
  modelType: ProsodyModelType;
  referenceLanguage: string;
  processingTimestamp: number; // epoch millis
}

export interface ProsodySubScores {
  rhythm: number;
  intonation: number;
  stress: number;
  pacing: number;
  fluency: number;
}

export interface ProsodyScoreDto {
  overallScore: number;
  subScores: ProsodySubScores;
  diagnostics: ProsodyDiagnostics;
  feedback: ProsodyFeedback[];
  features: ProsodyFeatures;
  metadata: ProsodyMetadata;
}
