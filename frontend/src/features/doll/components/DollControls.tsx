import { Button } from '@/components/Button';
import { ClothingSelector } from '@/features/doll/components/ClothingSelector';
import type { DollItem, DollItemCategory } from '@/features/doll/types/doll.types';

export interface DollControlsProps {
  items: DollItem[];
  equippedItems: DollItem[];
  onEquip: (item: DollItem) => void;
  onUnequip: (item: DollItem) => void;
  disabled?: boolean;
}

const CATEGORY_LABELS: Record<DollItemCategory, string> = {
  TOP: 'Tops',
  BOTTOM: 'Bottoms',
  DRESS: 'Dresses',
  SHOES: 'Shoes',
  ACCESSORY: 'Accessories',
};

const CATEGORY_ORDER: DollItemCategory[] = ['TOP', 'BOTTOM', 'DRESS', 'SHOES', 'ACCESSORY'];

/**
 * The wardrobe browsing surface for My Doll: one labeled section per
 * category that actually has approved items, each with its own garment
 * grid and remove action. A tab switcher isn't worth the extra click while
 * the wardrobe only has a couple of items per category -- sections just
 * stack, and naturally reappear as more categories get approved items.
 */
export function DollControls({ items, equippedItems, onEquip, onUnequip, disabled }: DollControlsProps) {
  const categoriesWithItems = CATEGORY_ORDER.filter((category) =>
    items.some((item) => item.category === category),
  );

  return (
    <div className="flex flex-col gap-6">
      {categoriesWithItems.map((category) => {
        const categoryItems = items.filter((item) => item.category === category);
        const equippedInCategory = equippedItems.find((item) => item.category === category);

        return (
          <div key={category}>
            <div className="flex items-center justify-between gap-3">
              <span className="dw-micro">{CATEGORY_LABELS[category]}</span>
              {equippedInCategory && (
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0 text-xs"
                  disabled={disabled}
                  onClick={() => onUnequip(equippedInCategory)}
                >
                  Remove
                </Button>
              )}
            </div>
            <ClothingSelector
              items={categoryItems}
              equippedItem={equippedInCategory}
              onEquip={onEquip}
              onUnequip={onUnequip}
              disabled={disabled}
            />
          </div>
        );
      })}
    </div>
  );
}
