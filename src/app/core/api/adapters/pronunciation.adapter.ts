import {
  PronunciationScore as ApiPronunciationScore,
  PronunciationEvaluationResult as ApiPronunciationEvaluation,
  DetailedAnalysisDto as ApiDetailedAnalysis,
  PauseDto as ApiPause,
  WordAnalysisDto as ApiWordAnalysis,
  PhonemeEvaluation as ApiPhoneme
} from '../../models/pronunciation.model';

import {
  PronunciationScore,
  PronunciationEvaluation,
  PronunciationAnalysis,
  Pause,
  WordAnalysis,
  PhonemeEvaluation
} from '../../models/domain/pronunciation.domain';

/**
 * Adapter for translating between API contracts and domain models
 * This layer isolates components from API changes
 */
export class PronunciationAdapter {
  /**
   * Convert API pronunciation score to domain model
   */
  static scoreToDomain(apiScore: ApiPronunciationScore): PronunciationScore {
    return {
      score: apiScore.score,
      transcribedText: apiScore.transcribedText,
      wordDetails: apiScore.wordDetails.map(word => ({
        word: word.word,
        confidence: word.confidence,
        isCorrect: word.isCorrect,
        expectedWord: word.expectedWord
      }))
    };
  }

  /**
   * Convert API pronunciation evaluation to domain model
   */
  static evaluationToDomain(apiEval: ApiPronunciationEvaluation): PronunciationEvaluation {
    return {
      transcript: apiEval.transcript,
      words: apiEval.words.map(word => ({
        word: word.word,
        startTime: word.startTime,
        endTime: word.endTime,
        evaluation: word.evaluation,
        phonemes: word.phonemes.map(this.phonemeToDomain)
      }))
    };
  }

  /**
   * Convert API detailed analysis to domain model
   */
  static detailedAnalysisToDomain(apiAnalysis: ApiDetailedAnalysis): PronunciationAnalysis {
    return {
      referenceText: apiAnalysis.referenceText,
      transcript: apiAnalysis.transcript,
      wer: apiAnalysis.wer,
      substitutions: apiAnalysis.substitutions,
      insertions: apiAnalysis.insertions,
      deletions: apiAnalysis.deletions,
      totalDuration: apiAnalysis.totalDurationSec,
      speechRateWpm: apiAnalysis.speechRateWpm,
      averageWordDuration: apiAnalysis.averageWordDurationSec,
      pauses: apiAnalysis.pauses.map(this.pauseToDomain),
      words: apiAnalysis.words.map(this.wordAnalysisToDomain)
    };
  }

  /**
   * Convert API pause to domain model
   */
  private static pauseToDomain(apiPause: ApiPause): Pause {
    return {
      startTime: apiPause.startTimeSec,
      endTime: apiPause.endTimeSec,
      duration: apiPause.durationSec,
      precedingWord: apiPause.precedingWord,
      followingWord: apiPause.followingWord
    };
  }

  /**
   * Convert API word analysis to domain model
   */
  private static wordAnalysisToDomain(apiWord: ApiWordAnalysis): WordAnalysis {
    return {
      index: apiWord.index,
      expected: apiWord.expected,
      actual: apiWord.actual,
      errorType: apiWord.errorType,
      startTime: apiWord.startTimeSec,
      endTime: apiWord.endTimeSec,
      duration: apiWord.durationSec,
      evaluation: apiWord.evaluation,
      phonemes: apiWord.phonemes?.map(this.phonemeToDomain)
    };
  }

  /**
   * Convert API phoneme evaluation to domain model
   */
  private static phonemeToDomain(apiPhoneme: ApiPhoneme): PhonemeEvaluation {
    return {
      phoneme: apiPhoneme.phoneme,
      startTime: apiPhoneme.startTime,
      endTime: apiPhoneme.endTime,
      evaluation: apiPhoneme.evaluation
    };
  }
}
