import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { filter, take } from 'rxjs/operators';

import { Product } from '../../../domain/models/product.model';
import { ProductStore } from '../../state/product.store';
import { CreateProductUseCase } from '../../../application/use-cases/create-product.use-case';
import { UpdateProductUseCase } from '../../../application/use-cases/update-product.use-case';
import { VerifyProductIdUseCase } from '../../../application/use-cases/verify-product-id.use-case';
import {
  minDateTodayValidator,
  productIdExistsValidator,
} from '../../validators/product-form.validators';

@Component({
  selector: 'app-product-form-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './product-form.page.html',
  styleUrl: './product-form.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFormPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly store = inject(ProductStore);
  private readonly createUseCase = inject(CreateProductUseCase);
  private readonly updateUseCase = inject(UpdateProductUseCase);
  private readonly verifyIdUseCase = inject(VerifyProductIdUseCase);
  private readonly destroyRef = inject(DestroyRef);

  // toObservable must be called in injection context (field initializer = constructor phase)
  private readonly products$ = toObservable(this.store.products);

  readonly id = input<string>();
  readonly isEditMode = computed(() => !!this.id());

  protected readonly isSubmitting = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly isLoadingProduct = signal(false);

  private originalProduct: Product | null = null;

  protected form = this.fb.nonNullable.group({
    id: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(10)]],
    name: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
    description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
    logo: ['', [Validators.required]],
    dateRelease: ['', [Validators.required, minDateTodayValidator()]],
    dateRevision: [''],
  });

  ngOnInit(): void {
    this.configureFormForMode();
    this.setupDateRevisionSync();

    if (this.isEditMode()) {
      this.initEditMode();
    }
  }

  private configureFormForMode(): void {
    if (!this.isEditMode()) {
      this.form.get('id')?.addAsyncValidators(productIdExistsValidator(this.verifyIdUseCase));
      this.form.get('id')?.updateValueAndValidity();
    } else {
      this.form.get('id')?.disable({ emitEvent: false });
    }
    this.form.get('dateRevision')?.disable({ emitEvent: false });
  }

  private setupDateRevisionSync(): void {
    this.form
      .get('dateRelease')!
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((dateRelease) => {
        const revisionControl = this.form.get('dateRevision')!;
        if (!dateRelease) {
          revisionControl.setValue('', { emitEvent: false });
          return;
        }
        const release = new Date(`${dateRelease}T00:00:00`);
        const revision = new Date(release);
        revision.setFullYear(revision.getFullYear() + 1);
        revisionControl.setValue(revision.toISOString().split('T')[0], { emitEvent: false });
      });
  }

  private initEditMode(): void {
    const productId = this.id()!;
    const existing = this.store.products().find((p) => p.id === productId);

    if (existing) {
      this.patchForm(existing);
      return;
    }

    // Direct navigation: products not yet loaded
    this.isLoadingProduct.set(true);
    this.store.loadProducts();

    this.products$
      .pipe(
        filter((products) => products.length > 0 && !this.store.isLoading()),
        take(1),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((products) => {
        this.isLoadingProduct.set(false);
        const product = products.find((p) => p.id === productId);
        product ? this.patchForm(product) : this.router.navigate(['/products']);
      });
  }

  private patchForm(product: Product): void {
    this.originalProduct = product;
    this.form.patchValue({
      id: product.id,
      name: product.name,
      description: product.description,
      logo: product.logo,
      dateRelease: product.dateRelease,
    });
    // Patch disabled control directly
    this.form.get('dateRevision')!.setValue(product.dateRevision, { emitEvent: false });
  }

  protected isFieldInvalid(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return !!(control?.invalid && (control.touched || control.dirty));
  }

  protected getFieldError(fieldName: string): string | null {
    const control = this.form.get(fieldName);
    if (!control?.errors || !(control.touched || control.dirty)) return null;

    const errors = control.errors;

    if (errors['required']) return 'Este campo es requerido.';
    if (errors['minlength'])
      return `Mínimo ${errors['minlength'].requiredLength as number} caracteres.`;
    if (errors['maxlength'])
      return `Máximo ${errors['maxlength'].requiredLength as number} caracteres.`;
    if (errors['minDate'])
      return `La fecha de liberación debe ser igual o mayor a hoy (${errors['minDate'].min as string}).`;
    if (errors['idAlreadyExists']) return 'Este ID ya está registrado.';

    return null;
  }

  protected isPending(fieldName: string): boolean {
    return this.form.get(fieldName)?.pending ?? false;
  }

  protected onReset(): void {
    if (this.isEditMode() && this.originalProduct) {
      this.patchForm(this.originalProduct);
      this.form.markAsPristine();
      this.form.markAsUntouched();
    } else {
      this.form.reset();
    }
    this.submitError.set(null);
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(null);

    const raw = this.form.getRawValue();
    const product: Product = {
      id: raw.id,
      name: raw.name,
      description: raw.description,
      logo: raw.logo,
      dateRelease: raw.dateRelease,
      dateRevision: raw.dateRevision,
    };

    const operation$ = this.isEditMode()
      ? this.updateUseCase.execute(this.id()!, { ...product })
      : this.createUseCase.execute(product);

    operation$.subscribe({
      next: (saved) => {
        this.isEditMode() ? this.store.replaceProduct(saved) : this.store.addProduct(saved);
        this.router.navigate(['/products']);
      },
      error: (err: unknown) => {
        this.isSubmitting.set(false);
        this.submitError.set(this.resolveErrorMessage(err));
      },
    });
  }

  private resolveErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (err.error?.message) return err.error.message;
      if (err.status === 400) return 'Datos inválidos. Revise el formulario.';
      if (err.status === 404) return 'Producto no encontrado.';
    }
    return 'Ocurrió un error inesperado. Intente nuevamente.';
  }
}
