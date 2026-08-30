import { TabsList, TabsTrigger } from '@/components/Tabs';
import type { DollItemCategory } from '@/features/doll/types/doll.types';

const CATEGORY_LABELS: Record<DollItemCategory, string> = {
  TOP: 'Tops',
  BOTTOM: 'Bottoms',
  DRESS: 'Dresses',
  SHOES: 'Shoes',
  ACCESSORY: 'Accessories',
};

const DOLL_ITEM_CATEGORIES: DollItemCategory[] = ['TOP', 'BOTTOM', 'DRESS', 'SHOES', 'ACCESSORY'];

/** Category tab bar for browsing the wardrobe (wraps the shared Tabs primitives). */
export function ClothingCategorySelector() {
  return (
    <TabsList>
      {DOLL_ITEM_CATEGORIES.map((category) => (
        <TabsTrigger key={category} value={category}>
          {CATEGORY_LABELS[category]}
        </TabsTrigger>
      ))}
    </TabsList>
  );
}
