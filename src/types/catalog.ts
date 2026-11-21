export interface Category {
  id: string;
  parentId: string | null;
  slug: string;
  name: string;
  nameSi: string | null;
  nameTa: string | null;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  parent?: Category | null;
  children?: Category[];
  services?: Service[];
}

export interface Service {
  id: string;
  categoryId: string;
  slug: string;
  name: string;
  nameSi?: string | null;
  nameTa?: string | null;
  description: string | null;
  pricingType: string | null;
  priceFrom: string | null;
  priceTo: string | null;
  currency: string;
  isActive: boolean;
  category?: Category;
}

export interface CatalogPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CategoryListResponse {
  items: Category[];
  pagination: CatalogPagination;
}

export interface ServiceListResponse {
  items: Service[];
  pagination: CatalogPagination;
}
