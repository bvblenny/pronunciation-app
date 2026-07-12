/**
 * Development environment configuration
 * This file can be replaced during build by using the `fileReplacements` array.
 * `ng build --configuration production` replaces `environment.ts` with `environment.prod.ts`.
 * 
 * To set the API key for development:
 * 1. Edit this file directly and set the apiKey value (DO NOT commit this change)
 * 2. Or use build-time environment variable replacement in your build pipeline
 */

export const environment = {
  production: false,
  apiKey: '',  // Set your API key here for local development (DO NOT commit)
  apiBaseUrl: '/api'
};
