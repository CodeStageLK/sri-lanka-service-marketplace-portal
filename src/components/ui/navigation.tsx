import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Tooltip({ children, label }: { children: ReactNode; label: string }) {
  return <span className="group relative inline-flex" aria-label={label}><span aria-hidden="true">{children}</span><span role="tooltip" className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground group-hover:block group-focus-within:block">{label}</span></span>;
}

export function Pagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (page: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2">
      <button type="button" className="min-h-10 rounded-md border border-border px-3 text-sm disabled:opacity-50" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Previous</button>
      <span className="px-2 text-sm text-foreground-secondary" aria-live="polite">Page {page} of {totalPages}</span>
      <button type="button" className="min-h-10 rounded-md border border-border px-3 text-sm disabled:opacity-50" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Next</button>
    </nav>
  );
}

export function VisuallyHidden({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('sr-only', className)}>{children}</span>;
}
