import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { VerifyProductIdUseCase } from '../../application/use-cases/verify-product-id.use-case';

export function minDateTodayValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string;
    if (!value) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Appending T00:00:00 avoids UTC offset shifting the date
    const inputDate = new Date(`${value}T00:00:00`);

    return inputDate >= today ? null : { minDate: { min: today.toISOString().split('T')[0] } };
  };
}

export function productIdExistsValidator(
  verifyIdUseCase: VerifyProductIdUseCase,
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const value = (control.value as string)?.trim();

    if (!value || value.length < 3) return of(null);

    // timer(400) + Angular's cancel-on-change behavior = effective debounce
    return timer(400).pipe(
      switchMap(() => verifyIdUseCase.execute(value)),
      map((exists) => (exists ? { idAlreadyExists: true } : null)),
      catchError(() => of(null)),
    );
  };
}
