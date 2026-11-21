import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CategoryGrid } from '@/components/marketplace/catalog';
import { CategorySearch, CategorySkeleton, DiscoveryEmptyState } from '@/components/marketplace/discovery';
import { ErrorState } from '@/components/ui/feedback';
import { Pagination } from '@/components/ui/navigation';
import { setCanonicalUrl, setPageSeo } from '@/lib/seo';
import { listCategories, listServices } from '@/services/catalog-api';
import { Card } from '@/components/ui/display';
import { ServiceCard } from '@/components/marketplace/catalog';

export function CategoriesPage() {
  const [params, setParams] = useSearchParams();
  const search = params.get('q') ?? '';
  const page = Math.max(1, Number(params.get('page') ?? '1') || 1);

  useEffect(() => {
    setPageSeo('Service Categories', 'Browse service categories and subcategories across Sri Lanka.');
    setCanonicalUrl('/categories');
  }, []);

  const categoryQuery = useQuery({
    queryKey: ['categories', { page, search }],
    queryFn: ({ signal }) => listCategories({ page, limit: 20, search, signal }),
  });

  const serviceQuery = useQuery({
    queryKey: ['services', { page: 1, limit: 6, search }],
    enabled: Boolean(search),
    queryFn: ({ signal }) => listServices({ page: 1, limit: 6, search, signal }),
  });

  function setSearch(value: string) {
    setParams(value ? { q: value } : {});
  }

  const results = useMemo(() => categoryQuery.data?.items ?? [], [categoryQuery.data]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-secondary">Discover services</p>
        <h1 className="mt-2 text-3xl font-bold text-primary sm:text-4xl">All categories</h1>
        <p className="mt-3 max-w-2xl text-foreground-secondary">Browse categories and find the service you need across Sri Lanka.</p>
        <div className="mt-6"><CategorySearch value={search} onChange={setSearch} onClear={() => setSearch('')} /></div>
      </header>

      {categoryQuery.isLoading ? <CategorySkeleton /> : null}
      {categoryQuery.isError ? <ErrorState description="Categories could not be loaded." retry={() => void categoryQuery.refetch()} /> : null}
      {categoryQuery.isSuccess && results.length === 0 && !search ? <DiscoveryEmptyState /> : null}
      {categoryQuery.isSuccess && results.length > 0 ? <CategoryGrid categories={results} /> : null}

      {search ? (
        <section className="mt-12" aria-labelledby="service-results-heading">
          <h2 id="service-results-heading" className="mb-5 text-2xl font-semibold text-primary">Matching services</h2>
          {serviceQuery.isLoading ? <Card className="p-6"><p className="text-sm text-foreground-secondary">Loading services…</p></Card> : null}
          {serviceQuery.isError ? <ErrorState description="Services could not be loaded." retry={() => void serviceQuery.refetch()} /> : null}
          {serviceQuery.isSuccess && serviceQuery.data.items.length === 0 ? <DiscoveryEmptyState /> : null}
          {serviceQuery.isSuccess && serviceQuery.data.items.length > 0 ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{serviceQuery.data.items.map((service) => <ServiceCard key={service.id} service={service} />)}</div> : null}
        </section>
      ) : null}

      {categoryQuery.data ? (
        <div className="mt-8">
          <Pagination page={categoryQuery.data.pagination.page} totalPages={categoryQuery.data.pagination.totalPages} onPageChange={(nextPage) => setParams(search ? { q: search, page: String(nextPage) } : { page: String(nextPage) })} />
        </div>
      ) : null}
    </main>
  );
}
