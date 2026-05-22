import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of, throwError } from 'rxjs';

import { UpdateProductUseCase } from './update-product.use-case';
import { ProductRepository } from '../../domain/ports/product.repository';
import { mockProduct } from '../../__mocks__/product.mock';

class MockProductRepository {
  delete = jest.fn();
  getAll = jest.fn();
  create = jest.fn();
  update = jest.fn();
  verifyId = jest.fn();
}

describe('UpdateProductUseCase', () => {
  let useCase: UpdateProductUseCase;
  let repository: MockProductRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        UpdateProductUseCase,
        { provide: ProductRepository, useClass: MockProductRepository },
      ],
    });

    useCase = TestBed.inject(UpdateProductUseCase);
    repository = TestBed.inject(ProductRepository) as unknown as MockProductRepository;
  });

  it('should call repository.update with id and product data', () => {
    const product = mockProduct();
    const { id, ...data } = product;
    repository.update.mockReturnValue(of(product));

    let result = null;
    useCase.execute(id, data).subscribe((p) => (result = p));

    expect(repository.update).toHaveBeenCalledWith(id, data);
    expect(result).toEqual(product);
  });

  it('should propagate errors from the repository', () => {
    const error = new Error('Update failed');
    repository.update.mockReturnValue(throwError(() => error));

    let caughtError = null;
    useCase.execute('id-1', mockProduct()).subscribe({ error: (e) => (caughtError = e) });

    expect(caughtError).toBe(error);
  });
});
