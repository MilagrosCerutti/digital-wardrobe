import { Badge } from '@/components/Badge';
import { cn } from '@/utils/cn';
import type { ClothingItem } from '@/features/closet/types/closet.types';

export interface ClothingItemCardProps {
  item: ClothingItem;
  onClick?: () => void;
  onToggleFavorite?: () => void;
}

export function ClothingItemCard({ item, onClick, onToggleFavorite }: ClothingItemCardProps) {
  return (
    <div className="dw-panel dw-lift relative overflow-hidden bg-paper text-left">
      <button type="button" onClick={onClick} className="block w-full text-left">
        <div className="aspect-square bg-cream">
          <img
            src={item.imageUrl}
            alt={`${item.subcategory.name} in ${item.category.name}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="flex flex-col gap-2 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-foreground">{item.subcategory.name}</span>
            {item.isArchived && <Badge variant="outline">Archived</Badge>}
          </div>
          <span className="dw-micro">{item.category.name}</span>
          {item.colors.length > 0 && (
            <div className="flex gap-1.5" aria-label="Colors">
              {item.colors.map((color) => (
                <span
                  key={color.id}
                  title={color.name}
                  className="size-3.5 rounded-full border border-border"
                  style={{ backgroundColor: color.hex }}
                />
              ))}
            </div>
          )}
        </div>
      </button>
      {onToggleFavorite && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleFavorite();
          }}
          aria-label={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          aria-pressed={item.isFavorite}
          className={cn(
            'absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-paper/90 text-lg shadow-sm transition-transform hover:scale-110',
            item.isFavorite ? 'text-primary' : 'text-muted-foreground',
          )}
        >
          <span aria-hidden="true">{item.isFavorite ? '♥' : '♡'}</span>
        </button>
      )}
    </div>
  );
}
