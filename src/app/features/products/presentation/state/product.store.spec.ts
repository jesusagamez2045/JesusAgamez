import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { ProductStore } from './product.store';
import { GetProductsUseCase } from '../../application/use-cases/get-products.use-case';
import { mockProduct, mockProductList } from '../../__mocks__/product.mock';

class MockGetProductsUseCase {
  execute = jest.fn();
}

describe('ProductStore', () => {
  let store: ProductStore;
  let useCase: MockGetProductsUseCase;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        ProductStore,
        { provide: GetProductsUseCase, useClass: MockGetProductsUseCase },
      ],
    });

    store = TestBed.inject(ProductStore);
    useCase = TestBed.inject(GetProductsUseCase) as unknown as MockGetProductsUseCase;
  });

  describe('initial state', () => {
    it('should start with empty products and no loading', () => {
      expect(store.products()).toEqual([]);
      expect(store.isLoading()).toBe(false);
      expect(store.error()).toBeNull();
    });
  });

  describe('loadProducts', () => {
    it('should set products on success', () => {
      const products = mockProductList(3);
      useCase.execute.mockReturnValue(of(products));

      store.loadProducts();

      expect(store.products()).toEqual(products);
      expect(store.isLoading()).toBe(false);
      expect(store.error()).toBeNull();
    });

    it('should set error on HTTP failure', () => {
      const httpError = new HttpErrorResponse({ status: 500, statusText: 'Server Error' });
      useCase.execute.mockReturnValue(throwError(() => httpError));

      store.loadProducts();

      expect(store.isLoading()).toBe(false);
      expect(store.error()).toBeTruthy();
      expect(store.products()).toEqual([]);
    });

    it('should set connection error message when status is 0', () => {
      const httpError = new HttpErrorResponse({ status: 0 });
      useCase.execute.mockReturnValue(throwError(() => httpError));

      store.loadProducts();

      expect(store.error()).toContain('servidor');
    });

    it('should use error.message from body when present', () => {
      const httpError = new HttpErrorResponse({ status: 400, error: { message: 'Custom msg' } });
      useCase.execute.mockReturnValue(throwError(() => httpError));

      store.loadProducts();

      expect(store.error()).toBe('Custom msg');
    });

    it('should set server error message when status >= 500 and no body message', () => {
      const httpError = new HttpErrorResponse({ status: 503, statusText: 'Service Unavailable' });
      useCase.execute.mockReturnValue(throwError(() => httpError));

      store.loadProducts();

      expect(store.error()).toContain('servidor');
    });

    it('should set generic error for non-HTTP errors', () => {
      useCase.execute.mockReturnValue(throwError(() => new Error('unknown')));

      store.loadProducts();

      expect(store.error()).toContain('inesperado');
    });
  });

  describe('filteredProducts (computed)', () => {
    beforeEach(() => {
      useCase.execute.mockReturnValue(of(mockProductList(3)));
      store.loadProducts();
    });

    it('should return all products when searchTerm is empty', () => {
      expect(store.filteredProducts()).toHaveLength(3);
    });

    it('should filter products by name', () => {
      store.setSearchTerm('Producto 1');
      expect(store.filteredProducts()).toHaveLength(1);
      expect(store.filteredProducts()[0].name).toBe('Producto 1');
    });

    it('should filter case-insensitively', () => {
      store.setSearchTerm('producto');
      expect(store.filteredProducts().length).toBeGreaterThan(0);
    });

    it('should return empty when no product matches', () => {
      store.setSearchTerm('xyz-no-match-xyz');
      expect(store.filteredProducts()).toHaveLength(0);
    });
  });

  describe('paginatedProducts (computed)', () => {
    it('should limit products to pageSize', () => {
      useCase.execute.mockReturnValue(of(mockProductList(10)));
      store.loadProducts();
      store.setPageSize(5);

      expect(store.paginatedProducts()).toHaveLength(5);
    });
  });

  describe('isEmpty (computed)', () => {
    it('should be true when not loading, no error, and products empty', () => {
      expect(store.isEmpty()).toBe(true);
    });

    it('should be false when products are loaded', () => {
      useCase.execute.mockReturnValue(of(mockProductList(2)));
      store.loadProducts();
      expect(store.isEmpty()).toBe(false);
    });

    it('should be false when there is an error', () => {
      useCase.execute.mockReturnValue(throwError(() => new Error('fail')));
      store.loadProducts();
      expect(store.isEmpty()).toBe(false);
    });
  });

  describe('mutations', () => {
    it('removeProduct should remove by id', () => {
      useCase.execute.mockReturnValue(of(mockProductList(3)));
      store.loadProducts();

      store.removeProduct('test-001');

      expect(store.products().find((p) => p.id === 'test-001')).toBeUndefined();
    });

    it('addProduct should add to list', () => {
      useCase.execute.mockReturnValue(of(mockProductList(2)));
      store.loadProducts();

      store.addProduct(mockProduct({ id: 'new-999' }));

      expect(store.products()).toHaveLength(3);
      expect(store.products().find((p) => p.id === 'new-999')).toBeDefined();
    });

    it('replaceProduct should update existing product', () => {
      useCase.execute.mockReturnValue(of([mockProduct({ id: 'test-001', name: 'Original' })]));
      store.loadProducts();

      store.replaceProduct(mockProduct({ id: 'test-001', name: 'Updated' }));

      expect(store.products()[0].name).toBe('Updated');
    });
  });
});
