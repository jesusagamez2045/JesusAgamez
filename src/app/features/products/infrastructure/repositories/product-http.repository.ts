import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ProductRepository } from '../../domain/ports/product.repository';
import { Product } from '../../domain/models/product.model';
import { ProductMapper } from '../../application/mappers/product.mapper';
import {
  GetProductsResponseDto,
  ProductMutationResponseDto,
} from '../../application/dtos/product-response.dto';
import { ENVIRONMENT } from '@core/tokens/environment.token';

@Injectable()
export class ProductHttpRepository extends ProductRepository {
  private readonly http = inject(HttpClient);
  private readonly env = inject(ENVIRONMENT);

  getAll(): Observable<Product[]> {
    return this.http
      .get<GetProductsResponseDto>(`${this.env.apiUrl}/bp/products`)
      .pipe(map((response) => ProductMapper.toDomainList(response.data)));
  }

  create(product: Product): Observable<Product> {
    return this.http
      .post<ProductMutationResponseDto>(
        `${this.env.apiUrl}/bp/products`,
        ProductMapper.toCreateDto(product),
      )
      .pipe(map((response) => ProductMapper.toDomain(response.data)));
  }

  update(id: string, product: Omit<Product, 'id'>): Observable<Product> {
    return this.http
      .put<ProductMutationResponseDto>(
        `${this.env.apiUrl}/bp/products/${id}`,
        ProductMapper.toUpdateDto(product),
      )
      .pipe(map((response) => ProductMapper.toDomain(response.data)));
  }

  delete(id: string): Observable<void> {
    return this.http
      .delete(`${this.env.apiUrl}/bp/products/${id}`)
      .pipe(map(() => undefined));
  }

  verifyId(id: string): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.env.apiUrl}/bp/products/verification/${id}`,
    );
  }
}
