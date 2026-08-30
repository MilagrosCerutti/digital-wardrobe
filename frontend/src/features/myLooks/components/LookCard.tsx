import type { CSSProperties } from 'react';
import { Badge } from '@/components/Badge';
import type { Outfit } from '@/features/myLooks/types/myLooks.types';
import { cn } from '@/utils/cn';

export interface LookCardProps {
  outfit: Outfit;
  tilt?: number;
  onClick?: () => void;
}

const MAX_THUMBNAILS = 4;

export function LookCard({ outfit, tilt = 0, onClick }: LookCardProps) {
  const thumbnails = outfit.items.slice(0, MAX_THUMBNAILS);
  const remainingCount = outfit.items.length - thumbnails.length;

  return (
    <button
      type="button"
      onClick={onClick}
      className="dw-panel dw-lift relative bg-paper p-3 pb-4 text-left shadow-sm"
      style={{ '--tilt': `${tilt}deg`, transform: `rotate(${tilt}deg)` } as CSSProperties}
    >
      <span className="dw-tape absolute -top-3 left-1/2 -translate-x-1/2 -rotate-2" aria-hidden="true" />

      <div className="grid aspect-square grid-cols-2 gap-1 overflow-hidden bg-cream">
        {thumbnails.map((item, index) => (
          <div key={item.id} className="relative overflow-hidden bg-cream">
            <img src={item.imageUrl} alt={item.subcategory.name} className="h-full w-full object-cover" />
            {index === thumbnails.length - 1 && remainingCount > 0 && (
              <span className="absolute inset-0 flex items-center justify-center bg-ink/50 text-sm font-semibold text-white">
                +{remainingCount}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="dw-micro">{outfit.items.length} pieces</span>
            {outfit.source === 'GENERATED' && <Badge variant="outline">Generated</Badge>}
          </div>
          <p className={cn('dw-hand text-lg text-primary', !outfit.name && 'text-muted-foreground')}>
            {outfit.name ?? 'Untitled look'}
          </p>
        </div>
        <Badge variant="accent">{outfit.compatibilityScore}%</Badge>
      </div>
    </button>
  );
}
