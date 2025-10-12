import { TranscriptionAdapter } from './transcription.adapter';
import {
  TranscriptionResponse as ApiTranscriptionResponse,
  TranscriptionLanguage as ApiTranscriptionLanguage,
} from '../../services/pronunciation.service';

describe('TranscriptionAdapter', () => {
  it('should convert API transcription response to domain model', () => {
    const apiResponse: ApiTranscriptionResponse = {
      transcript: 'hello world',
      segments: [
        { text: 'hello', startMs: 0, endMs: 500 },
        { text: 'world', startMs: 500, endMs: 1000 },
      ],
    };

    const result = TranscriptionAdapter.resultToDomain(apiResponse);

    expect(result.transcript).toBe('hello world');
    expect(result.segments?.length).toBe(2);
    expect(result.segments?.[0].text).toBe('hello');
    expect(result.segments?.[0].startMs).toBe(0);
  });

  it('should convert API language to domain model', () => {
    const apiLanguage: ApiTranscriptionLanguage = {
      code: 'en-US',
      name: 'English (US)',
    };

    const result = TranscriptionAdapter.languageToDomain(apiLanguage);

    expect(result.code).toBe('en-US');
    expect(result.name).toBe('English (US)');
  });

  it('should convert array of API languages to domain models', () => {
    const apiLanguages: ApiTranscriptionLanguage[] = [
      { code: 'en-US', name: 'English (US)' },
      { code: 'es-ES', name: 'Spanish' },
    ];

    const result = TranscriptionAdapter.languagesToDomain(apiLanguages);

    expect(result.length).toBe(2);
    expect(result[0].code).toBe('en-US');
    expect(result[1].code).toBe('es-ES');
  });
});
