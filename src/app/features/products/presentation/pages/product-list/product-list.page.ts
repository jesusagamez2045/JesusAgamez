import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { Product } from '../../../domain/models/product.model';
import { ProductStore } from '../../state/product.store';
import { DeleteProductUseCase } from '../../../application/use-cases/delete-product.use-case';
import { ProductTableComponent } from '../../components/product-table/product-table.component';
import { ProductSearchComponent } from '../../components/product-search/product-search.component';
import { ModalComponent } from '@shared/components/modal/modal.component';

@Component({
  selector: 'app-product-list-page',
  imports: [ProductTableComponent, ProductSearchComponent, ModalComponent],
  templateUrl: './product-list.page.html',
  styleUrl: './product-list.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListPage implements OnInit {
  private readonly store = inject(ProductStore);
  private readonly router = inject(Router);
  private readonly deleteUseCase = inject(DeleteProductUseCase);

  readonly products = this.store.paginatedProducts;
  readonly isLoading = this.store.isLoading;
  readonly error = this.store.error;
  readonly totalFiltered = this.store.totalFiltered;
  readonly pageSize = this.store.pageSize;
  readonly isEmpty = this.store.isEmpty;

  readonly pageSizeOptions = [5, 10, 20] as const;

  protected readonly productToDelete = signal<Product | null>(null);
  protected readonly isDeleting = signal(false);
  protected readonly deleteError = signal<string | null>(null);

  ngOnInit(): void {
    this.store.loadProducts();
  }

  onSearch(term: string): void {
    this.store.setSearchTerm(term);
  }

  onPageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.store.setPageSize(Number(select.value));
  }

  onEdit(product: Product): void {
    this.router.navigate(['/products/edit', product.id]);
  }

  onDelete(product: Product): void {
    this.deleteError.set(null);
    this.productToDelete.set(product);
  }

  onConfirmDelete(): void {
    const product = this.productToDelete();
    if (!product) return;

    this.isDeleting.set(true);

    this.deleteUseCase.execute(product.id).subscribe({
      next: () => {
        this.store.removeProduct(product.id);
        this.productToDelete.set(null);
        this.isDeleting.set(false);
      },
      error: (err: unknown) => {
        this.isDeleting.set(false);
        this.productToDelete.set(null);
        this.deleteError.set(this.resolveDeleteError(err));
      },
    });
  }

  onCancelDelete(): void {
    this.productToDelete.set(null);
  }

  onCreateProduct(): void {
    this.router.navigate(['/products/create']);
  }

  protected buildDeleteMessage(product: Product): string {
    return `¿Estás seguro de eliminar el producto "${product.name}"? Esta acción no se puede deshacer.`;
  }

  private resolveDeleteError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 404) return 'El producto ya no existe.';
      if (err.error?.message) return err.error.message;
    }
    return 'No se pudo eliminar el producto. Intente nuevamente.';
  }
}
