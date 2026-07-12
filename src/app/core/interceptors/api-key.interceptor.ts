import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ApiConfigService } from '../config';

/**
 * API Key Interceptor
 * Automatically adds X-API-Key header to all requests to the API base URL
 */
export const apiKeyInterceptor: HttpInterceptorFn = (req, next) => {
  const apiConfigService = inject(ApiConfigService);
  const apiKey = apiConfigService.getApiKey();
  
  // Only add header to API requests (requests starting with /api)
  if (req.url.startsWith('/api')) {
    // Clone the request and add the API key header if available
    if (apiKey) {
      req = req.clone({
        setHeaders: {
          'X-API-Key': apiKey
        }
      });
    }
  }
  
  return next(req);
};
