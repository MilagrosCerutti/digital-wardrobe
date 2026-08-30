import { createElement } from 'react';
import { resolveGarmentComponent } from '@/features/doll/assets/wardrobe';
import { resolveRasterGarmentAsset } from '@/features/doll/assets/wardrobeRaster';
import type { DollItem } from '@/features/doll/types/doll.types';

export interface DollLayerProps {
  item: DollItem | undefined;
}

/**
 * Renders one equipped garment layer by resolving its asset key to an
 * illustrated asset. A raster PNG (assets/wardrobeRaster.ts) is preferred
 * when one exists for the key -- painted garments composited over the
 * raster Master Doll, sharing its 300x600 viewBox fit exactly (same x/y/
 * width/height/preserveAspectRatio) so no per-item offset is needed. Keys
 * without a raster asset yet fall back to the vector renderer
 * (assets/wardrobe.ts). Fails safely (renders nothing) if an item
 * references an unknown asset key instead of breaking the whole doll.
 *
 * Uses createElement rather than JSX for the vector branch: the garment
 * component reference comes from a stable, module-level lookup table (never
 * freshly constructed), but that isn't visible to static analysis when
 * written as a JSX tag.
 */
export function DollLayer({ item }: DollLayerProps) {
  if (!item) return null;

  const rasterAsset = resolveRasterGarmentAsset(item.assetUrl);
  if (rasterAsset) {
    return (
      <image
        href={rasterAsset}
        x={0}
        y={0}
        width={300}
        height={600}
        preserveAspectRatio="xMidYMid meet"
      />
    );
  }

  const Garment = resolveGarmentComponent(item.assetUrl);
  if (!Garment) return null;

  return createElement(Garment, { color: item.color });
}
