import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

import { ProductTableComponent } from './product-table.component';
import { mockProduct, mockProductList } from '../../../__mocks__/product.mock';

describe('ProductTableComponent', () => {
  let fixture: ComponentFixture<ProductTableComponent>;

  const createComponent = async (
    products = mockProductList(3),
    isLoading = false,
  ) => {
    await TestBed.configureTestingModule({
      imports: [ProductTableComponent],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductTableComponent);
    fixture.componentRef.setInput('products', products);
    fixture.componentRef.setInput('isLoading', isLoading);
    fixture.detectChanges();
  };

  it('should create', async () => {
    await createComponent();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render a row for each product', async () => {
    await createComponent(mockProductList(3));
    const rows = fixture.debugElement.queryAll(By.css('.product-table__row'));
    expect(rows).toHaveLength(3);
  });

  it('should show skeleton when loading', async () => {
    await createComponent([], true);
    expect(fixture.debugElement.query(By.css('app-skeleton'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('.product-table__table'))).toBeNull();
  });

  it('should show empty state when no products and not loading', async () => {
    await createComponent([], false);
    expect(fixture.debugElement.query(By.css('.product-table__empty'))).not.toBeNull();
  });

  it('should emit edit event with the correct product', async () => {
    const products = [mockProduct({ id: 'edit-test' })];
    await createComponent(products);

    const editSpy = jest.fn();
    fixture.componentInstance.edit.subscribe(editSpy);

    const contextMenu = fixture.debugElement.query(By.css('app-product-context-menu'));
    contextMenu.triggerEventHandler('edit', null);

    expect(editSpy).toHaveBeenCalledWith(products[0]);
  });

  it('should emit delete event with the correct product', async () => {
    const products = [mockProduct({ id: 'delete-test' })];
    await createComponent(products);

    const deleteSpy = jest.fn();
    fixture.componentInstance.delete.subscribe(deleteSpy);

    const contextMenu = fixture.debugElement.query(By.css('app-product-context-menu'));
    contextMenu.triggerEventHandler('delete', null);

    expect(deleteSpy).toHaveBeenCalledWith(products[0]);
  });
});
