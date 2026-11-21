import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Badge({ className, children, ...props }: ComponentProps<'span'>) {
  return <span className={cn('inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-semibold text-foreground', className)} {...props}>{children}</span>;
}

export function Card({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('rounded-lg border border-border bg-card text-foreground shadow-sm', className)} {...props} />;
}

export function Avatar({ name, src, className }: { name: string; src?: string; className?: string }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  return src ? (
    <img className={cn('h-10 w-10 rounded-full object-cover', className)} src={src} alt={name} />
  ) : (
    <span className={cn('inline-grid h-10 w-10 place-items-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground', className)} aria-label={name}>{initials}</span>
  );
}

export function Rating({ value, max = 5 }: { value: number; max?: number }) {
  return <span className="text-sm font-medium" aria-label={`${value} out of ${max} rating`}>{Array.from({ length: max }, (_, index) => <span key={index} aria-hidden="true" className={index < Math.round(value) ? 'text-accent' : 'text-border'}>★</span>)}</span>;
}

export function StatusIndicator({ status }: { status: 'active' | 'pending' | 'inactive' }) {
  const classes = status === 'active' ? 'bg-success' : status === 'pending' ? 'bg-warning' : 'bg-danger';
  return <span className="inline-flex items-center gap-2 text-sm"><span className={cn('h-2 w-2 rounded-full', classes)} aria-hidden="true" />{status}</span>;
}

export function Divider({ label }: { label?: ReactNode }) {
  if (!label) return <hr className="border-border" />;
  return <div className="flex items-center gap-3"><hr className="flex-1 border-border" /><span className="text-xs text-foreground-secondary">{label}</span><hr className="flex-1 border-border" /></div>;
}

export function Breadcrumb({ items }: { items: Array<{ label: string; href?: string }> }) {
  return <nav aria-label="Breadcrumb" className="text-sm text-foreground-secondary"><ol className="flex flex-wrap items-center gap-2">{items.map((item, index) => <li key={`${item.label}-${index}`} className="flex items-center gap-2">{index > 0 ? <span aria-hidden="true">/</span> : null}{item.href ? <a href={item.href} className="hover:text-primary">{item.label}</a> : <span aria-current="page">{item.label}</span>}</li>)}</ol></nav>;
}
