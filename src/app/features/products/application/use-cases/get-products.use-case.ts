import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ProductRepository } from '../../domain/ports/product.repository';
import { Product } from '../../domain/models/product.model';

@Injectable()
export class GetProductsUseCase {
  private readonly repository = inject(ProductRepository);

  execute(): Observable<Product[]> {
    return this.repository.getAll();
  }
}
