import type { ReactNode } from 'react';
import { EmptyState } from '@/components/EmptyState';
import { ClothingItemCard } from '@/features/closet/components/ClothingItemCard';
import type { ClothingItem } from '@/features/closet/types/closet.types';

export interface ClothingItemGridProps {
  items: ClothingItem[];
  hasActiveFilters: boolean;
  emptyAction?: ReactNode;
  onItemClick?: (item: ClothingItem) => void;
  onToggleFavorite?: (item: ClothingItem) => void;
}

export function ClothingItemGrid({
  items,
  hasActiveFilters,
  emptyAction,
  onItemClick,
  onToggleFavorite,
}: ClothingItemGridProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        title={hasActiveFilters ? 'No pieces match these filters' : 'Your closet is empty'}
        description={
          hasActiveFilters
            ? 'Try clearing a filter to see more of your wardrobe.'
            : 'Nothing here yet — every empty closet is an invitation.'
        }
        action={!hasActiveFilters ? emptyAction : undefined}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <ClothingItemCard
          key={item.id}
          item={item}
          onClick={() => onItemClick?.(item)}
          onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(item) : undefined}
        />
      ))}
    </div>
  );
}
