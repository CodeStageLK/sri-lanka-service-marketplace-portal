import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ApiError } from '@/services/api-client';
import { getService, listServices } from '@/services/catalog-api';
import { Breadcrumb } from '@/components/ui/display';
import { Button } from '@/components/ui/button';
import { ServiceGrid } from '@/components/marketplace/catalog';
import { DiscoveryEmptyState } from '@/components/marketplace/discovery';
import { ErrorState } from '@/components/ui/feedback';
import { setCanonicalUrl, setPageSeo } from '@/lib/seo';
import type { Service } from '@/types/catalog';

export function ServiceDetailPage() {
  const { serviceSlug = '' } = useParams();
  const serviceQuery = useQuery({ queryKey: ['service', serviceSlug], queryFn: ({ signal }) => getService(serviceSlug, signal) });

  useEffect(() => {
    if (serviceQuery.data) {
      setPageSeo(serviceQuery.data.name, serviceQuery.data.description ?? `Learn about ${serviceQuery.data.name} on SERVE HUB.`);
      setCanonicalUrl(`/services/${encodeURIComponent(serviceQuery.data.slug)}`);
    }
  }, [serviceQuery.data]);

  if (serviceQuery.isLoading) return <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6"><div className="h-64 animate-pulse rounded-xl bg-muted" /></main>;
  if (serviceQuery.isError) {
    if (serviceQuery.error instanceof ApiError && serviceQuery.error.status === 404) return <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6"><DiscoveryEmptyState /></main>;
    return <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6"><ErrorState description="The service could not be loaded." retry={() => void serviceQuery.refetch()} /></main>;
  }
  if (!serviceQuery.data) return null;

  const service = serviceQuery.data;
  return <ServiceDetailContent service={service} />;
}

function ServiceDetailContent({ service }: { service: Service }) {
  const relatedQuery = useQuery({
    enabled: Boolean(service.categoryId),
    queryKey: ['services', { categoryId: service.categoryId, exclude: service.id, limit: 7 }],
    queryFn: ({ signal }) => listServices({ categoryId: service.categoryId, page: 1, limit: 7, signal }),
  });
  const related = relatedQuery.data?.items.filter((item) => item.id !== service.id).slice(0, 6) ?? [];
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Breadcrumb items={[{ label: 'Categories', href: '/categories' }, ...(service.category ? [{ label: service.category.name, href: `/categories/${service.category.slug}` }] : []), { label: service.name }]} />
      <article className="mt-6 rounded-xl border border-border bg-card px-6 py-8 sm:px-8">
        {service.category ? <Link className="text-sm font-semibold text-secondary" to={`/categories/${service.category.slug}`}>{service.category.name}</Link> : null}
        <h1 className="mt-3 text-3xl font-bold text-primary sm:text-4xl">{service.name}</h1>
        {service.description ? <p className="mt-5 max-w-3xl text-base leading-7 text-foreground-secondary">{service.description}</p> : null}
        <Button className="mt-7" asChild><Link to={`/providers?service=${encodeURIComponent(service.id)}`}>Find providers</Link></Button>
      </article>
      {relatedQuery.isLoading ? <section className="mt-10"><div className="h-48 animate-pulse rounded-lg bg-muted" /></section> : relatedQuery.isError ? null : related.length > 0 ? <section className="mt-10" aria-labelledby="related-services-heading"><h2 id="related-services-heading" className="mb-5 text-2xl font-semibold text-primary">Related services</h2><ServiceGrid services={related} /></section> : null}
    </main>
  );
}
