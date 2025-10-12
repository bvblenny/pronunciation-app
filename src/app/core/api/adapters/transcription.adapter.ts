import {
  TranscriptionResponse as ApiTranscriptionResponse,
  TranscriptionSegment as ApiTranscriptionSegment,
  TranscriptionLanguage as ApiTranscriptionLanguage
} from '../../services/pronunciation.service';

import {
  TranscriptionResult,
  TranscriptionSegment,
  TranscriptionLanguage
} from '../../models/domain/transcription.domain';

/**
 * Adapter for translating between API contracts and domain models for transcription
 * This layer isolates components from API changes
 */
export class TranscriptionAdapter {
  /**
   * Convert API transcription response to domain model
   */
  static resultToDomain(apiResponse: ApiTranscriptionResponse): TranscriptionResult {
    return {
      transcript: apiResponse.transcript,
      segments: apiResponse.segments?.map(this.segmentToDomain)
    };
  }

  /**
   * Convert API transcription segment to domain model
   */
  private static segmentToDomain(apiSegment: ApiTranscriptionSegment): TranscriptionSegment {
    return {
      text: apiSegment.text,
      startMs: apiSegment.startMs,
      endMs: apiSegment.endMs
    };
  }

  /**
   * Convert API transcription language to domain model
   */
  static languageToDomain(apiLanguage: ApiTranscriptionLanguage): TranscriptionLanguage {
    return {
      code: apiLanguage.code,
      name: apiLanguage.name
    };
  }

  /**
   * Convert array of API languages to domain models
   */
  static languagesToDomain(apiLanguages: ApiTranscriptionLanguage[]): TranscriptionLanguage[] {
    return apiLanguages.map(this.languageToDomain);
  }
}
