import { useEffect, useRef, type ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, LoaderCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Alert({ tone = 'info', title, children }: { tone?: 'success' | 'warning' | 'danger' | 'info'; title?: string; children: ReactNode }) {
  const Icon = tone === 'success' ? CheckCircle2 : tone === 'danger' ? XCircle : tone === 'warning' ? AlertCircle : Info;
  const styles = { success: 'border-success/30 bg-success/10 text-success', warning: 'border-warning/30 bg-warning/10 text-warning', danger: 'border-danger/30 bg-danger/10 text-danger', info: 'border-info/30 bg-info/10 text-info' };
  return <div role={tone === 'danger' ? 'alert' : 'status'} className={cn('flex gap-3 rounded-md border p-4', styles[tone])}><Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" /><div><strong className="block text-sm">{title}</strong>{children}</div></div>;
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="rounded-lg border border-dashed border-border px-6 py-12 text-center"><h2 className="text-lg font-semibold text-primary">{title}</h2><p className="mx-auto mt-2 max-w-md text-sm text-foreground-secondary">{description}</p>{action ? <div className="mt-5">{action}</div> : null}</div>;
}

export function ErrorState({ title = 'Something went wrong', description, retry }: { title?: string; description?: string; retry?: () => void }) {
  return <div role="alert" className="rounded-lg border border-danger/30 bg-danger/5 px-6 py-8 text-center"><XCircle className="mx-auto h-8 w-8 text-danger" aria-hidden="true" /><h2 className="mt-3 font-semibold text-primary">{title}</h2>{description ? <p className="mt-1 text-sm text-foreground-secondary">{description}</p> : null}{retry ? <button type="button" onClick={retry} className="mt-4 text-sm font-semibold text-primary underline">Try again</button> : null}</div>;
}

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return <span className="inline-flex items-center gap-2 text-sm" role="status"><LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />{label}</span>;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} aria-hidden="true" />;
}

export function ConfirmationDialog({ open, title, description, confirmLabel = 'Confirm', destructive = false, onConfirm, onClose }: {
  open: boolean; title: string; description: string; confirmLabel?: string; destructive?: boolean; onConfirm: () => void; onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return <dialog ref={dialogRef} onCancel={(event) => { event.preventDefault(); onClose(); }} className="m-auto w-[calc(100%-2rem)] max-w-md rounded-lg border border-border bg-card p-0 text-foreground shadow-lg"><div className="p-6"><h2 className="text-lg font-semibold text-primary">{title}</h2><p className="mt-2 text-sm text-foreground-secondary">{description}</p><div className="mt-6 flex justify-end gap-3"><button type="button" className="min-h-11 rounded-md border border-border px-4 text-sm font-semibold" onClick={onClose}>Cancel</button><button type="button" autoFocus className={cn('min-h-11 rounded-md px-4 text-sm font-semibold', destructive ? 'bg-danger text-danger-foreground' : 'bg-primary text-primary-foreground')} onClick={onConfirm}>{confirmLabel}</button></div></div></dialog>;
}
