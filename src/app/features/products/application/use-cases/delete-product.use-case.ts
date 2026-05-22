import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ProductRepository } from '../../domain/ports/product.repository';

@Injectable()
export class DeleteProductUseCase {
  private readonly repository = inject(ProductRepository);

  execute(id: string): Observable<void> {
    return this.repository.delete(id);
  }
}
