import { DollBodyBase } from '@/features/doll/components/DollBodyBase';
import { DollLayer } from '@/features/doll/components/DollLayer';
import { DOLL_VIEWBOX } from '@/features/doll/assets/geometry';
import type { Doll, DollItem } from '@/features/doll/types/doll.types';
import { cn } from '@/utils/cn';

export interface DollCanvasProps {
  doll: Doll;
  equippedItems: DollItem[];
  className?: string;
}

/**
 * Renders the doll as one composed SVG. Every layer (the raster Master Doll
 * body and each equipped garment) is drawn against the same coordinate
 * system (geometry.ts), so layer order below is a deterministic z-index
 * list, not a set of per-item pixel offsets.
 *
 * `doll` is still threaded through for appearance state (skinTone, bodyType,
 * hairStyle, hairColor, eyeColor) even though the Master Doll raster doesn't
 * yet render any of it -- see ASSET_SPEC.md §9.7. The old vector hair layer
 * that used to render here has been removed: it was authored as an opaque
 * silhouette to sit on the old geometric body, and painting it over the
 * Master Doll's own illustrated hair produced a visible double-hair
 * conflict, not a recolor.
 */
export function DollCanvas({ doll: _doll, equippedItems, className }: DollCanvasProps) {
  const dress = equippedItems.find((item) => item.category === 'DRESS');
  const top = dress ? undefined : equippedItems.find((item) => item.category === 'TOP');
  const bottom = dress ? undefined : equippedItems.find((item) => item.category === 'BOTTOM');
  const shoes = equippedItems.find((item) => item.category === 'SHOES');
  const accessory = equippedItems.find((item) => item.category === 'ACCESSORY');

  return (
    <div
      className={cn(
        'dw-panel dw-dotgrid relative mx-auto aspect-[1/2] w-full max-w-xs bg-cream p-4',
        className,
      )}
    >
      <svg viewBox={DOLL_VIEWBOX} role="img" aria-label="Your doll" className="h-full w-full">
        <DollBodyBase />
        <DollLayer item={bottom} />
        <DollLayer item={top} />
        <DollLayer item={dress} />
        <DollLayer item={shoes} />
        <DollLayer item={accessory} />
      </svg>
    </div>
  );
}
