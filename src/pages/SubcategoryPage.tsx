import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ApiError } from '@/services/api-client';
import { getCategory, listServices } from '@/services/catalog-api';
import { Breadcrumb } from '@/components/ui/display';
import { DiscoveryEmptyState } from '@/components/marketplace/discovery';
import { ErrorState } from '@/components/ui/feedback';
import { ServiceGrid } from '@/components/marketplace/catalog';
import { Button } from '@/components/ui/button';
import { setCanonicalUrl, setPageSeo } from '@/lib/seo';
import type { Category } from '@/types/catalog';

export function SubcategoryPage() {
  const { categorySlug = '', subcategorySlug = '' } = useParams();
  const parentQuery = useQuery({ queryKey: ['category', categorySlug], queryFn: ({ signal }) => getCategory(categorySlug, signal) });
  const subcategoryQuery = useQuery({ queryKey: ['category', subcategorySlug], queryFn: ({ signal }) => getCategory(subcategorySlug, signal) });

  useEffect(() => {
    if (subcategoryQuery.data) {
      setPageSeo(subcategoryQuery.data.name, subcategoryQuery.data.description ?? `Explore ${subcategoryQuery.data.name} services.`);
      setCanonicalUrl(`/categories/${encodeURIComponent(categorySlug)}/${encodeURIComponent(subcategoryQuery.data.slug)}`);
    }
  }, [categorySlug, subcategoryQuery.data]);

  if (parentQuery.isLoading || subcategoryQuery.isLoading) return <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6"><div className="h-64 animate-pulse rounded-xl bg-muted" /></main>;
  if (parentQuery.isError || subcategoryQuery.isError) {
    const error = subcategoryQuery.error ?? parentQuery.error;
    if (error instanceof ApiError && error.status === 404) return <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6"><DiscoveryEmptyState type="category" /></main>;
    return <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6"><ErrorState description="The subcategory could not be loaded." retry={() => { void parentQuery.refetch(); void subcategoryQuery.refetch(); }} /></main>;
  }
  if (!parentQuery.data || !subcategoryQuery.data) return null;

  const parent = parentQuery.data;
  const subcategory = subcategoryQuery.data;
  if (subcategory.parentId !== parent.id) return <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6"><DiscoveryEmptyState type="category" /></main>;

  return (
    <SubcategoryContent parentName={parent.name} parentSlug={parent.slug} subcategory={subcategory} />
  );
}

function SubcategoryContent({ parentName, parentSlug, subcategory }: { parentName: string; parentSlug: string; subcategory: Category }) {
  const services = useQuery({
    queryKey: ['services', { categoryId: subcategory.id, page: 1, limit: 100 }],
    queryFn: ({ signal }) => listServices({ categoryId: subcategory.id, page: 1, limit: 100, signal }),
  });
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Breadcrumb items={[{ label: 'Categories', href: '/categories' }, { label: parentName, href: `/categories/${parentSlug}` }, { label: subcategory.name }]} />
      <header className="mt-6 rounded-xl border border-border bg-card px-6 py-8"><h1 className="text-3xl font-bold text-primary sm:text-4xl">{subcategory.name}</h1>{subcategory.description ? <p className="mt-4 max-w-3xl text-foreground-secondary">{subcategory.description}</p> : null}<Button className="mt-6" asChild><Link to={`/providers?category=${encodeURIComponent(subcategory.id)}`}>Browse providers</Link></Button></header>
      <section className="mt-10" aria-labelledby="subcategory-services-heading"><h2 id="subcategory-services-heading" className="mb-5 text-2xl font-semibold text-primary">Available services</h2>{services.isLoading ? <div className="h-48 animate-pulse rounded-lg bg-muted" /> : services.isError ? <ErrorState description="Services could not be loaded." retry={() => void services.refetch()} /> : services.data && services.data.items.length > 0 ? <ServiceGrid services={services.data.items} /> : <DiscoveryEmptyState />}</section>
    </main>
  );
}
