import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ModalComponent } from './modal.component';

describe('ModalComponent', () => {
  let fixture: ComponentFixture<ModalComponent>;
  let component: ModalComponent;

  const createComponent = async (isDangerous = false) => {
    await TestBed.configureTestingModule({
      imports: [ModalComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', '¿Confirmar acción?');
    fixture.componentRef.setInput('message', 'Esta acción no se puede deshacer.');
    fixture.componentRef.setInput('isDangerous', isDangerous);
    fixture.detectChanges();
  };

  it('should create', async () => {
    await createComponent();
    expect(component).toBeTruthy();
  });

  it('should render title and message', async () => {
    await createComponent();
    const nativeEl = fixture.nativeElement as HTMLElement;
    expect(nativeEl.querySelector('.modal-dialog__title')?.textContent?.trim()).toBe(
      '¿Confirmar acción?',
    );
    expect(nativeEl.querySelector('.modal-dialog__message')?.textContent?.trim()).toBe(
      'Esta acción no se puede deshacer.',
    );
  });

  it('should have role="dialog" and aria-modal="true"', async () => {
    await createComponent();
    const dialog = fixture.debugElement.query(By.css('.modal-dialog'));
    expect(dialog.attributes['role']).toBe('dialog');
    expect(dialog.attributes['aria-modal']).toBe('true');
  });

  it('should emit cancel when cancel button is clicked', async () => {
    await createComponent();
    const cancelSpy = jest.fn();
    component.cancel.subscribe(cancelSpy);

    const cancelBtn = fixture.debugElement.queryAll(By.css('.btn'))[0];
    cancelBtn.nativeElement.click();

    expect(cancelSpy).toHaveBeenCalledTimes(1);
  });

  it('should emit confirm when confirm button is clicked', async () => {
    await createComponent();
    const confirmSpy = jest.fn();
    component.confirm.subscribe(confirmSpy);

    const confirmBtn = fixture.debugElement.queryAll(By.css('.btn'))[1];
    confirmBtn.nativeElement.click();

    expect(confirmSpy).toHaveBeenCalledTimes(1);
  });

  it('should apply btn--danger class when isDangerous is true', async () => {
    await createComponent(true);
    const confirmBtn = fixture.debugElement.queryAll(By.css('.btn'))[1];
    expect(confirmBtn.nativeElement.classList.contains('btn--danger')).toBe(true);
  });

  it('should apply btn--primary class when isDangerous is false', async () => {
    await createComponent(false);
    const confirmBtn = fixture.debugElement.queryAll(By.css('.btn'))[1];
    expect(confirmBtn.nativeElement.classList.contains('btn--primary')).toBe(true);
  });

  it('should emit cancel when Escape key is pressed', async () => {
    await createComponent();
    const cancelSpy = jest.fn();
    component.cancel.subscribe(cancelSpy);

    component.onEscape();

    expect(cancelSpy).toHaveBeenCalledTimes(1);
  });

  it('should emit cancel when backdrop is clicked', async () => {
    await createComponent();
    const cancelSpy = jest.fn();
    component.cancel.subscribe(cancelSpy);

    component.onBackdropClick();

    expect(cancelSpy).toHaveBeenCalledTimes(1);
  });

  it('should display default confirm and cancel labels', async () => {
    await createComponent();
    const buttons = fixture.debugElement.queryAll(By.css('.btn'));
    expect(buttons[0].nativeElement.textContent.trim()).toBe('Cancelar');
    expect(buttons[1].nativeElement.textContent.trim()).toBe('Confirmar');
  });

  it('should display custom labels when provided', async () => {
    await createComponent();
    fixture.componentRef.setInput('confirmLabel', 'Eliminar');
    fixture.componentRef.setInput('cancelLabel', 'No, volver');
    fixture.detectChanges();

    const buttons = fixture.debugElement.queryAll(By.css('.btn'));
    expect(buttons[0].nativeElement.textContent.trim()).toBe('No, volver');
    expect(buttons[1].nativeElement.textContent.trim()).toBe('Eliminar');
  });
});
