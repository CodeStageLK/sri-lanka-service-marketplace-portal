import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ApiError } from '@/services/api-client';
import { getPublicProvider } from '@/services/discovery-api';
import { Avatar, Badge, Card } from '@/components/ui/display';
import { EmptyState, ErrorState } from '@/components/ui/feedback';
import { Button } from '@/components/ui/button';
import { MarketplaceImage } from '@/components/marketplace/image';
import { setCanonicalUrl, setPageSeo } from '@/lib/seo';

export function ProviderDetailPage() {
  const { providerId = '' } = useParams();
  const providerQuery = useQuery({
    queryKey: ['provider', 'public', providerId],
    queryFn: ({ signal }) => getPublicProvider(providerId, signal),
  });

  useEffect(() => {
    if (providerQuery.data) {
      setPageSeo(providerQuery.data.displayName, providerQuery.data.description ?? `View ${providerQuery.data.displayName} on SERVE HUB.`);
      setCanonicalUrl(`/providers/${encodeURIComponent(providerQuery.data.id)}`);
    }
  }, [providerQuery.data]);

  if (providerQuery.isLoading) return <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6"><div className="h-64 animate-pulse rounded-xl bg-muted" /></main>;
  if (providerQuery.isError) {
    if (providerQuery.error instanceof ApiError && providerQuery.error.status === 404) return <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6"><EmptyState title="Provider not found" description="This provider is unavailable or the profile link is invalid." /></main>;
    return <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6"><ErrorState description="The provider profile could not be loaded." retry={() => void providerQuery.refetch()} /></main>;
  }
  if (!providerQuery.data) return null;

  const provider = providerQuery.data;
  const mainCategory = provider.providerServices.find((item) => item.service.category)?.service.category;
  const locationNames = [...new Map(provider.serviceAreas.map((item) => [item.location.id, item.location.name])).values()];
  const rating = Number(provider.averageRating);
  const shareProfile = () => {
    void navigator.clipboard?.writeText(window.location.href);
  };
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Card className="p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <Avatar name={provider.displayName} src={undefined} className="h-20 w-20 text-lg" />
          <div>
            <div className="flex flex-wrap items-center gap-2"><h1 className="text-3xl font-bold text-primary">{provider.displayName}</h1>{provider.verificationStatus === 'APPROVED' ? <Badge className="border-success/30 bg-success/10 text-success">Verified</Badge> : null}</div>
            {provider.businessDetails?.businessName ? <p className="mt-1 text-foreground-secondary">{provider.businessDetails.businessName}</p> : null}
            {mainCategory ? <p className="mt-2 text-sm font-semibold text-secondary">{mainCategory.name}</p> : null}
            {locationNames.length > 0 ? <p className="mt-1 text-sm text-foreground-secondary">{locationNames.join(', ')}</p> : null}
            {provider.totalReviews > 0 ? <p className="mt-2 text-sm" aria-label={`${rating.toFixed(1)} out of 5, ${provider.totalReviews} reviews`}><span className="text-accent">★</span> {rating.toFixed(1)} ({provider.totalReviews} reviews)</p> : null}
            {provider.description ? <p className="mt-4 max-w-3xl leading-7 text-foreground-secondary">{provider.description}</p> : null}
            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild><Link to="/dashboard">Create a service request</Link></Button>
              <Button variant="outline" onClick={shareProfile}>Share profile</Button>
            </div>
          </div>
        </div>
        <div className="mt-8 grid gap-4 border-t border-border pt-6 sm:grid-cols-3">
          <div><p className="text-xs text-foreground-secondary">Provider type</p><p className="mt-1 font-semibold">{provider.providerType === 'BUSINESS' ? 'Business' : 'Individual'}</p></div>
          <div><p className="text-xs text-foreground-secondary">Experience</p><p className="mt-1 font-semibold">{provider.experienceYears > 0 ? `${provider.experienceYears} years` : 'Not provided'}</p></div>
          <div><p className="text-xs text-foreground-secondary">Reviews</p><p className="mt-1 font-semibold">{provider.totalReviews > 0 ? `${provider.totalReviews} reviews` : 'No reviews yet'}</p></div>
        </div>
      </Card>
      {provider.providerServices.length > 0 ? (
        <section id="services" className="mt-8">
          <h2 className="mb-4 text-2xl font-semibold text-primary">Services offered</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {provider.providerServices.map((item) => (
              <Card key={item.id} className="p-5">
                <Link className="font-semibold text-primary hover:underline" to={`/services/${encodeURIComponent(item.service.slug)}`}>{item.service.name}</Link>
                {item.description ? <p className="mt-2 text-sm text-foreground-secondary">{item.description}</p> : null}
                {item.service.category ? <p className="mt-2 text-xs text-secondary">{item.service.category.name}</p> : null}
                {(item.priceFrom || item.priceTo) ? (
                  <p className="mt-3 text-sm font-semibold">
                    {item.priceFrom && item.priceTo
                      ? `${item.currency} ${item.priceFrom}–${item.priceTo}`
                      : `${item.currency} ${item.priceFrom ?? item.priceTo}`}
                  </p>
                ) : null}
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {provider.portfolio.length > 0 ? (
        <section className="mt-10">
          <h2 className="mb-4 text-2xl font-semibold text-primary">Portfolio</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {provider.portfolio.map((item) => (
              <Card key={item.id} className="overflow-hidden p-0">
                <div className="grid min-h-44 place-items-center bg-muted">
                  <MarketplaceImage
                    alt={item.title ? `${item.title} portfolio image` : 'Provider portfolio image'}
                    className="h-44 w-full"
                    fallbackLabel="Portfolio image unavailable"
                  />
                </div>
                <div className="p-4">
                  {item.title ? <h3 className="font-semibold text-primary">{item.title}</h3> : null}
                  {item.description ? <p className="mt-1 text-sm text-foreground-secondary">{item.description}</p> : null}
                </div>
              </Card>
            ))}
          </div>
          <p className="mt-3 text-xs text-foreground-secondary">Image URLs are not exposed by the public provider API.</p>
        </section>
      ) : null}

      {provider.serviceAreas.length > 0 ? (
        <section className="mt-10">
          <h2 className="mb-4 text-2xl font-semibold text-primary">Service coverage</h2>
          <div className="flex flex-wrap gap-2">{provider.serviceAreas.map((item) => <Badge key={item.location.id}>{item.location.name}</Badge>)}</div>
        </section>
      ) : null}

      <section id="reviews" className="mt-10">
        <h2 className="mb-4 text-2xl font-semibold text-primary">Ratings and reviews</h2>
        <Card className="p-5">
          {provider.totalReviews > 0 ? (
            <p className="text-lg font-semibold text-primary">{rating.toFixed(1)} out of 5 · {provider.totalReviews} reviews</p>
          ) : (
            <p className="text-sm text-foreground-secondary">No reviewed feedback is currently available.</p>
          )}
          <p className="mt-2 text-xs text-foreground-secondary">Individual review entries are not exposed by the public provider API.</p>
        </Card>
      </section>
    </main>
  );
}
