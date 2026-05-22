import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

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
});
