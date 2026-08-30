import type { DollItem } from '@/features/doll/types/doll.types';
import { cn } from '@/utils/cn';

export interface ColorSelectorProps {
  /** The color variant rows sharing one garment silhouette. */
  variants: DollItem[];
  selectedItemId: string;
  onSelect: (item: DollItem) => void;
  disabled?: boolean;
}

/** Curated color-dot picker for a garment's available color variants. */
export function ColorSelector({ variants, selectedItemId, onSelect, disabled }: ColorSelectorProps) {
  if (variants.length <= 1) return null;

  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Colors">
      {variants.map((variant) => (
        <button
          key={variant.id}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(variant)}
          aria-pressed={variant.id === selectedItemId}
          aria-label={variant.name}
          title={variant.name}
          style={{ backgroundColor: variant.color }}
          className={cn(
            'size-6 rounded-full border-2 transition-transform disabled:opacity-50',
            variant.id === selectedItemId ? 'scale-110 border-primary' : 'border-border hover:scale-105',
          )}
        />
      ))}
    </div>
  );
}
