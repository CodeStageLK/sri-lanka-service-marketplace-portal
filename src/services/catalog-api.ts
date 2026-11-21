import { apiRequest } from '@/services/api-client';
import type { Category, CategoryListResponse, Service, ServiceListResponse } from '@/types/catalog';

export interface CatalogQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  signal?: AbortSignal;
}

function queryString(query: CatalogQuery): string {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.search?.trim()) params.set('search', query.search.trim());
  if (query.categoryId) params.set('categoryId', query.categoryId);
  const value = params.toString();
  return value ? `?${value}` : '';
}

export function listCategories(query: CatalogQuery = {}) {
  return apiRequest<CategoryListResponse>(`/categories${queryString(query)}`, { signal: query.signal });
}

export function getCategory(idOrSlug: string, signal?: AbortSignal) {
  return apiRequest<Category>(`/categories/${encodeURIComponent(idOrSlug)}`, { signal });
}

export function listServices(query: CatalogQuery = {}) {
  return apiRequest<ServiceListResponse>(`/services${queryString(query)}`, { signal: query.signal });
}

export function getService(idOrSlug: string, signal?: AbortSignal) {
  return apiRequest<Service>(`/services/${encodeURIComponent(idOrSlug)}`, { signal });
}
