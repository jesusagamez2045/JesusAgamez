import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ProductRepository } from '../../domain/ports/product.repository';
import { Product } from '../../domain/models/product.model';

@Injectable()
export class UpdateProductUseCase {
  private readonly repository = inject(ProductRepository);

  execute(id: string, product: Omit<Product, 'id'>): Observable<Product> {
    return this.repository.update(id, product);
  }
}
