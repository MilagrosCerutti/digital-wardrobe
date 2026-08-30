import topTankCream from '@/features/doll/assets/doll/garments/top-tank-cream.png';
import topTankBlue from '@/features/doll/assets/doll/garments/top-tank-blue.png';
import topTankBlack from '@/features/doll/assets/doll/garments/top-tank-black.png';
import bottomSkirtDenim from '@/features/doll/assets/doll/garments/bottom-skirt-denim.png';

/**
 * Illustrated raster garments -- painted PNGs on the same shared canvas as
 * the Master Doll (assets/MasterBody.tsx), per ASSET_SPEC.md §9. Every other
 * asset key in wardrobe.ts still renders through the vector
 * `WARDROBE_ASSET_COMPONENTS` path. `resolveGarmentAsset` (DollLayer.tsx)
 * checks this table first and falls back to the vector renderer, so adding
 * a raster file here is what "migrates" a key -- no other wiring changes.
 *
 * Raster garments are pre-rendered per color (unlike the vector garments,
 * which take a `color` prop) -- Cream/Blue/Black Tank are each their own
 * asset key rather than one `top-tank` key with a color variant, because
 * there is no single recolorable source to render color from at runtime.
 */
export const WARDROBE_RASTER_ASSETS: Record<string, string> = {
  'top-tank': topTankCream,
  'top-tank-blue': topTankBlue,
  'top-tank-black': topTankBlack,
  'bottom-skirt': bottomSkirtDenim,
};

export function resolveRasterGarmentAsset(assetKey: string): string | undefined {
  return WARDROBE_RASTER_ASSETS[assetKey];
}

/**
 * Thumbnail crop for each raster key, in the same 0-600-tall doll coordinate
 * space as WARDROBE_ASSET_THUMBNAIL_VIEWBOX (assets/wardrobe.ts) -- a raster
 * garment is composited with the exact same x/y/width/height transform as
 * the vector ones, so a region measured in that shared space crops either
 * kind identically. Blue/Black Tank reuse the Cream Tank crop (confirmed
 * pixel-identical placement across all three); the skirt crop is measured
 * against the current bottom-skirt-denim.png artwork.
 */
export const WARDROBE_RASTER_THUMBNAIL_VIEWBOX: Record<string, string> = {
  'top-tank': '70 120 160 180',
  'top-tank-blue': '70 120 160 180',
  'top-tank-black': '70 120 160 180',
  'bottom-skirt': '65 220 170 150',
};

/**
 * Asset keys that have actually passed visual integration testing against
 * the Master Doll and are approved to appear in the My Doll wardrobe UI.
 *
 * Every other legacy/experimental file sitting in assets/doll/garments/
 * (lightblue-jeans.png, and anything else not listed in
 * WARDROBE_RASTER_ASSETS above) is excluded the same way: it may exist on
 * disk, but it's not wired into this key list, so it can never reach the
 * wardrobe UI or the doll canvas. lightblue-jeans.png specifically failed
 * its alignment check (content generated at a larger internal scale than
 * this asset set -- see git history on this file for the measurements) and
 * was replaced by a corrected `bottom-skirt` asset instead of being fixed
 * with an offset.
 */
export const APPROVED_DOLL_ITEM_ASSET_KEYS: readonly string[] = [
  'top-tank',
  'top-tank-blue',
  'top-tank-black',
  'bottom-skirt',
];

export function isApprovedDollItemAsset(assetKey: string): boolean {
  return APPROVED_DOLL_ITEM_ASSET_KEYS.includes(assetKey);
}
