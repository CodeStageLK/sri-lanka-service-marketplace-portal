import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ApiError } from '@/services/api-client';
import { getCategory } from '@/services/catalog-api';
import { CategoryHeader, SubcategoryCard, ServiceGrid } from '@/components/marketplace/catalog';
import { Breadcrumb } from '@/components/ui/display';
import { DiscoveryEmptyState } from '@/components/marketplace/discovery';
import { ErrorState } from '@/components/ui/feedback';
import { setCanonicalUrl, setPageSeo } from '@/lib/seo';

export function CategoryDetailPage() {
  const { categorySlug = '' } = useParams();
  const query = useQuery({
    queryKey: ['category', categorySlug],
    queryFn: ({ signal }) => getCategory(categorySlug, signal),
  });

  useEffect(() => {
    if (query.data) {
      setPageSeo(query.data.name, query.data.description ?? `Browse ${query.data.name} services on SERVE HUB.`);
      setCanonicalUrl(`/categories/${encodeURIComponent(query.data.slug)}`);
    }
  }, [query.data]);

  if (query.isLoading) return <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6"><div className="h-48 animate-pulse rounded-xl bg-muted" /></main>;
  if (query.isError) {
    if (query.error instanceof ApiError && query.error.status === 404) return <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6"><DiscoveryEmptyState type="category" /></main>;
    return <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6"><ErrorState description="The category could not be loaded." retry={() => void query.refetch()} /></main>;
  }
  if (!query.data) return null;

  const category = query.data;
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Breadcrumb items={[{ label: 'Categories', href: '/categories' }, { label: category.name }]} />
      <div className="mt-6"><CategoryHeader category={category} /></div>
      {category.children && category.children.length > 0 ? (
        <section className="mt-10" aria-labelledby="subcategories-heading">
          <h2 id="subcategories-heading" className="mb-5 text-2xl font-semibold text-primary">Subcategories</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{category.children.map((child) => <SubcategoryCard key={child.id} category={child} parentSlug={category.slug} />)}</div>
        </section>
      ) : null}
      {category.services && category.services.length > 0 ? (
        <section className="mt-10" aria-labelledby="services-heading">
          <h2 id="services-heading" className="mb-5 text-2xl font-semibold text-primary">Available services</h2>
          <ServiceGrid services={category.services} />
        </section>
      ) : (
        <section className="mt-10"><DiscoveryEmptyState /></section>
      )}
      {category.parent ? <p className="mt-10 text-sm"><Link className="text-primary underline" to={`/categories/${category.parent.slug}`}>Back to {category.parent.name}</Link></p> : null}
    </main>
  );
}
