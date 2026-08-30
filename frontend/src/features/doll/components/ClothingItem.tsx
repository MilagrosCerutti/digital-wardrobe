import { createElement } from 'react';
import {
  resolveGarmentComponent,
  WARDROBE_ASSET_THUMBNAIL_VIEWBOX,
  type WardrobeAssetKey,
} from '@/features/doll/assets/wardrobe';
import {
  resolveRasterGarmentAsset,
  WARDROBE_RASTER_THUMBNAIL_VIEWBOX,
} from '@/features/doll/assets/wardrobeRaster';
import { DOLL_VIEWBOX } from '@/features/doll/assets/geometry';
import type { DollItem } from '@/features/doll/types/doll.types';
import { cn } from '@/utils/cn';

export interface ClothingItemProps {
  item: DollItem;
  isEquipped: boolean;
  onSelect: (item: DollItem) => void;
  disabled?: boolean;
}

/**
 * One garment thumbnail: a live preview of the actual illustrated piece, not
 * a generic icon. Resolution order mirrors DollLayer.tsx exactly -- a raster
 * asset (a real painted PNG) is preferred when one exists for the key, with
 * the vector renderer as fallback for keys that haven't been migrated to
 * raster yet.
 */
export function ClothingItem({ item, isEquipped, onSelect, disabled }: ClothingItemProps) {
  const rasterAsset = resolveRasterGarmentAsset(item.assetUrl);
  const Garment = rasterAsset ? undefined : resolveGarmentComponent(item.assetUrl);
  const thumbnailViewBox = rasterAsset
    ? (WARDROBE_RASTER_THUMBNAIL_VIEWBOX[item.assetUrl] ?? DOLL_VIEWBOX)
    : (WARDROBE_ASSET_THUMBNAIL_VIEWBOX[item.assetUrl as WardrobeAssetKey] ?? DOLL_VIEWBOX);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(item)}
      aria-pressed={isEquipped}
      className={cn(
        'dw-panel dw-lift flex flex-col items-center gap-1.5 bg-paper p-2.5 disabled:opacity-50',
        isEquipped && 'border-primary ring-1 ring-primary',
      )}
    >
      <svg viewBox={thumbnailViewBox} className="h-16 w-16" aria-hidden="true">
        {rasterAsset ? (
          <image href={rasterAsset} x={0} y={0} width={300} height={600} preserveAspectRatio="xMidYMid meet" />
        ) : (
          Garment && createElement(Garment, { color: item.color })
        )}
      </svg>
      <span className="text-center text-xs text-foreground">{item.name}</span>
    </button>
  );
}
