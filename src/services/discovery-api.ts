import { apiRequest } from '@/services/api-client';
import type { LocationItem, LocationListResponse, ProviderSearchResponse, ProviderSort, PublicProviderProfile } from '@/types/discovery';

export interface ProviderSearchQuery {
  keyword?: string;
  categoryId?: string;
  serviceId?: string;
  provinceId?: string;
  districtId?: string;
  locationId?: string;
  providerType?: 'INDIVIDUAL' | 'BUSINESS';
  minRating?: number;
  page?: number;
  limit?: number;
  sort?: ProviderSort;
  signal?: AbortSignal;
}

function searchQuery(query: ProviderSearchQuery): string {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (key === 'signal' || value === undefined || value === '' || value === null) return;
    params.set(key, String(value));
  });
  const value = params.toString();
  return value ? `?${value}` : '';
}

export function searchProviders(query: ProviderSearchQuery) {
  return apiRequest<ProviderSearchResponse>(`/providers/search${searchQuery(query)}`, { signal: query.signal });
}

export function getPublicProvider(idOrSlug: string, signal?: AbortSignal) {
  return apiRequest<PublicProviderProfile>(`/providers/public/${encodeURIComponent(idOrSlug)}`, { signal });
}

export function listProvinces(signal?: AbortSignal) {
  return apiRequest<LocationItem[]>('/locations/provinces', { signal });
}

export function listDistricts(provinceIdOrSlug: string, signal?: AbortSignal) {
  return apiRequest<LocationItem[]>(`/locations/provinces/${encodeURIComponent(provinceIdOrSlug)}/districts`, { signal });
}

export function listCities(districtIdOrSlug: string, signal?: AbortSignal) {
  return apiRequest<LocationItem[]>(`/locations/districts/${encodeURIComponent(districtIdOrSlug)}/cities`, { signal });
}

export function searchLocations(search: string, type?: 'PROVINCE' | 'DISTRICT' | 'CITY' | 'TOWN', signal?: AbortSignal) {
  const params = new URLSearchParams({ page: '1', limit: '20' });
  if (search.trim()) params.set('search', search.trim());
  if (type) params.set('type', type);
  return apiRequest<LocationListResponse>(`/locations/search?${params.toString()}`, { signal });
}
