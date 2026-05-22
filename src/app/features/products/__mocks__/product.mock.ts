import { Product } from '../domain/models/product.model';
import { ProductDto } from '../application/dtos/product-response.dto';

export const mockProduct = (overrides?: Partial<Product>): Product => ({
  id: 'test-001',
  name: 'Producto Test',
  description: 'Descripción del producto de prueba',
  logo: 'https://example.com/logo.png',
  dateRelease: '2025-01-01',
  dateRevision: '2026-01-01',
  ...overrides,
});

export const mockProductDto = (overrides?: Partial<ProductDto>): ProductDto => ({
  id: 'test-001',
  name: 'Producto Test',
  description: 'Descripción del producto de prueba',
  logo: 'https://example.com/logo.png',
  date_release: '2025-01-01',
  date_revision: '2026-01-01',
  ...overrides,
});

export const mockProductList = (count = 3): Product[] =>
  Array.from({ length: count }, (_, i) =>
    mockProduct({ id: `test-00${i + 1}`, name: `Producto ${i + 1}` }),
  );
