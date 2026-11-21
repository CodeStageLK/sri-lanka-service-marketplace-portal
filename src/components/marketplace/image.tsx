import { ImageOff } from 'lucide-react';
import type { ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function MarketplaceImage({ alt, className, fallbackLabel = 'Image unavailable', ...props }: ImgHTMLAttributes<HTMLImageElement> & { fallbackLabel?: string }) {
  if (!props.src) {
    return (
      <span className={cn('inline-flex aspect-square min-h-16 flex-col items-center justify-center rounded-md bg-muted text-xs text-foreground-secondary', className)} role="img" aria-label={fallbackLabel}>
        <ImageOff className="mb-1 h-5 w-5" aria-hidden="true" />
        {fallbackLabel}
      </span>
    );
  }
  return <img className={cn('rounded-md object-cover', className)} alt={alt} {...props} />;
}
