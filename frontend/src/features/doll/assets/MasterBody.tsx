import masterDollAsset from '@/features/doll/assets/doll/base/master-doll.png';

/**
 * The Master Doll: one illustrated raster figure (base body, face, and skin
 * all painted in) that every garment layer draws over. Its native 720x1456
 * pixels don't share the 300x600 doll viewBox's exact aspect ratio, so
 * `preserveAspectRatio="xMidYMid meet"` fits it to the viewBox by height and
 * centers it horizontally -- the image is scaled uniformly, never stretched.
 * See ASSET_SPEC.md §9 for the source asset's generation and viability specs.
 */
export function MasterBody() {
  return (
    <image
      href={masterDollAsset}
      x={0}
      y={0}
      width={300}
      height={600}
      preserveAspectRatio="xMidYMid meet"
    />
  );
}
