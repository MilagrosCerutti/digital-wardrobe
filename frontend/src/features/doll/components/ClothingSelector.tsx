import { useState } from 'react';
import { ClothingItem } from '@/features/doll/components/ClothingItem';
import { ColorSelector } from '@/features/doll/components/ColorSelector';
import { EmptyState } from '@/components/EmptyState';
import type { DollItem } from '@/features/doll/types/doll.types';

export interface ClothingSelectorProps {
  /** All active items in the currently selected category. */
  items: DollItem[];
  equippedItem: DollItem | undefined;
  onEquip: (item: DollItem) => void;
  onUnequip: (item: DollItem) => void;
  disabled?: boolean;
}

function groupBySilhouette(items: DollItem[]): DollItem[][] {
  const groups = new Map<string, DollItem[]>();
  for (const item of items) {
    const existing = groups.get(item.assetUrl);
    if (existing) existing.push(item);
    else groups.set(item.assetUrl, [item]);
  }
  return [...groups.values()];
}

/** Browses one category's garments, grouped by silhouette with color variants underneath. */
export function ClothingSelector({ items, equippedItem, onEquip, onUnequip, disabled }: ClothingSelectorProps) {
  const [focusedAssetKey, setFocusedAssetKey] = useState<string | null>(null);

  if (items.length === 0) {
    return <EmptyState title="Nothing here yet" description="More pieces are on the way." className="mt-4" />;
  }

  const groups = groupBySilhouette(items);
  // Prefer the explicitly focused group; otherwise default to whichever
  // garment is already equipped in this category, so returning to a category
  // tab shows that garment's color options without an extra click.
  const focusedGroup =
    groups.find((group) => group[0]?.assetUrl === focusedAssetKey) ??
    groups.find((group) => group.some((variant) => variant.id === equippedItem?.id));

  function handleSelect(item: DollItem) {
    setFocusedAssetKey(item.assetUrl);
    if (equippedItem?.id === item.id) {
      onUnequip(item);
    } else {
      onEquip(item);
    }
  }

  return (
    <div className="mt-4 flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {groups.map((group) => {
          const equippedVariant = group.find((variant) => variant.id === equippedItem?.id);
          const representative = equippedVariant ?? group[0]!;
          return (
            <ClothingItem
              key={representative.assetUrl}
              item={representative}
              isEquipped={Boolean(equippedVariant)}
              onSelect={handleSelect}
              disabled={disabled}
            />
          );
        })}
      </div>
      {focusedGroup && focusedGroup.length > 1 && (
        <ColorSelector
          variants={focusedGroup}
          selectedItemId={equippedItem?.id ?? focusedGroup[0]!.id}
          onSelect={onEquip}
          disabled={disabled}
        />
      )}
    </div>
  );
}
