import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { PaginationComponent } from './pagination.component';

describe('PaginationComponent', () => {
  let fixture: ComponentFixture<PaginationComponent>;
  let component: PaginationComponent;

  const create = async (currentPage: number, totalPages: number) => {
    await TestBed.configureTestingModule({
      imports: [PaginationComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('currentPage', currentPage);
    fixture.componentRef.setInput('totalPages', totalPages);
    fixture.detectChanges();
  };

  describe('visibility', () => {
    it('should not render when totalPages is 1', async () => {
      await create(1, 1);
      expect(fixture.nativeElement.querySelector('.pagination')).toBeNull();
    });

    it('should render when totalPages > 1', async () => {
      await create(1, 3);
      expect(fixture.nativeElement.querySelector('.pagination')).toBeTruthy();
    });
  });

  describe('navigation buttons', () => {
    it('should disable prev button on first page', async () => {
      await create(1, 5);
      const prevBtn = fixture.debugElement.queryAll(By.css('.pagination__btn--nav'))[0];
      expect(prevBtn.nativeElement.disabled).toBe(true);
    });

    it('should disable next button on last page', async () => {
      await create(5, 5);
      const nextBtn = fixture.debugElement.queryAll(By.css('.pagination__btn--nav'))[1];
      expect(nextBtn.nativeElement.disabled).toBe(true);
    });

    it('should emit prev page on prev click', async () => {
      await create(3, 5);
      const spy = jest.fn();
      component.pageChange.subscribe(spy);

      const prevBtn = fixture.debugElement.queryAll(By.css('.pagination__btn--nav'))[0];
      prevBtn.nativeElement.click();

      expect(spy).toHaveBeenCalledWith(2);
    });

    it('should emit next page on next click', async () => {
      await create(3, 5);
      const spy = jest.fn();
      component.pageChange.subscribe(spy);

      const nextBtn = fixture.debugElement.queryAll(By.css('.pagination__btn--nav'))[1];
      nextBtn.nativeElement.click();

      expect(spy).toHaveBeenCalledWith(4);
    });
  });

  describe('page buttons', () => {
    it('should mark current page as active', async () => {
      await create(2, 5);
      const activeBtn = fixture.nativeElement.querySelector('.pagination__btn--active');
      expect(activeBtn.textContent.trim()).toBe('2');
    });

    it('should emit page number when a page button is clicked', async () => {
      await create(1, 5);
      const spy = jest.fn();
      component.pageChange.subscribe(spy);

      const pageBtns = fixture.debugElement.queryAll(
        By.css('.pagination__btn:not(.pagination__btn--nav):not(.pagination__btn--active)'),
      );
      pageBtns[0].nativeElement.click();

      expect(spy).toHaveBeenCalled();
    });

    it('should not emit when clicking current page', async () => {
      await create(2, 5);
      const spy = jest.fn();
      component.pageChange.subscribe(spy);

      component.goTo(2);
      expect(spy).not.toHaveBeenCalled();
    });

    it('should not emit when clicking ellipsis via goTo', async () => {
      await create(5, 10);
      const spy = jest.fn();
      component.pageChange.subscribe(spy);

      component.goTo('...');
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('buildPageRange', () => {
    it('should show all pages when totalPages <= 7', async () => {
      await create(1, 5);
      expect(component.pages()).toEqual([1, 2, 3, 4, 5]);
    });

    it('should show leading range with ellipsis at end when current <= 4', async () => {
      await create(2, 10);
      const pages = component.pages();
      expect(pages[pages.length - 1]).toBe(10);
      expect(pages).toContain('...');
    });

    it('should show trailing range with ellipsis at start when current near end', async () => {
      await create(9, 10);
      const pages = component.pages();
      expect(pages[0]).toBe(1);
      expect(pages).toContain('...');
    });

    it('should show middle range with ellipsis on both sides', async () => {
      await create(5, 10);
      const pages = component.pages();
      expect(pages[0]).toBe(1);
      expect(pages[pages.length - 1]).toBe(10);
      expect(pages.filter((p) => p === '...')).toHaveLength(2);
    });
  });
});
