import { InjectionToken } from '@angular/core';
import { environment } from '@env/environment';

export interface Environment {
  production: boolean;
  apiUrl: string;
}

export const ENVIRONMENT = new InjectionToken<Environment>('ENVIRONMENT', {
  factory: () => environment,
});
