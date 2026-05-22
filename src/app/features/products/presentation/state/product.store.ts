import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { Product } from '../../domain/models/product.model';
import { GetProductsUseCase } from '../../application/use-cases/get-products.use-case';

@Injectable()
export class ProductStore {
  private readonly getProductsUseCase = inject(GetProductsUseCase);

  readonly products = signal<Product[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly searchTerm = signal('');
  readonly pageSize = signal(5);

  readonly filteredProducts = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.products();
    return this.products().filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.id.toLowerCase().includes(term),
    );
  });

  readonly paginatedProducts = computed(() =>
    this.filteredProducts().slice(0, this.pageSize()),
  );

  readonly totalFiltered = computed(() => this.filteredProducts().length);

  readonly isEmpty = computed(
    () => !this.isLoading() && !this.error() && this.products().length === 0,
  );

  loadProducts(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.getProductsUseCase.execute().subscribe({
      next: (products) => {
        this.products.set(products);
        this.isLoading.set(false);
      },
      error: (err: unknown) => {
        this.error.set(this.resolveErrorMessage(err));
        this.isLoading.set(false);
      },
    });
  }

  removeProduct(id: string): void {
    this.products.update((list) => list.filter((p) => p.id !== id));
  }

  addProduct(product: Product): void {
    this.products.update((list) => [...list, product]);
  }

  replaceProduct(updated: Product): void {
    this.products.update((list) =>
      list.map((p) => (p.id === updated.id ? updated : p)),
    );
  }

  setSearchTerm(term: string): void {
    this.searchTerm.set(term);
  }

  setPageSize(size: number): void {
    this.pageSize.set(size);
  }

  private resolveErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 0) return 'No se pudo conectar al servidor. Verifique su conexión.';
      if (err.error?.message) return err.error.message;
      if (err.status >= 500) return 'Error del servidor. Intente más tarde.';
    }
    return 'Ocurrió un error inesperado. Intente nuevamente.';
  }
}
