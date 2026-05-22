import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of, throwError } from 'rxjs';

import { CreateProductUseCase } from './create-product.use-case';
import { ProductRepository } from '../../domain/ports/product.repository';
import { mockProduct } from '../../__mocks__/product.mock';

class MockProductRepository {
  create = jest.fn();
  getAll = jest.fn();
  update = jest.fn();
  delete = jest.fn();
  verifyId = jest.fn();
}

describe('CreateProductUseCase', () => {
  let useCase: CreateProductUseCase;
  let repository: MockProductRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        CreateProductUseCase,
        { provide: ProductRepository, useClass: MockProductRepository },
      ],
    });

    useCase = TestBed.inject(CreateProductUseCase);
    repository = TestBed.inject(ProductRepository) as unknown as MockProductRepository;
  });

  it('should call repository.create with the product', () => {
    const product = mockProduct();
    repository.create.mockReturnValue(of(product));

    let result = null;
    useCase.execute(product).subscribe((p) => (result = p));

    expect(repository.create).toHaveBeenCalledWith(product);
    expect(result).toEqual(product);
  });

  it('should propagate repository errors', () => {
    const error = new Error('API error');
    repository.create.mockReturnValue(throwError(() => error));

    let caughtError = null;
    useCase.execute(mockProduct()).subscribe({ error: (e) => (caughtError = e) });

    expect(caughtError).toBe(error);
  });
});
