import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { ProductHttpRepository } from './product-http.repository';
import { ProductRepository } from '../../domain/ports/product.repository';
import { ENVIRONMENT } from '@core/tokens/environment.token';
import { mockProduct, mockProductDto } from '../../__mocks__/product.mock';

const TEST_API = 'http://localhost:3002';

describe('ProductHttpRepository', () => {
  let repository: ProductRepository;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ENVIRONMENT, useValue: { apiUrl: TEST_API, production: false } },
        { provide: ProductRepository, useClass: ProductHttpRepository },
      ],
    });

    repository = TestBed.inject(ProductRepository);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  describe('getAll', () => {
    it('should return mapped products from the API', () => {
      const dto = mockProductDto();
      let result = null;

      repository.getAll().subscribe((products) => (result = products));

      const req = httpMock.expectOne(`${TEST_API}/bp/products`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: [dto] });

      expect(result).toEqual([
        expect.objectContaining({ id: dto.id, dateRelease: dto.date_release }),
      ]);
    });

    it('should propagate HTTP errors', () => {
      let errorCaught = false;

      repository.getAll().subscribe({ error: () => (errorCaught = true) });

      const req = httpMock.expectOne(`${TEST_API}/bp/products`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

      expect(errorCaught).toBe(true);
    });
  });

  describe('verifyId', () => {
    it('should return true when ID already exists', () => {
      let result: boolean | null = null;

      repository.verifyId('existing-id').subscribe((v) => (result = v));

      const req = httpMock.expectOne(`${TEST_API}/bp/products/verification/existing-id`);
      expect(req.request.method).toBe('GET');
      req.flush(true);

      expect(result).toBe(true);
    });

    it('should return false when ID does not exist', () => {
      let result: boolean | null = null;

      repository.verifyId('new-id').subscribe((v) => (result = v));

      httpMock.expectOne(`${TEST_API}/bp/products/verification/new-id`).flush(false);

      expect(result).toBe(false);
    });
  });

  describe('delete', () => {
    it('should call DELETE and emit void', () => {
      let completed = false;
      const product = mockProduct();

      repository.delete(product.id).subscribe({ complete: () => (completed = true) });

      const req = httpMock.expectOne(`${TEST_API}/bp/products/${product.id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ message: 'Product removed successfully' });

      expect(completed).toBe(true);
    });
  });
});
