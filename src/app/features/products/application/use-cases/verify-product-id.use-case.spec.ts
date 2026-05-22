import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of, throwError } from 'rxjs';

import { VerifyProductIdUseCase } from './verify-product-id.use-case';
import { ProductRepository } from '../../domain/ports/product.repository';

class MockProductRepository {
  delete = jest.fn();
  getAll = jest.fn();
  create = jest.fn();
  update = jest.fn();
  verifyId = jest.fn();
}

describe('VerifyProductIdUseCase', () => {
  let useCase: VerifyProductIdUseCase;
  let repository: MockProductRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        VerifyProductIdUseCase,
        { provide: ProductRepository, useClass: MockProductRepository },
      ],
    });

    useCase = TestBed.inject(VerifyProductIdUseCase);
    repository = TestBed.inject(ProductRepository) as unknown as MockProductRepository;
  });

  it('should return true when id exists', () => {
    repository.verifyId.mockReturnValue(of(true));

    let result: boolean | null = null;
    useCase.execute('existing-id').subscribe((v) => (result = v));

    expect(repository.verifyId).toHaveBeenCalledWith('existing-id');
    expect(result).toBe(true);
  });

  it('should return false when id does not exist', () => {
    repository.verifyId.mockReturnValue(of(false));

    let result: boolean | null = null;
    useCase.execute('new-id').subscribe((v) => (result = v));

    expect(result).toBe(false);
  });

  it('should propagate errors from the repository', () => {
    const error = new Error('Network error');
    repository.verifyId.mockReturnValue(throwError(() => error));

    let caughtError = null;
    useCase.execute('id').subscribe({ error: (e) => (caughtError = e) });

    expect(caughtError).toBe(error);
  });
});
