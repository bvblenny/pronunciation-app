/**
 * Development environment configuration
 * This file can be replaced during build by using the `fileReplacements` array.
 * `ng build --configuration production` replaces `environment.ts` with `environment.prod.ts`.
 */

export const environment = {
  production: false,
  apiKey: '',  // Set via environment variable or leave empty for local development
  apiBaseUrl: '/api'
};
