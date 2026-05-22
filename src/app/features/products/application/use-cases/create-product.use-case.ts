import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ProductRepository } from '../../domain/ports/product.repository';
import { Product } from '../../domain/models/product.model';

@Injectable()
export class CreateProductUseCase {
  private readonly repository = inject(ProductRepository);

  execute(product: Product): Observable<Product> {
    return this.repository.create(product);
  }
}
