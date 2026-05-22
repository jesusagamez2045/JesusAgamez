import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of, throwError } from 'rxjs';

import { GetProductsUseCase } from './get-products.use-case';
import { ProductRepository } from '../../domain/ports/product.repository';
import { mockProductList } from '../../__mocks__/product.mock';

class MockProductRepository {
  getAll = jest.fn();
  create = jest.fn();
  update = jest.fn();
  delete = jest.fn();
  verifyId = jest.fn();
}

describe('GetProductsUseCase', () => {
  let useCase: GetProductsUseCase;
  let repository: MockProductRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        GetProductsUseCase,
        { provide: ProductRepository, useClass: MockProductRepository },
      ],
    });

    useCase = TestBed.inject(GetProductsUseCase);
    repository = TestBed.inject(ProductRepository) as unknown as MockProductRepository;
  });

  it('should delegate to the repository', () => {
    const products = mockProductList(3);
    repository.getAll.mockReturnValue(of(products));

    let result = null;
    useCase.execute().subscribe((p) => (result = p));

    expect(repository.getAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual(products);
  });

  it('should propagate repository errors', () => {
    const error = new Error('Network error');
    repository.getAll.mockReturnValue(throwError(() => error));

    let caughtError = null;
    useCase.execute().subscribe({ error: (e) => (caughtError = e) });

    expect(caughtError).toBe(error);
  });
});
