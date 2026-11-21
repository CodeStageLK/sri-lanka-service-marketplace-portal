import { BriefcaseBusiness, MapPin, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar, Badge, Card } from '@/components/ui/display';
import type { ProviderProfileSummary } from '@/types/discovery';

export function ProviderSearchCard({ provider, showShare = true }: { provider: ProviderProfileSummary; showShare?: boolean }) {
  const rating = Number(provider.averageRating);
  const firstArea = provider.serviceAreas?.[0]?.location;
  const firstService = provider.providerServices?.[0]?.service;
  return (
    <Card className="flex h-full flex-col p-5">
      <div className="flex items-start gap-4">
        <Avatar name={provider.displayName} src={undefined} />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-semibold text-primary">{provider.displayName}</h2>
          {provider.businessDetails?.businessName ? <p className="mt-0.5 text-sm text-foreground-secondary">{provider.businessDetails.businessName}</p> : null}
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge>{provider.providerType === 'BUSINESS' ? 'Business' : 'Individual'}</Badge>
            {provider.verificationStatus === 'APPROVED' ? <Badge className="border-success/30 bg-success/10 text-success">Verified</Badge> : null}
          </div>
        </div>
      </div>
      {provider.description ? <p className="mt-4 line-clamp-3 text-sm text-foreground-secondary">{provider.description}</p> : null}
      <div className="mt-4 space-y-2 text-sm">
        {firstService ? <p className="flex items-center gap-2"><BriefcaseBusiness className="h-4 w-4 text-secondary" aria-hidden="true" /><span>{firstService.name}</span></p> : null}
        {firstArea ? <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-secondary" aria-hidden="true" /><span>{firstArea.name}</span></p> : null}
        {provider.experienceYears > 0 ? <p>{provider.experienceYears} years experience</p> : null}
        {provider.totalReviews > 0 ? <p className="flex items-center gap-1"><Star className="h-4 w-4 fill-accent text-accent" aria-hidden="true" /><span>{rating.toFixed(1)} ({provider.totalReviews} reviews)</span></p> : null}
      </div>
      <div className="mt-5 flex gap-2">
        <Link className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md border border-primary px-4 text-sm font-semibold text-primary hover:bg-muted" to={`/providers/${encodeURIComponent(provider.id)}`}>View profile</Link>
        {showShare ? <button type="button" className="min-h-11 rounded-md border border-border px-3 text-sm" onClick={() => void navigator.clipboard?.writeText(`${window.location.origin}/providers/${encodeURIComponent(provider.id)}`)} aria-label={`Share ${provider.displayName}`}>Share</button> : null}
      </div>
    </Card>
  );
}
