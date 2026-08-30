import type { ComponentType } from 'react';
import { TopTank, type GarmentProps } from '@/features/doll/assets/garments/TopTank';
import { TopBabyTee } from '@/features/doll/assets/garments/TopBabyTee';
import { TopCardigan } from '@/features/doll/assets/garments/TopCardigan';
import { TopBlouse } from '@/features/doll/assets/garments/TopBlouse';
import { BottomJeans } from '@/features/doll/assets/garments/BottomJeans';
import { BottomSkirt } from '@/features/doll/assets/garments/BottomSkirt';
import { BottomWideLeg } from '@/features/doll/assets/garments/BottomWideLeg';
import { DressSlip } from '@/features/doll/assets/garments/DressSlip';
import { DressMini } from '@/features/doll/assets/garments/DressMini';
import { ShoeSneakers } from '@/features/doll/assets/garments/ShoeSneakers';
import { ShoeFlats } from '@/features/doll/assets/garments/ShoeFlats';
import { ShoeBoots } from '@/features/doll/assets/garments/ShoeBoots';
import { AccessorySunglasses } from '@/features/doll/assets/garments/AccessorySunglasses';
import { AccessoryBag } from '@/features/doll/assets/garments/AccessoryBag';
import { AccessoryBow } from '@/features/doll/assets/garments/AccessoryBow';
import { AccessoryNecklace } from '@/features/doll/assets/garments/AccessoryNecklace';
import type { DollItemCategory } from '@/features/doll/types/doll.types';

/**
 * Maps a DollItem's `assetUrl` (an internal asset key, not a real URL -- see
 * doll.types.ts) to the illustrated garment component that renders it, and to
 * which anatomical layer category it belongs. Every component here is drawn
 * against the shared coordinate system in geometry.ts, which is what makes a
 * garment align with the MasterBody without per-render positioning.
 */
export const WARDROBE_ASSET_COMPONENTS: Record<string, ComponentType<GarmentProps>> = {
  'top-tank': TopTank,
  'top-baby-tee': TopBabyTee,
  'top-cardigan': TopCardigan,
  'top-blouse': TopBlouse,
  'bottom-jeans': BottomJeans,
  'bottom-skirt': BottomSkirt,
  'bottom-wide-leg': BottomWideLeg,
  'dress-slip': DressSlip,
  'dress-mini': DressMini,
  'shoes-sneakers': ShoeSneakers,
  'shoes-flats': ShoeFlats,
  'shoes-boots': ShoeBoots,
  'accessory-sunglasses': AccessorySunglasses,
  'accessory-bag': AccessoryBag,
  'accessory-bow': AccessoryBow,
  'accessory-necklace': AccessoryNecklace,
};

export type WardrobeAssetKey = keyof typeof WARDROBE_ASSET_COMPONENTS;

export const WARDROBE_ASSET_CATEGORY: Record<WardrobeAssetKey, DollItemCategory> = {
  'top-tank': 'TOP',
  'top-baby-tee': 'TOP',
  'top-cardigan': 'TOP',
  'top-blouse': 'TOP',
  'bottom-jeans': 'BOTTOM',
  'bottom-skirt': 'BOTTOM',
  'bottom-wide-leg': 'BOTTOM',
  'dress-slip': 'DRESS',
  'dress-mini': 'DRESS',
  'shoes-sneakers': 'SHOES',
  'shoes-flats': 'SHOES',
  'shoes-boots': 'SHOES',
  'accessory-sunglasses': 'ACCESSORY',
  'accessory-bag': 'ACCESSORY',
  'accessory-bow': 'ACCESSORY',
  'accessory-necklace': 'ACCESSORY',
};

export function resolveGarmentComponent(assetKey: string): ComponentType<GarmentProps> | undefined {
  return WARDROBE_ASSET_COMPONENTS[assetKey];
}

/**
 * A garment only occupies a small region of the full 0-600-tall doll canvas.
 * Rendering a thumbnail at that full scale leaves face-level pieces (like
 * sunglasses) nearly invisible, so each asset key defines the region of the
 * shared coordinate system its thumbnail should crop to.
 */
export const WARDROBE_ASSET_THUMBNAIL_VIEWBOX: Record<WardrobeAssetKey, string> = {
  'top-tank': '70 120 160 180',
  'top-baby-tee': '70 120 160 130',
  'top-cardigan': '60 120 180 170',
  'top-blouse': '70 120 160 180',
  'bottom-jeans': '85 220 130 200',
  'bottom-skirt': '65 220 170 150',
  'bottom-wide-leg': '75 220 150 200',
  'dress-slip': '80 120 140 300',
  'dress-mini': '80 120 140 270',
  'shoes-sneakers': '85 540 130 45',
  'shoes-flats': '85 540 130 40',
  'shoes-boots': '85 485 130 100',
  'accessory-sunglasses': '95 55 110 45',
  'accessory-bag': '100 290 100 135',
  'accessory-bow': '90 20 120 50',
  'accessory-necklace': '115 128 70 40',
};
