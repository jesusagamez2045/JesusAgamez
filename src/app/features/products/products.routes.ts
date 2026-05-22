import { Routes } from '@angular/router';

import { ProductRepository } from './domain/ports/product.repository';
import { ProductHttpRepository } from './infrastructure/repositories/product-http.repository';
import { GetProductsUseCase } from './application/use-cases/get-products.use-case';
import { ProductStore } from './presentation/state/product.store';
import { ProductListPage } from './presentation/pages/product-list/product-list.page';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    providers: [
      { provide: ProductRepository, useClass: ProductHttpRepository },
      GetProductsUseCase,
      ProductStore,
    ],
    children: [
      {
        path: '',
        component: ProductListPage,
      },
    ],
  },
];
