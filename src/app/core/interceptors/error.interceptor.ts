import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

import { AppError } from '../errors/app-error.model';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse) {
        const serverMessage = extractServerMessage(err);

        if (err.status === 0) {
          return throwError(() => AppError.network());
        }

        return throwError(() => AppError.fromStatus(err.status, serverMessage));
      }

      return throwError(() => err);
    }),
  );
};

function extractServerMessage(err: HttpErrorResponse): string | undefined {
  const body = err.error;
  if (typeof body === 'string' && body.length > 0) return body;
  if (body && typeof body === 'object' && typeof body['message'] === 'string') return body['message'];
  return undefined;
}
