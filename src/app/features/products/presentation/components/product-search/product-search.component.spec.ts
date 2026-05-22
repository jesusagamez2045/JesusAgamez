import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductSearchComponent } from './product-search.component';

describe('ProductSearchComponent', () => {
  let fixture: ComponentFixture<ProductSearchComponent>;
  let component: ProductSearchComponent;

  beforeEach(async () => {
    jest.useFakeTimers();

    await TestBed.configureTestingModule({
      imports: [ProductSearchComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit search term after debounce', () => {
    const searchSpy = jest.fn();
    component.search.subscribe(searchSpy);

    const input = document.createElement('input');
    input.value = 'abc';
    component.onInput({ target: input } as unknown as Event);

    expect(searchSpy).not.toHaveBeenCalled();

    jest.advanceTimersByTime(300);

    expect(searchSpy).toHaveBeenCalledWith('abc');
  });

  it('should debounce rapid input and only emit the last value', () => {
    const searchSpy = jest.fn();
    component.search.subscribe(searchSpy);

    const input = document.createElement('input');

    input.value = 'a';
    component.onInput({ target: input } as unknown as Event);
    jest.advanceTimersByTime(100);

    input.value = 'ab';
    component.onInput({ target: input } as unknown as Event);
    jest.advanceTimersByTime(100);

    input.value = 'abc';
    component.onInput({ target: input } as unknown as Event);
    jest.advanceTimersByTime(300);

    expect(searchSpy).toHaveBeenCalledTimes(1);
    expect(searchSpy).toHaveBeenCalledWith('abc');
  });

  it('should not emit the same value twice in a row', () => {
    const searchSpy = jest.fn();
    component.search.subscribe(searchSpy);

    const input = document.createElement('input');
    input.value = 'same';

    component.onInput({ target: input } as unknown as Event);
    jest.advanceTimersByTime(300);

    component.onInput({ target: input } as unknown as Event);
    jest.advanceTimersByTime(300);

    expect(searchSpy).toHaveBeenCalledTimes(1);
  });

  it('should unsubscribe on destroy', () => {
    const unsubSpy = jest.spyOn(component['subscription'], 'unsubscribe');
    component.ngOnDestroy();
    expect(unsubSpy).toHaveBeenCalled();
  });
});
