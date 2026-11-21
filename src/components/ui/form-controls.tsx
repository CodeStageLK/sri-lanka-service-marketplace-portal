import type {
  ComponentProps,
  ReactNode,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
} from 'react';
import { cn } from '@/lib/utils';

export interface FormFieldProps {
  label: ReactNode;
  htmlFor: string;
  description?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  children: ReactNode;
}

export function FormField({ label, htmlFor, description, error, required, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-foreground">
        {label}{required ? <span className="ml-1 text-danger" aria-hidden="true">*</span> : null}
      </label>
      {children}
      {description ? <p id={`${htmlFor}-description`} className="text-xs text-foreground-secondary">{description}</p> : null}
      {error ? <p id={`${htmlFor}-error`} role="alert" className="text-xs font-medium text-danger">{error}</p> : null}
    </div>
  );
}

const inputClassName = 'min-h-11 w-full rounded-md border border-border bg-card px-3 py-2 text-foreground placeholder:text-foreground-secondary disabled:cursor-not-allowed disabled:opacity-60';

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input className={cn(inputClassName, className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn('min-h-28 w-full rounded-md border border-border bg-card px-3 py-2 text-foreground', className)} {...props} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(inputClassName, className)} {...props} />;
}

export function Checkbox({ className, ...props }: ComponentProps<'input'>) {
  return <input type="checkbox" className={cn('h-4 w-4 rounded border-border accent-primary', className)} {...props} />;
}

export function Radio({ className, ...props }: ComponentProps<'input'>) {
  return <input type="radio" className={cn('h-4 w-4 border-border accent-primary', className)} {...props} />;
}

export function Switch({ checked, onCheckedChange, label, ...props }: ComponentProps<'button'> & {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label}
      onClick={() => onCheckedChange(!checked)}
      className={cn('relative h-6 w-11 rounded-full border border-border transition-colors', checked ? 'bg-secondary' : 'bg-muted')}
      {...props}>
      <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-card shadow-sm transition-transform', checked ? 'translate-x-5' : 'translate-x-0.5')} />
    </button>
  );
}
