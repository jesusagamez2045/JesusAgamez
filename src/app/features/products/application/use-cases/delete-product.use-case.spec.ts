import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of, throwError } from 'rxjs';

import { DeleteProductUseCase } from './delete-product.use-case';
import { ProductRepository } from '../../domain/ports/product.repository';

class MockProductRepository {
  delete = jest.fn();
  getAll = jest.fn();
  create = jest.fn();
  update = jest.fn();
  verifyId = jest.fn();
}

describe('DeleteProductUseCase', () => {
  let useCase: DeleteProductUseCase;
  let repository: MockProductRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        DeleteProductUseCase,
        { provide: ProductRepository, useClass: MockProductRepository },
      ],
    });

    useCase = TestBed.inject(DeleteProductUseCase);
    repository = TestBed.inject(ProductRepository) as unknown as MockProductRepository;
  });

  it('should call repository.delete with the product id', () => {
    repository.delete.mockReturnValue(of(undefined));

    let completed = false;
    useCase.execute('prod-001').subscribe({ complete: () => (completed = true) });

    expect(repository.delete).toHaveBeenCalledWith('prod-001');
    expect(completed).toBe(true);
  });

  it('should propagate errors from the repository', () => {
    const error = new Error('Not found');
    repository.delete.mockReturnValue(throwError(() => error));

    let caughtError = null;
    useCase.execute('missing-id').subscribe({ error: (e) => (caughtError = e) });

    expect(caughtError).toBe(error);
  });
});
