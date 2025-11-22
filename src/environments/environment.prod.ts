/**
 * Production environment configuration
 * API key should be set via environment variables during deployment
 */

export const environment = {
  production: true,
  apiKey: '',  // Must be set via environment variable in production
  apiBaseUrl: '/api'
};
