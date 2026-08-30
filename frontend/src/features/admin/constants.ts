import type { CatalogType, DollItemCategory } from '@/features/admin/types/admin.types';
import { CLOTHING_COLOR_OPTIONS } from '@/features/doll/constants';
import { WARDROBE_ASSET_CATEGORY } from '@/features/doll/assets/wardrobe';

export const CATALOG_TYPE_OPTIONS: { value: CatalogType; label: string }[] = [
  { value: 'categories', label: 'Categories' },
  { value: 'subcategories', label: 'Subcategories' },
  { value: 'materials', label: 'Materials' },
  { value: 'patterns', label: 'Patterns' },
  { value: 'colors', label: 'Colors' },
  { value: 'styles', label: 'Styles' },
  { value: 'occasions', label: 'Occasions' },
];

export const DOLL_ITEM_CATEGORY_OPTIONS: { value: DollItemCategory; label: string }[] = [
  { value: 'TOP', label: 'Top' },
  { value: 'BOTTOM', label: 'Bottom' },
  { value: 'DRESS', label: 'Dress' },
  { value: 'SHOES', label: 'Shoes' },
  { value: 'ACCESSORY', label: 'Accessory' },
];

/** Every illustrated garment silhouette available for doll items, grouped implicitly by category. */
export const DOLL_ITEM_ASSET_KEY_OPTIONS: { value: string; label: string; category: DollItemCategory }[] =
  Object.entries(WARDROBE_ASSET_CATEGORY).map(([assetKey, category]) => ({
    value: assetKey,
    label: assetKey,
    category,
  }));

export const DOLL_ITEM_COLOR_OPTIONS: { value: string; label: string }[] = CLOTHING_COLOR_OPTIONS.map(
  (option) => ({ value: option.hex, label: option.label }),
);
