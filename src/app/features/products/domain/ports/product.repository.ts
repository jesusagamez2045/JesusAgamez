import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

export abstract class ProductRepository {
  abstract getAll(): Observable<Product[]>;
  abstract create(product: Omit<Product, never>): Observable<Product>;
  abstract update(id: string, product: Omit<Product, 'id'>): Observable<Product>;
  abstract delete(id: string): Observable<void>;
  abstract verifyId(id: string): Observable<boolean>;
}
