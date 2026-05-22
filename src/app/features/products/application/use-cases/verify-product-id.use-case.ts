import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ProductRepository } from '../../domain/ports/product.repository';

@Injectable()
export class VerifyProductIdUseCase {
  private readonly repository = inject(ProductRepository);

  execute(id: string): Observable<boolean> {
    return this.repository.verifyId(id);
  }
}
