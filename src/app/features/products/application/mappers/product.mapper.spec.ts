import { ProductMapper } from './product.mapper';
import { mockProduct, mockProductDto } from '../../__mocks__/product.mock';

describe('ProductMapper', () => {
  describe('toDomain', () => {
    it('should map a DTO to a domain model', () => {
      const dto = mockProductDto();
      const result = ProductMapper.toDomain(dto);

      expect(result).toEqual({
        id: dto.id,
        name: dto.name,
        description: dto.description,
        logo: dto.logo,
        dateRelease: dto.date_release,
        dateRevision: dto.date_revision,
      });
    });

    it('should map snake_case fields to camelCase', () => {
      const dto = mockProductDto({ date_release: '2025-06-01', date_revision: '2026-06-01' });
      const result = ProductMapper.toDomain(dto);

      expect(result.dateRelease).toBe('2025-06-01');
      expect(result.dateRevision).toBe('2026-06-01');
    });
  });

  describe('toDomainList', () => {
    it('should map an array of DTOs to domain models', () => {
      const dtos = [mockProductDto({ id: 'a' }), mockProductDto({ id: 'b' })];
      const result = ProductMapper.toDomainList(dtos);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('a');
      expect(result[1].id).toBe('b');
    });

    it('should return empty array for empty input', () => {
      expect(ProductMapper.toDomainList([])).toEqual([]);
    });
  });

  describe('toCreateDto', () => {
    it('should map a domain model to a create DTO', () => {
      const product = mockProduct();
      const result = ProductMapper.toCreateDto(product);

      expect(result).toEqual({
        id: product.id,
        name: product.name,
        description: product.description,
        logo: product.logo,
        date_release: product.dateRelease,
        date_revision: product.dateRevision,
      });
    });
  });

  describe('toUpdateDto', () => {
    it('should map a domain model to an update DTO without id', () => {
      const product = mockProduct();
      const result = ProductMapper.toUpdateDto(product);

      expect(result).not.toHaveProperty('id');
      expect(result.name).toBe(product.name);
      expect(result.date_release).toBe(product.dateRelease);
    });
  });
});
