import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Spinner } from '@/components/Spinner';
import { CompatibilityScoreBars } from '@/components/CompatibilityScoreBars';
import type { ClothingItem, CompatibilityResult } from '@/features/styleIt/types/styleIt.types';

export interface CurrentLookPanelProps {
  selectedItems: ClothingItem[];
  onRemove: (id: string) => void;
  preview?: CompatibilityResult;
  isPreviewLoading: boolean;
  name: string;
  onNameChange: (name: string) => void;
  onSave: () => void;
  isSaving: boolean;
  onClear: () => void;
}

export function CurrentLookPanel({
  selectedItems,
  onRemove,
  preview,
  isPreviewLoading,
  name,
  onNameChange,
  onSave,
  isSaving,
  onClear,
}: CurrentLookPanelProps) {
  const canSave = selectedItems.length >= 2 && !isSaving;

  return (
    <div className="dw-panel sticky top-24 flex flex-col gap-5 bg-paper p-5">
      <div className="flex items-center justify-between">
        <span className="dw-micro">Current look</span>
        {selectedItems.length > 0 && (
          <button type="button" onClick={onClear} className="dw-micro text-primary hover:underline">
            Clear
          </button>
        )}
      </div>

      {selectedItems.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Tap pieces from your closet to start building a look.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {selectedItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onRemove(item.id)}
              title="Remove from look"
              className="dw-panel group relative aspect-square overflow-hidden bg-cream"
            >
              <img
                src={item.imageUrl}
                alt={item.subcategory.name}
                className="h-full w-full object-cover"
              />
              <span className="absolute inset-0 hidden items-center justify-center bg-ink/50 text-xs font-semibold text-white group-hover:flex">
                Remove
              </span>
            </button>
          ))}
        </div>
      )}

      {selectedItems.length === 1 && (
        <p className="text-sm text-muted-foreground">Add one more piece to see your compatibility score.</p>
      )}

      {selectedItems.length >= 2 && (
        <div className="dw-panel bg-cream p-3">
          {isPreviewLoading && (
            <div className="flex justify-center py-2">
              <Spinner label="Calculating compatibility" />
            </div>
          )}
          {preview && !isPreviewLoading && (
            <CompatibilityScoreBars score={preview.score} breakdown={preview.breakdown} />
          )}
        </div>
      )}

      <Input
        label="Name (optional)"
        placeholder="e.g. Date night"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
      />

      <Button type="button" onClick={onSave} disabled={!canSave} className="w-full">
        {isSaving ? 'Saving…' : 'Save Look'}
      </Button>
    </div>
  );
}
