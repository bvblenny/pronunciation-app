/**
 * API Configuration
 * Centralized configuration for all API endpoints and features
 */

export interface ApiEndpointConfig {
  path: string;
  version?: string;
}

export interface ApiConfig {
  baseUrl: string;
  defaultVersion: string;
  apiKey?: string;
  endpoints: {
    pronunciation: {
      analyzeDetailed: ApiEndpointConfig;
      score: ApiEndpointConfig;
      evaluateAlign: ApiEndpointConfig;
    };
    prosody: {
      evaluate: ApiEndpointConfig;
      features: ApiEndpointConfig;
    };
    transcription: {
      transcribe: ApiEndpointConfig;
      languages: ApiEndpointConfig;
    };
  };
}

export const API_CONFIG: ApiConfig = {
  baseUrl: '/api',
  defaultVersion: 'v1',
  apiKey: undefined,  // Will be loaded from environment
  endpoints: {
    pronunciation: {
      analyzeDetailed: { path: '/pronunciation/analyze-detailed' },
      score: { path: '/pronunciation/score' },
      evaluateAlign: { path: '/pronunciation/evaluate-align' }
    },
    prosody: {
      evaluate: { path: '/prosody/evaluate' },
      features: { path: '/prosody/features' }
    },
    transcription: {
      transcribe: { path: '/transcription/transcribe' },
      languages: { path: '/transcription/languages' }
    }
  }
};
