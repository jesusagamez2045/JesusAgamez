export interface ProductDto {
  id: string;
  name: string;
  description: string;
  logo: string;
  date_release: string;
  date_revision: string;
}

export interface GetProductsResponseDto {
  data: ProductDto[];
}

export interface ProductMutationResponseDto {
  message: string;
  data: ProductDto;
}

export interface DeleteProductResponseDto {
  message: string;
}
