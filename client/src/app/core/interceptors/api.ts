import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ConfigService } from '../services/config';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const config: ConfigService = inject(ConfigService);

  // Only prefix relative API calls
  if (req.url.startsWith('/api')) {
    const apiReq = req.clone({
      url: `${config.apiBaseUrl}${req.url}`,
    });
    return next(apiReq);
  }
  return next(req);
};
