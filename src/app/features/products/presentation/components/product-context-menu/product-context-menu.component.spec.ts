import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ProductContextMenuComponent } from './product-context-menu.component';

describe('ProductContextMenuComponent', () => {
  let fixture: ComponentFixture<ProductContextMenuComponent>;
  let component: ProductContextMenuComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductContextMenuComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductContextMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with menu closed', () => {
    expect(component['isOpen']()).toBe(false);
  });

  it('should open menu on toggle', () => {
    component.toggle();
    expect(component['isOpen']()).toBe(true);
  });

  it('should close menu on second toggle', () => {
    component.toggle();
    component.toggle();
    expect(component['isOpen']()).toBe(false);
  });

  it('should close menu on close()', () => {
    component.toggle();
    component.close();
    expect(component['isOpen']()).toBe(false);
  });

  it('should emit edit and close menu on onEdit()', () => {
    const editSpy = jest.fn();
    component.edit.subscribe(editSpy);

    component.toggle();
    component.onEdit();

    expect(editSpy).toHaveBeenCalledTimes(1);
    expect(component['isOpen']()).toBe(false);
  });

  it('should emit delete and close menu on onDelete()', () => {
    const deleteSpy = jest.fn();
    component.delete.subscribe(deleteSpy);

    component.toggle();
    component.onDelete();

    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(component['isOpen']()).toBe(false);
  });
});
