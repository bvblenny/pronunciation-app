/**
 * Production environment configuration
 * API key should be set using build-time replacement or runtime configuration
 * 
 * For build-time: Use environment variable replacement in your CI/CD pipeline
 * For runtime: Implement a configuration service that loads from server/config endpoint
 */

export const environment = {
  production: true,
  apiKey: '',  // Set during build process or via runtime configuration
  apiBaseUrl: '/api'
};
