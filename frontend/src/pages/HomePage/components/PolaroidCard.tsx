import type { CSSProperties } from 'react';
import { cn } from '@/utils/cn';

export interface PolaroidCardProps {
  image: string;
  alt: string;
  label: string;
  caption: string;
  tilt?: number;
  offsetClassName?: string;
  className?: string;
}

export function PolaroidCard({
  image,
  alt,
  label,
  caption,
  tilt = 0,
  offsetClassName,
  className,
}: PolaroidCardProps) {
  return (
    <div
      className={cn('dw-panel dw-lift relative bg-paper p-3 pb-4 shadow-sm', offsetClassName, className)}
      style={{ '--tilt': `${tilt}deg`, transform: `rotate(${tilt}deg)` } as CSSProperties}
    >
      <span className="dw-tape absolute -top-3 left-1/2 -translate-x-1/2 -rotate-2" aria-hidden="true" />
      <div className="aspect-[4/5] w-full overflow-hidden bg-cream">
        <img src={image} alt={alt} className="h-full w-full object-cover" loading="lazy" />
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="dw-micro">{label}</span>
        <span className="dw-hand text-lg text-primary">{caption}</span>
      </div>
    </div>
  );
}
