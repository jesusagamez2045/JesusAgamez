import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { ProductListPage } from './product-list.page';
import { ProductStore } from '../../state/product.store';
import { DeleteProductUseCase } from '../../../application/use-cases/delete-product.use-case';
import { mockProduct } from '../../../__mocks__/product.mock';

class MockProductStore {
  paginatedProducts = jest.fn().mockReturnValue([]);
  isLoading = jest.fn().mockReturnValue(false);
  error = jest.fn().mockReturnValue(null);
  totalFiltered = jest.fn().mockReturnValue(0);
  pageSize = jest.fn().mockReturnValue(5);
  isEmpty = jest.fn().mockReturnValue(true);
  loadProducts = jest.fn();
  setSearchTerm = jest.fn();
  setPageSize = jest.fn();
  removeProduct = jest.fn();
}

describe('ProductListPage', () => {
  let fixture: ComponentFixture<ProductListPage>;
  let component: ProductListPage;
  let store: MockProductStore;
  let deleteUseCase: { execute: jest.Mock };
  let router: Router;

  beforeEach(async () => {
    deleteUseCase = { execute: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [ProductListPage],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: ProductStore, useClass: MockProductStore },
        { provide: DeleteProductUseCase, useValue: deleteUseCase },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListPage);
    component = fixture.componentInstance;
    store = TestBed.inject(ProductStore) as unknown as MockProductStore;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call store.loadProducts on init', () => {
    expect(store.loadProducts).toHaveBeenCalled();
  });

  it('should call store.setSearchTerm when searching', () => {
    component.onSearch('laptop');
    expect(store.setSearchTerm).toHaveBeenCalledWith('laptop');
  });

  it('should call store.setPageSize when page size changes', () => {
    const event = { target: { value: '10' } } as unknown as Event;
    component.onPageSizeChange(event);
    expect(store.setPageSize).toHaveBeenCalledWith(10);
  });

  it('should navigate to edit route on onEdit()', async () => {
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    const product = mockProduct({ id: 'prod-1' });

    component.onEdit(product);

    expect(navigateSpy).toHaveBeenCalledWith(['/products/edit', 'prod-1']);
  });

  it('should navigate to create route on onCreateProduct()', () => {
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    component.onCreateProduct();

    expect(navigateSpy).toHaveBeenCalledWith(['/products/create']);
  });

  it('should set productToDelete on onDelete()', () => {
    const product = mockProduct();
    component.onDelete(product);
    expect(component['productToDelete']()).toBe(product);
  });

  it('should clear deleteError when onDelete() is called', () => {
    component['deleteError'].set('previous error');
    component.onDelete(mockProduct());
    expect(component['deleteError']()).toBeNull();
  });

  it('should clear productToDelete on onCancelDelete()', () => {
    component['productToDelete'].set(mockProduct());
    component.onCancelDelete();
    expect(component['productToDelete']()).toBeNull();
  });

  it('should do nothing on onConfirmDelete when no product is set', () => {
    component['productToDelete'].set(null);
    component.onConfirmDelete();
    expect(deleteUseCase.execute).not.toHaveBeenCalled();
  });

  describe('onConfirmDelete — success', () => {
    it('should call deleteUseCase, remove product and clear state', () => {
      const product = mockProduct({ id: 'to-delete' });
      deleteUseCase.execute.mockReturnValue(of(undefined));

      component['productToDelete'].set(product);
      component.onConfirmDelete();

      expect(deleteUseCase.execute).toHaveBeenCalledWith('to-delete');
      expect(store.removeProduct).toHaveBeenCalledWith('to-delete');
      expect(component['productToDelete']()).toBeNull();
      expect(component['isDeleting']()).toBe(false);
    });
  });

  describe('onConfirmDelete — error', () => {
    it('should set deleteError on generic error', () => {
      deleteUseCase.execute.mockReturnValue(throwError(() => new Error('fail')));

      component['productToDelete'].set(mockProduct());
      component.onConfirmDelete();

      expect(component['deleteError']()).toContain('No se pudo eliminar');
      expect(component['isDeleting']()).toBe(false);
      expect(component['productToDelete']()).toBeNull();
    });

    it('should set 404 message when product not found', () => {
      const err = new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      deleteUseCase.execute.mockReturnValue(throwError(() => err));

      component['productToDelete'].set(mockProduct());
      component.onConfirmDelete();

      expect(component['deleteError']()).toContain('ya no existe');
    });

    it('should use server message from error body', () => {
      const err = new HttpErrorResponse({
        status: 400,
        error: { message: 'Custom server error' },
      });
      deleteUseCase.execute.mockReturnValue(throwError(() => err));

      component['productToDelete'].set(mockProduct());
      component.onConfirmDelete();

      expect(component['deleteError']()).toBe('Custom server error');
    });
  });

  it('should build a delete message containing the product name', () => {
    const product = mockProduct({ name: 'Mi Producto' });
    const msg = component['buildDeleteMessage'](product);
    expect(msg).toContain('Mi Producto');
  });
});
