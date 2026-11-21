import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useToastStore } from '@/stores/toast-store';

export function ToastViewport() {
  const { toasts, dismiss } = useToastStore();
  useEffect(() => {
    if (!toasts.length) return;
    const timers = toasts.map((toast) => window.setTimeout(() => dismiss(toast.id), 5000));
    return () => timers.forEach(window.clearTimeout);
  }, [toasts, dismiss]);

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2" aria-live="polite" aria-label="Notifications">
      {toasts.map((toast) => (
        <div key={toast.id} role="status" className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 text-foreground shadow-lg">
          <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{toast.title}</p>{toast.message ? <p className="mt-1 text-xs text-foreground-secondary">{toast.message}</p> : null}</div>
          <button type="button" className="grid h-8 w-8 shrink-0 place-items-center rounded-md hover:bg-muted" onClick={() => dismiss(toast.id)} aria-label="Dismiss notification"><X className="h-4 w-4" /></button>
        </div>
      ))}
    </div>
  );
}
