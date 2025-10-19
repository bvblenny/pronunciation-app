import { Injectable } from '@angular/core';
import { API_CONFIG, ApiEndpointConfig } from './api.config';

/**
 * API Configuration Service
 * Provides centralized access to API endpoint configuration
 */
@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  private readonly config = API_CONFIG;

  /**
   * Get the full URL for an API endpoint
   * @param category - API category (e.g., 'pronunciation', 'transcription')
   * @param action - API action (e.g., 'analyzeDetailed', 'transcribe')
   * @returns The full endpoint URL
   */
  getEndpoint(category: string, action: string): string {
    const endpoints = this.config.endpoints as any;
    const endpoint: ApiEndpointConfig | undefined = endpoints[category]?.[action];
    
    if (!endpoint) {
      throw new Error(`Unknown endpoint: ${category}.${action}`);
    }
    
    return `${this.config.baseUrl}${endpoint.path}`;
  }

  /**
   * Get the base URL for API calls
   */
  getBaseUrl(): string {
    return this.config.baseUrl;
  }

  /**
   * Get the default API version
   */
  getDefaultVersion(): string {
    return this.config.defaultVersion;
  }
}
