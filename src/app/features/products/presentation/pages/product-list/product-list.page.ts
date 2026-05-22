import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Product } from '../../../domain/models/product.model';
import { ProductStore } from '../../state/product.store';
import { ProductTableComponent } from '../../components/product-table/product-table.component';
import { ProductSearchComponent } from '../../components/product-search/product-search.component';

@Component({
  selector: 'app-product-list-page',
  imports: [ProductTableComponent, ProductSearchComponent],
  templateUrl: './product-list.page.html',
  styleUrl: './product-list.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListPage implements OnInit {
  private readonly store = inject(ProductStore);
  private readonly router = inject(Router);

  readonly products = this.store.paginatedProducts;
  readonly isLoading = this.store.isLoading;
  readonly error = this.store.error;
  readonly totalFiltered = this.store.totalFiltered;
  readonly pageSize = this.store.pageSize;
  readonly isEmpty = this.store.isEmpty;

  readonly pageSizeOptions = [5, 10, 20] as const;

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

  onDelete(_product: Product): void {
    // Modal de confirmación implementado en ETAPA 6
  }

  onCreateProduct(): void {
    this.router.navigate(['/products/create']);
  }
}
