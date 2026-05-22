import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MainLayoutComponent } from './main-layout.component';

describe('MainLayoutComponent', () => {
  let fixture: ComponentFixture<MainLayoutComponent>;
  let nativeEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    nativeEl = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the header', () => {
    expect(nativeEl.querySelector('app-header')).not.toBeNull();
  });

  it('should render a main element with role main', () => {
    const main = nativeEl.querySelector('main');
    expect(main).not.toBeNull();
    expect(main?.getAttribute('role')).toBe('main');
  });

  it('should render a router-outlet', () => {
    expect(nativeEl.querySelector('router-outlet')).not.toBeNull();
  });

  it('should render a skip navigation link for accessibility', () => {
    const skipLink = nativeEl.querySelector('.layout__skip-link');
    expect(skipLink).not.toBeNull();
    expect(skipLink?.getAttribute('href')).toBe('#main-content');
  });
});
