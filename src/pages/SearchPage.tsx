import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Filter, X } from 'lucide-react';
import { LocationSelector, type LocationSelection } from '@/components/discovery/LocationSelector';
import { ProviderSearchCard } from '@/components/discovery/ProviderSearchCard';
import { Button } from '@/components/ui/button';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/feedback';
import { FormField, Input, Select } from '@/components/ui/form-controls';
import { Pagination } from '@/components/ui/navigation';
import { listCategories, listServices } from '@/services/catalog-api';
import { searchProviders } from '@/services/discovery-api';
import { setCanonicalUrl, setPageSeo } from '@/lib/seo';
import type { ProviderSort } from '@/types/discovery';

function useDebouncedValue(value: string, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [draftKeyword, setDraftKeyword] = useState(params.get('q') ?? '');
  const keyword = useDebouncedValue(draftKeyword);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const page = Math.max(1, Number(params.get('page') ?? '1') || 1);
  const limit = Math.min(100, Math.max(1, Number(params.get('limit') ?? '20') || 20));
  const categoryId = params.get('category') ?? '';
  const serviceId = params.get('service') ?? '';
  const provinceId = params.get('province') ?? '';
  const districtId = params.get('district') ?? '';
  const locationId = params.get('location') ?? '';
  const providerType = params.get('type') as '' | 'INDIVIDUAL' | 'BUSINESS';
  const minRating = Number(params.get('rating') ?? '0') || 0;
  const sort = (params.get('sort') as ProviderSort | null) ?? undefined;

  useEffect(() => {
    setPageSeo('Find Service Providers', 'Search for verified service providers across Sri Lanka.');
    setCanonicalUrl('/search');
  }, []);

  useEffect(() => {
    setParams((current) => {
      if ((current.get('q') ?? '') === keyword) return current;
      const next = new URLSearchParams(current);
      if (keyword) next.set('q', keyword);
      else next.delete('q');
      next.delete('page');
      return next;
    });
  }, [keyword, setParams]);

  const categories = useQuery({
    queryKey: ['categories', { page: 1, limit: 100 }],
    queryFn: ({ signal }) => listCategories({ page: 1, limit: 100, signal }),
  });
  const services = useQuery({
    queryKey: ['services', { page: 1, limit: 100, categoryId }],
    queryFn: ({ signal }) => listServices({ page: 1, limit: 100, categoryId: categoryId || undefined, signal }),
  });
  const providers = useQuery({
    queryKey: ['providers', 'search', { keyword, categoryId, serviceId, provinceId, districtId, locationId, providerType, minRating, page, limit, sort }],
    queryFn: ({ signal }) => searchProviders({
      keyword: keyword || undefined,
      categoryId: categoryId || undefined,
      serviceId: serviceId || undefined,
      provinceId: provinceId || undefined,
      districtId: districtId || undefined,
      locationId: locationId || undefined,
      providerType: providerType || undefined,
      minRating: minRating || undefined,
      page,
      limit,
      sort,
      signal,
    }),
  });

  function updateParams(updates: Record<string, string>, removePage = false) {
    const next = new URLSearchParams(params);
    if (removePage) next.delete('page');
    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    setParams(next, { replace: false });
  }

  function locationChanged(value: LocationSelection) {
    updateParams({
      province: value.provinceId,
      district: value.districtId,
      location: value.locationId,
    }, true);
  }

  function clearAll() {
    setDraftKeyword('');
    setParams({});
  }

  const activeFilters = useMemo(() => {
    const items: Array<{ key: string; label: string }> = [];
    if (draftKeyword) items.push({ key: 'q', label: `Search: ${draftKeyword}` });
    if (categoryId) items.push({ key: 'category', label: 'Category selected' });
    if (serviceId) items.push({ key: 'service', label: 'Service selected' });
    if (provinceId) items.push({ key: 'province', label: 'Province selected' });
    if (districtId) items.push({ key: 'district', label: 'District selected' });
    if (locationId) items.push({ key: 'location', label: 'City/town selected' });
    if (providerType) items.push({ key: 'type', label: providerType === 'BUSINESS' ? 'Business' : 'Individual' });
    if (minRating) items.push({ key: 'rating', label: `${minRating}+ rating` });
    return items;
  }, [draftKeyword, categoryId, serviceId, provinceId, districtId, locationId, providerType, minRating]);

  function filterPanel() {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-primary">Filters</h2>
          {activeFilters.length > 0 ? <button type="button" className="text-sm text-primary underline" onClick={clearAll}>Clear all</button> : null}
        </div>
        <FormField label="Category" htmlFor="provider-category">
          <Select id="provider-category" value={categoryId} onChange={(event) => updateParams({ category: event.target.value, service: '' }, true)}>
            <option value="">All categories</option>
            {categories.data?.items.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </Select>
        </FormField>
        <FormField label="Service" htmlFor="provider-service">
          <Select id="provider-service" value={serviceId} onChange={(event) => updateParams({ service: event.target.value }, true)}>
            <option value="">All services</option>
            {services.data?.items.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
          </Select>
        </FormField>
        <LocationSelector
          value={{ provinceId, districtId, locationId }}
          onChange={locationChanged}
        />
        <FormField label="Provider type" htmlFor="provider-type">
          <Select id="provider-type" value={providerType} onChange={(event) => updateParams({ type: event.target.value }, true)}>
            <option value="">All providers</option>
            <option value="INDIVIDUAL">Individual</option>
            <option value="BUSINESS">Business</option>
          </Select>
        </FormField>
        <FormField label="Minimum rating" htmlFor="provider-rating">
          <Select id="provider-rating" value={String(minRating)} onChange={(event) => updateParams({ rating: event.target.value }, true)}>
            <option value="0">Any rating</option>
            <option value="1">1+ stars</option>
            <option value="2">2+ stars</option>
            <option value="3">3+ stars</option>
            <option value="4">4+ stars</option>
            <option value="5">5 stars</option>
          </Select>
        </FormField>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-widest text-secondary">Provider discovery</p>
        <h1 className="mt-2 text-3xl font-bold text-primary sm:text-4xl">Find a service provider</h1>
        <form role="search" className="mt-6 grid gap-3 rounded-lg border border-border bg-card p-4 shadow-sm md:grid-cols-[1fr_auto_auto]" onSubmit={(event) => { event.preventDefault(); updateParams({ q: draftKeyword }, true); }}>
          <label className="sr-only" htmlFor="provider-search">Search providers</label>
          <Input id="provider-search" value={draftKeyword} onChange={(event) => setDraftKeyword(event.target.value)} placeholder="Search by provider name or description" />
          <Button type="submit">Search</Button>
          <Button type="button" variant="outline" className="md:hidden" onClick={() => setMobileFiltersOpen(true)}><Filter className="mr-2 h-4 w-4" />Filters</Button>
        </form>
      </header>

      {activeFilters.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-2" aria-label="Active filters">
          {activeFilters.map((filter) => (
            <button key={filter.key} type="button" onClick={() => updateParams({ [filter.key]: '' }, true)} className="inline-flex min-h-9 items-center gap-2 rounded-full border border-border bg-card px-3 text-xs font-semibold" aria-label={`Remove ${filter.label}`}>
              {filter.label}<X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden rounded-lg border border-border bg-card p-5 lg:block" aria-label="Provider filters">{filterPanel()}</aside>
        <section aria-label="Provider search results">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-foreground-secondary" aria-live="polite">
              {providers.data ? `${providers.data.pagination.total} result${providers.data.pagination.total === 1 ? '' : 's'}` : 'Search results'}
            </p>
            <FormField label="Sort" htmlFor="provider-sort">
              <Select id="provider-sort" value={sort ?? ''} onChange={(event) => updateParams({ sort: event.target.value }, true)}>
                <option value="">Recommended</option>
                <option value="rating">Highest rated</option>
                <option value="newest">Newest</option>
              </Select>
            </FormField>
          </div>

          {providers.isLoading ? <div className="grid gap-4 md:grid-cols-2"><Skeleton className="h-64" /><Skeleton className="h-64" /></div> : null}
          {providers.isError ? <ErrorState description="Provider search could not be completed." retry={() => void providers.refetch()} /> : null}
          {providers.isSuccess && providers.data.items.length === 0 ? <EmptyState title="No providers found" description="Try changing the search term, category, rating or location." action={<Button variant="outline" onClick={clearAll}>Clear search</Button>} /> : null}
          {providers.isSuccess && providers.data.items.length > 0 ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">{providers.data.items.map((provider) => <ProviderSearchCard key={provider.id} provider={provider} />)}</div>
              <div className="mt-8">
                <Pagination page={providers.data.pagination.page} totalPages={providers.data.pagination.totalPages} onPageChange={(nextPage) => updateParams({ page: String(nextPage) }, false)} />
              </div>
            </>
          ) : null}
        </section>
      </div>

      {mobileFiltersOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Provider filters">
          <button type="button" className="absolute inset-0 bg-primary/40" aria-label="Close filters" onClick={() => setMobileFiltersOpen(false)} />
          <aside className="absolute bottom-0 right-0 top-0 w-[min(88vw,360px)] overflow-y-auto bg-card p-5 shadow-lg">
            <div className="mb-5 flex justify-end"><button type="button" className="grid h-11 w-11 place-items-center rounded-md hover:bg-muted" aria-label="Close filters" onClick={() => setMobileFiltersOpen(false)}><X className="h-5 w-5" /></button></div>
            {filterPanel()}
            <Button className="mt-6 w-full" onClick={() => setMobileFiltersOpen(false)}>View results</Button>
          </aside>
        </div>
      ) : null}
    </main>
  );
}
