export interface CreateProductRequestDto {
  id: string;
  name: string;
  description: string;
  logo: string;
  date_release: string;
  date_revision: string;
}

export interface UpdateProductRequestDto {
  name: string;
  description: string;
  logo: string;
  date_release: string;
  date_revision: string;
}
