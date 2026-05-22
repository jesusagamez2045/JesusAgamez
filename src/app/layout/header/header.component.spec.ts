import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let nativeEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    nativeEl = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render a header element with role banner', () => {
    const header = nativeEl.querySelector('header');
    expect(header).not.toBeNull();
    expect(header?.getAttribute('role')).toBe('banner');
  });

  it('should display the bank name', () => {
    const logoText = nativeEl.querySelector('.header__logo-text');
    expect(logoText?.textContent?.trim()).toBe('BANCO');
  });

  it('should have an accessible logo link', () => {
    const link = nativeEl.querySelector('.header__logo');
    expect(link?.getAttribute('aria-label')).toBeTruthy();
  });
});
