import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex min-h-11 items-center justify-center rounded-md px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:opacity-90',
        secondary: 'bg-secondary text-secondary-foreground hover:opacity-90',
        outline: 'border border-primary text-primary hover:bg-muted',
        ghost: 'text-primary hover:bg-muted',
        destructive: 'bg-danger text-danger-foreground hover:opacity-90',
        accent: 'bg-accent text-accent-foreground hover:opacity-90',
      },
      size: {
        default: 'min-h-11 px-4',
        sm: 'min-h-9 px-3',
        lg: 'min-h-12 px-6',
        icon: 'h-11 w-11 p-0',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  isLoading = false,
  children,
  ...props
}: ComponentProps<'button'> & VariantProps<typeof buttonVariants> & {
  asChild?: boolean;
  isLoading?: boolean;
}) {
  const Component = asChild ? Slot : 'button';
  if (asChild) {
    return (
      <Slot
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </Slot>
    );
  }
  return (
    <Component
      className={cn(buttonVariants({ variant, size, className }), isLoading && 'cursor-wait')}
      aria-busy={isLoading || undefined}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" /> : null}
      {children}
    </Component>
  );
}

export { Button };
