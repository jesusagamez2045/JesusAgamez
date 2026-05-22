import { Product } from '../../domain/models/product.model';
import { ProductDto } from '../dtos/product-response.dto';
import { CreateProductRequestDto, UpdateProductRequestDto } from '../dtos/product-request.dto';

export class ProductMapper {
  static toDomain(dto: ProductDto): Product {
    return {
      id: dto.id,
      name: dto.name,
      description: dto.description,
      logo: dto.logo,
      dateRelease: dto.date_release,
      dateRevision: dto.date_revision,
    };
  }

  static toDomainList(dtos: ProductDto[]): Product[] {
    return dtos.map(ProductMapper.toDomain);
  }

  static toCreateDto(product: Product): CreateProductRequestDto {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      logo: product.logo,
      date_release: product.dateRelease,
      date_revision: product.dateRevision,
    };
  }

  static toUpdateDto(product: Omit<Product, 'id'>): UpdateProductRequestDto {
    return {
      name: product.name,
      description: product.description,
      logo: product.logo,
      date_release: product.dateRelease,
      date_revision: product.dateRevision,
    };
  }
}
