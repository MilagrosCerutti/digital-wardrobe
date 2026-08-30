import { EmptyState } from '@/components/EmptyState';
import { cn } from '@/utils/cn';
import type { ClothingItem } from '@/features/styleIt/types/styleIt.types';

export interface StyleItemGridProps {
  items: ClothingItem[];
  selectedIds: Set<string>;
  onToggle: (item: ClothingItem) => void;
}

export function StyleItemGrid({ items, selectedIds, onToggle }: StyleItemGridProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="No pieces match these filters"
        description="Try clearing a filter, or add pieces to your closet first."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => {
        const isSelected = selectedIds.has(item.id);
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onToggle(item)}
            aria-pressed={isSelected}
            className={cn(
              'dw-panel dw-lift overflow-hidden bg-paper text-left',
              isSelected && 'border-primary ring-1 ring-primary',
            )}
          >
            <div className="relative aspect-square bg-cream">
              <img
                src={item.imageUrl}
                alt={`${item.subcategory.name} in ${item.category.name}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              {isSelected && (
                <span className="dw-micro absolute top-2 right-2 rounded-full bg-primary px-2 py-0.5 text-primary-foreground">
                  On
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1 p-3">
              <span className="text-sm font-medium text-foreground">{item.subcategory.name}</span>
              <span className="dw-micro">{item.category.name}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
