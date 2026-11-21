import { Search, X } from 'lucide-react';
import type { FormEvent } from 'react';
import { EmptyState, Skeleton } from '@/components/ui/feedback';
import { Input } from '@/components/ui/form-controls';

export function CategorySearch({ value, onChange, onClear }: { value: string; onChange: (value: string) => void; onClear: () => void }) {
  function submit(event: FormEvent) {
    event.preventDefault();
  }
  return (
    <form onSubmit={submit} role="search" className="relative max-w-xl">
      <label htmlFor="catalog-search" className="sr-only">Search categories and services</label>
      <Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-foreground-secondary" aria-hidden="true" />
      <Input id="catalog-search" className="pl-10 pr-11" value={value} onChange={(event) => onChange(event.target.value)} placeholder="Search categories or services" />
      {value ? <button type="button" className="absolute right-1 top-1 grid h-9 w-9 place-items-center rounded-md hover:bg-muted" onClick={onClear} aria-label="Clear search"><X className="h-4 w-4" /></button> : null}
    </form>
  );
}

export function DiscoveryEmptyState({ type = 'results' }: { type?: 'results' | 'category' }) {
  return <EmptyState title={type === 'category' ? 'Category not found' : 'No results found'} description={type === 'category' ? 'This category may be unavailable or the link may be incorrect.' : 'Try another search term or browse all categories.'} />;
}

export function CategorySkeleton({ count = 6 }: { count?: number }) {
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: count }, (_, index) => <div key={index} className="rounded-lg border border-border bg-card p-5"><Skeleton className="h-12 w-12" /><Skeleton className="mt-4 h-6 w-2/3" /><Skeleton className="mt-3 h-16 w-full" /></div>)}</div>;
}
