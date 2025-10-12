import { PronunciationAdapter } from './pronunciation.adapter';
import {
  PronunciationScore as ApiPronunciationScore,
  PronunciationEvaluationResult as ApiPronunciationEvaluation,
  DetailedAnalysisDto as ApiDetailedAnalysis,
} from '../../models/pronunciation.model';

describe('PronunciationAdapter', () => {
  it('should convert API score to domain model', () => {
    const apiScore: ApiPronunciationScore = {
      score: 0.85,
      transcribedText: 'hello world',
      wordDetails: [
        { word: 'hello', confidence: 0.9, isCorrect: true, expectedWord: null },
        { word: 'world', confidence: 0.8, isCorrect: true, expectedWord: null },
      ],
    };

    const result = PronunciationAdapter.scoreToDomain(apiScore);

    expect(result.score).toBe(0.85);
    expect(result.transcribedText).toBe('hello world');
    expect(result.wordDetails.length).toBe(2);
    expect(result.wordDetails[0].word).toBe('hello');
  });

  it('should convert API evaluation to domain model', () => {
    const apiEval: ApiPronunciationEvaluation = {
      transcript: 'hello world',
      words: [
        {
          word: 'hello',
          startTime: 0.0,
          endTime: 0.5,
          evaluation: 0.85,
          phonemes: [
            { phoneme: 'HH', startTime: 0.0, endTime: 0.1, evaluation: 0.9 },
          ],
        },
      ],
    };

    const result = PronunciationAdapter.evaluationToDomain(apiEval);

    expect(result.transcript).toBe('hello world');
    expect(result.words.length).toBe(1);
    expect(result.words[0].word).toBe('hello');
    expect(result.words[0].phonemes.length).toBe(1);
  });

  it('should convert API detailed analysis to domain model', () => {
    const apiAnalysis: ApiDetailedAnalysis = {
      referenceText: 'hello world',
      transcript: 'hello world',
      wer: 0.0,
      substitutions: 0,
      insertions: 0,
      deletions: 0,
      totalDurationSec: 1.5,
      speechRateWpm: 120,
      averageWordDurationSec: 0.75,
      pauses: [
        {
          startTimeSec: 0.5,
          endTimeSec: 0.7,
          durationSec: 0.2,
          precedingWord: 'hello',
          followingWord: 'world',
        },
      ],
      words: [
        {
          index: 0,
          expected: 'hello',
          actual: 'hello',
          errorType: 'MATCH',
          startTimeSec: 0.0,
          endTimeSec: 0.5,
          durationSec: 0.5,
          evaluation: 0.95,
        },
      ],
    };

    const result = PronunciationAdapter.detailedAnalysisToDomain(apiAnalysis);

    expect(result.referenceText).toBe('hello world');
    expect(result.wer).toBe(0.0);
    expect(result.totalDuration).toBe(1.5);
    expect(result.speechRateWpm).toBe(120);
    expect(result.pauses.length).toBe(1);
    expect(result.pauses[0].startTime).toBe(0.5);
    expect(result.pauses[0].endTime).toBe(0.7);
    expect(result.pauses[0].duration).toBe(0.2);
    expect(result.words.length).toBe(1);
    expect(result.words[0].startTime).toBe(0.0);
    expect(result.words[0].endTime).toBe(0.5);
    expect(result.words[0].duration).toBe(0.5);
  });
});
