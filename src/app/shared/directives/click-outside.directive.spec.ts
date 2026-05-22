import { Component } from '@angular/core';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClickOutsideDirective } from './click-outside.directive';

@Component({
  template: `<div appClickOutside (clickOutside)="onOutside()">inside</div>`,
  imports: [ClickOutsideDirective],
})
class HostComponent {
  onOutside = jest.fn();
}

describe('ClickOutsideDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let component: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should emit clickOutside when clicking outside the element', () => {
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(component.onOutside).toHaveBeenCalledTimes(1);
  });

  it('should NOT emit clickOutside when clicking inside the element', () => {
    const inner = fixture.nativeElement.querySelector('div') as HTMLElement;
    inner.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(component.onOutside).not.toHaveBeenCalled();
  });
});
