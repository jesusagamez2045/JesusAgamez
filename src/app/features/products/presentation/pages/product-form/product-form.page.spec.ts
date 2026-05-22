import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ProductFormPage } from './product-form.page';
import { ProductStore } from '../../state/product.store';
import { CreateProductUseCase } from '../../../application/use-cases/create-product.use-case';
import { UpdateProductUseCase } from '../../../application/use-cases/update-product.use-case';
import { VerifyProductIdUseCase } from '../../../application/use-cases/verify-product-id.use-case';
import { mockProduct } from '../../../__mocks__/product.mock';

class MockProductStore {
  products = jest.fn().mockReturnValue([]);
  isLoading = jest.fn().mockReturnValue(false);
  loadProducts = jest.fn();
  addProduct = jest.fn();
  replaceProduct = jest.fn();
}

describe('ProductFormPage — Create mode', () => {
  let fixture: ComponentFixture<ProductFormPage>;
  let component: ProductFormPage;
  let createUseCase: { execute: jest.Mock };
  let verifyUseCase: { execute: jest.Mock };

  beforeEach(async () => {
    createUseCase = { execute: jest.fn().mockReturnValue(of(mockProduct())) };
    verifyUseCase = { execute: jest.fn().mockReturnValue(of(false)) };

    await TestBed.configureTestingModule({
      imports: [ProductFormPage],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: ProductStore, useClass: MockProductStore },
        { provide: CreateProductUseCase, useValue: createUseCase },
        { provide: UpdateProductUseCase, useValue: { execute: jest.fn() } },
        { provide: VerifyProductIdUseCase, useValue: verifyUseCase },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create in create mode', () => {
    expect(component).toBeTruthy();
    expect(component.isEditMode()).toBe(false);
  });

  it('should have an invalid form initially', () => {
    expect(component['form'].invalid).toBe(true);
  });

  it('should mark all fields as touched when submitting invalid form', () => {
    component['onSubmit']();
    expect(component['form'].touched).toBe(true);
  });

  it('should show error for required fields after touch', () => {
    component['form'].get('name')?.markAsTouched();
    fixture.detectChanges();
    expect(component.isFieldInvalid('name')).toBe(true);
    expect(component.getFieldError('name')).toBe('Este campo es requerido.');
  });

  it('should show minlength error when name is too short', () => {
    component['form'].get('name')?.setValue('ab');
    component['form'].get('name')?.markAsTouched();
    expect(component.getFieldError('name')).toContain('5 caracteres');
  });

  it('should auto-calculate dateRevision when dateRelease changes', () => {
    // valueChanges fires synchronously in reactive forms (no debounce in this subscription)
    component['form'].get('dateRelease')?.setValue('2025-06-01');
    const revision = component['form'].get('dateRevision')?.value;
    expect(revision).toBe('2026-06-01');
  });

  it('should return minDate error for past date', () => {
    component['form'].get('dateRelease')?.setValue('2020-01-01');
    component['form'].get('dateRelease')?.markAsTouched();
    expect(component.getFieldError('dateRelease')).toContain('igual o mayor');
  });

  it('should return maxlength error when name exceeds limit', () => {
    component['form'].get('name')?.setValue('a'.repeat(101));
    component['form'].get('name')?.markAsTouched();
    expect(component.getFieldError('name')).toContain('100 caracteres');
  });

  it('should return null from getFieldError for untouched field with errors', () => {
    expect(component.getFieldError('name')).toBeNull();
  });

  it('should return null from getFieldError for unknown error type', () => {
    const ctrl = component['form'].get('name')!;
    ctrl.setErrors({ unknownError: true });
    ctrl.markAsTouched();
    expect(component.getFieldError('name')).toBeNull();
  });

  it('isPending should return false for non-async field', () => {
    expect(component.isPending('name')).toBe(false);
  });

  it('should clear dateRevision when dateRelease is empty', () => {
    component['form'].get('dateRelease')?.setValue('2025-01-01');
    component['form'].get('dateRelease')?.setValue('');
    expect(component['form'].get('dateRevision')?.value).toBe('');
  });

  it('should reset form on onReset() in create mode', () => {
    component['form'].get('name')?.setValue('Test');
    component['onReset']();
    expect(component['form'].get('name')?.value).toBe('');
  });

  it('should call createUseCase and navigate on valid submit in create mode', () => {
    const navigateSpy = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    component['form'].patchValue({
      id: 'prod-1',
      name: 'Valid Name',
      description: 'Valid description here',
      logo: 'https://logo.png',
      dateRelease: '2030-01-01',
    });
    component['form'].get('id')?.setErrors(null);
    component['form'].get('dateRelease')?.setErrors(null);

    component['onSubmit']();

    expect(createUseCase.execute).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/products']);
  });

  it('should set submitError on createUseCase failure', () => {
    const { HttpErrorResponse } = jest.requireActual('@angular/common/http') as typeof import('@angular/common/http');
    const err = new HttpErrorResponse({ status: 400, error: { message: 'Bad data' } });
    createUseCase.execute.mockReturnValue(throwError(() => err));

    component['form'].patchValue({
      id: 'prod-1',
      name: 'Valid Name',
      description: 'Valid description here',
      logo: 'https://logo.png',
      dateRelease: '2030-01-01',
    });
    component['form'].get('id')?.setErrors(null);
    component['form'].get('dateRelease')?.setErrors(null);

    component['onSubmit']();

    expect(component['submitError']()).toBe('Bad data');
  });
});

describe('ProductFormPage — Edit mode', () => {
  let fixture: ComponentFixture<ProductFormPage>;
  let component: ProductFormPage;
  let updateUseCase: { execute: jest.Mock };
  let store: MockProductStore;

  const existingProduct = mockProduct({ id: 'edit-001', name: 'Existing Product' });

  beforeEach(async () => {
    updateUseCase = { execute: jest.fn().mockReturnValue(of(existingProduct)) };

    class MockStoreWithProduct {
      products = jest.fn().mockReturnValue([existingProduct]);
      isLoading = jest.fn().mockReturnValue(false);
      loadProducts = jest.fn();
      addProduct = jest.fn();
      replaceProduct = jest.fn();
    }

    await TestBed.configureTestingModule({
      imports: [ProductFormPage],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: ProductStore, useClass: MockStoreWithProduct },
        { provide: CreateProductUseCase, useValue: { execute: jest.fn() } },
        { provide: UpdateProductUseCase, useValue: updateUseCase },
        { provide: VerifyProductIdUseCase, useValue: { execute: jest.fn().mockReturnValue(of(false)) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormPage);
    component = fixture.componentInstance;
    store = TestBed.inject(ProductStore) as unknown as MockStoreWithProduct;

    fixture.componentRef.setInput('id', 'edit-001');
    fixture.detectChanges();
  });

  it('should be in edit mode when id input is provided', () => {
    expect(component.isEditMode()).toBe(true);
  });

  it('should populate form with existing product data', () => {
    expect(component['form'].get('name')?.value).toBe('Existing Product');
  });

  it('should have id field disabled in edit mode', () => {
    expect(component['form'].get('id')?.disabled).toBe(true);
  });

  it('should restore form to original on onReset() in edit mode', () => {
    component['form'].get('name')?.setValue('Changed');
    component['onReset']();
    expect(component['form'].get('name')?.value).toBe('Existing Product');
  });

  it('should call updateUseCase on valid submit in edit mode', () => {
    const navigateSpy = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    component['form'].get('dateRelease')?.setErrors(null);
    component['onSubmit']();

    expect(updateUseCase.execute).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/products']);
  });

  it('should set submitError on updateUseCase 404 failure', () => {
    const { HttpErrorResponse } = jest.requireActual('@angular/common/http') as typeof import('@angular/common/http');
    const err = new HttpErrorResponse({ status: 404 });
    updateUseCase.execute.mockReturnValue(throwError(() => err));

    component['form'].get('dateRelease')?.setErrors(null);
    component['onSubmit']();

    expect(component['submitError']()).toContain('no encontrado');
  });

  it('should set submitError on updateUseCase unknown failure', () => {
    updateUseCase.execute.mockReturnValue(throwError(() => new Error('unknown')));

    component['form'].get('dateRelease')?.setErrors(null);
    component['onSubmit']();

    expect(component['submitError']()).toContain('inesperado');
  });
});
