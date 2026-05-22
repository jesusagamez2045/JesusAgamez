import { FormControl } from '@angular/forms';
import { of } from 'rxjs';

import { minDateTodayValidator, productIdExistsValidator } from './product-form.validators';
import { VerifyProductIdUseCase } from '../../application/use-cases/verify-product-id.use-case';

describe('minDateTodayValidator', () => {
  const validator = minDateTodayValidator();

  it('should return null for empty value', () => {
    const control = new FormControl('');
    expect(validator(control)).toBeNull();
  });

  it('should return null for today\'s date', () => {
    const today = new Date().toISOString().split('T')[0];
    const control = new FormControl(today);
    expect(validator(control)).toBeNull();
  });

  it('should return null for a future date', () => {
    const future = new Date();
    future.setDate(future.getDate() + 30);
    const control = new FormControl(future.toISOString().split('T')[0]);
    expect(validator(control)).toBeNull();
  });

  it('should return minDate error for a past date', () => {
    const past = new Date();
    past.setDate(past.getDate() - 1);
    const control = new FormControl(past.toISOString().split('T')[0]);
    const result = validator(control);
    expect(result).toEqual({ minDate: expect.objectContaining({ min: expect.any(String) }) });
  });
});

describe('productIdExistsValidator', () => {
  let mockUseCase: jest.Mocked<VerifyProductIdUseCase>;

  beforeEach(() => {
    mockUseCase = { execute: jest.fn() } as unknown as jest.Mocked<VerifyProductIdUseCase>;
  });

  it('should return null for empty value without calling API', (done) => {
    mockUseCase.execute.mockReturnValue(of(false));
    const validator = productIdExistsValidator(mockUseCase);
    const control = new FormControl('');

    (validator(control) as ReturnType<typeof of>).subscribe((result) => {
      expect(result).toBeNull();
      expect(mockUseCase.execute).not.toHaveBeenCalled();
      done();
    });
  });

  it('should return null for value shorter than 3 chars', (done) => {
    const validator = productIdExistsValidator(mockUseCase);
    const control = new FormControl('ab');

    (validator(control) as ReturnType<typeof of>).subscribe((result) => {
      expect(result).toBeNull();
      expect(mockUseCase.execute).not.toHaveBeenCalled();
      done();
    });
  });

  it('should return idAlreadyExists when API returns true', (done) => {
    mockUseCase.execute.mockReturnValue(of(true));
    const validator = productIdExistsValidator(mockUseCase);
    const control = new FormControl('existing-id');

    (validator(control) as ReturnType<typeof of>).subscribe((result) => {
      expect(result).toEqual({ idAlreadyExists: true });
      done();
    });
  }, 1000);

  it('should return null when API returns false', (done) => {
    mockUseCase.execute.mockReturnValue(of(false));
    const validator = productIdExistsValidator(mockUseCase);
    const control = new FormControl('new-id-ok');

    (validator(control) as ReturnType<typeof of>).subscribe((result) => {
      expect(result).toBeNull();
      done();
    });
  }, 1000);
});
