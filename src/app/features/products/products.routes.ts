import { Routes } from '@angular/router';

import { ProductRepository } from './domain/ports/product.repository';
import { ProductHttpRepository } from './infrastructure/repositories/product-http.repository';
import { GetProductsUseCase } from './application/use-cases/get-products.use-case';
import { CreateProductUseCase } from './application/use-cases/create-product.use-case';
import { UpdateProductUseCase } from './application/use-cases/update-product.use-case';
import { VerifyProductIdUseCase } from './application/use-cases/verify-product-id.use-case';
import { ProductStore } from './presentation/state/product.store';
import { ProductListPage } from './presentation/pages/product-list/product-list.page';
import { ProductFormPage } from './presentation/pages/product-form/product-form.page';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    providers: [
      { provide: ProductRepository, useClass: ProductHttpRepository },
      GetProductsUseCase,
      CreateProductUseCase,
      UpdateProductUseCase,
      VerifyProductIdUseCase,
      ProductStore,
    ],
    children: [
      {
        path: '',
        component: ProductListPage,
      },
      {
        path: 'create',
        component: ProductFormPage,
      },
      {
        path: 'edit/:id',
        component: ProductFormPage,
      },
    ],
  },
];
