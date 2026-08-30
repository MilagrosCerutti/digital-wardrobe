import { useState } from 'react';
import { Modal } from '@/components/Modal';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { useToast } from '@/components/Toast';
import { ClothingItemForm } from '@/features/closet/components/ClothingItemForm';
import {
  useArchiveClothingItemMutation,
  useDeleteClothingItemMutation,
  useFavoriteClothingItemMutation,
  useRestoreClothingItemMutation,
  useUnfavoriteClothingItemMutation,
  useUpdateClothingItemMutation,
  useUploadClothingImageMutation,
} from '@/features/closet/hooks/useCloset';
import { FIT_OPTIONS, FORMALITY_OPTIONS } from '@/features/closet/constants';
import type { Catalog, ClothingItem, CreateClothingItemPayload } from '@/features/closet/types/closet.types';
import { getApiErrorMessage } from '@/utils/apiError';
import { cn } from '@/utils/cn';

export interface ClothingItemDetailModalProps {
  catalog: Catalog;
  item: ClothingItem | null;
  onClose: () => void;
}

function labelFor(options: { value: string; label: string }[], value: string) {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function ClothingItemDetailModal({ catalog, item, onClose }: ClothingItemDetailModalProps) {
  return (
    <Modal
      isOpen={Boolean(item)}
      onClose={onClose}
      title={item ? item.subcategory.name : ''}
    >
      {item && (
        // Remounts (and resets to view mode) whenever a different item is selected.
        <DetailModalBody key={item.id} catalog={catalog} item={item} onClose={onClose} />
      )}
    </Modal>
  );
}

interface DetailModalBodyProps {
  catalog: Catalog;
  item: ClothingItem;
  onClose: () => void;
}

function DetailModalBody({ catalog, item, onClose }: DetailModalBodyProps) {
  const [mode, setMode] = useState<'view' | 'edit' | 'confirmDelete'>('view');
  const [isFavorite, setIsFavorite] = useState(item.isFavorite);
  const uploadImage = useUploadClothingImageMutation();
  const updateItem = useUpdateClothingItemMutation();
  const archiveItem = useArchiveClothingItemMutation();
  const restoreItem = useRestoreClothingItemMutation();
  const deleteItem = useDeleteClothingItemMutation();
  const favoriteItem = useFavoriteClothingItemMutation();
  const unfavoriteItem = useUnfavoriteClothingItemMutation();
  const { toast } = useToast();

  const isSubmitting = uploadImage.isPending || updateItem.isPending;

  async function handleSave(values: CreateClothingItemPayload, imageFile: File | null) {
    try {
      const imageUrl = imageFile ? await uploadImage.mutateAsync(imageFile) : undefined;
      await updateItem.mutateAsync({ id: item.id, payload: { ...values, ...(imageUrl && { imageUrl }) } });
      toast({ title: 'Changes saved', variant: 'success' });
      setMode('view');
    } catch (error) {
      toast({ title: 'Could not save changes', description: getApiErrorMessage(error), variant: 'error' });
    }
  }

  async function handleFavoriteToggle() {
    try {
      if (isFavorite) {
        await unfavoriteItem.mutateAsync(item.id);
        setIsFavorite(false);
      } else {
        await favoriteItem.mutateAsync(item.id);
        setIsFavorite(true);
      }
    } catch (error) {
      toast({ title: 'Could not update favorites', description: getApiErrorMessage(error), variant: 'error' });
    }
  }

  async function handleArchiveToggle() {
    try {
      if (item.isArchived) {
        await restoreItem.mutateAsync(item.id);
        toast({ title: 'Restored to your closet', variant: 'success' });
      } else {
        await archiveItem.mutateAsync(item.id);
        toast({ title: 'Archived', variant: 'success' });
      }
      onClose();
    } catch (error) {
      toast({ title: 'Could not update this item', description: getApiErrorMessage(error), variant: 'error' });
    }
  }

  async function confirmDelete() {
    try {
      await deleteItem.mutateAsync(item.id);
      toast({ title: 'Item deleted', variant: 'success' });
      onClose();
    } catch (error) {
      toast({ title: 'Could not delete this item', description: getApiErrorMessage(error), variant: 'error' });
      setMode('view');
    }
  }

  if (mode === 'confirmDelete') {
    return (
      <div className="dw-panel-pink relative flex flex-col items-center gap-3 p-6 text-center">
        <span className="dw-tape absolute -top-3 left-1/2 -translate-x-1/2 -rotate-2" aria-hidden="true" />
        <p className="dw-hand text-2xl text-foreground">Do you want to delete this item?</p>
        <p className="text-sm text-muted-foreground">This action cannot be reversed.</p>
        <div className="mt-2 flex items-center justify-center gap-3">
          <Button type="button" variant="outline" onClick={() => setMode('view')} disabled={deleteItem.isPending}>
            No
          </Button>
          <Button type="button" variant="destructive" onClick={confirmDelete} disabled={deleteItem.isPending}>
            {deleteItem.isPending ? 'Deleting…' : 'Yes'}
          </Button>
        </div>
      </div>
    );
  }

  if (mode === 'edit') {
    return (
      <ClothingItemForm
        catalog={catalog}
        initialValues={{
          categoryId: item.category.id,
          subcategoryId: item.subcategory.id,
          materialId: item.material.id,
          patternId: item.pattern.id,
          colorIds: item.colors.map((color) => color.id),
          styleIds: item.styles.map((style) => style.id),
          fit: item.fit ?? '',
          formalityLevel: item.formalityLevel,
        }}
        existingImageUrl={item.imageUrl}
        requireImage={false}
        submitLabel="Save Changes"
        isSubmitting={isSubmitting}
        onSubmit={handleSave}
        onCancel={() => setMode('view')}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="dw-panel relative aspect-square overflow-hidden bg-cream">
        <img src={item.imageUrl} alt={item.subcategory.name} className="h-full w-full object-cover" />
        <button
          type="button"
          onClick={handleFavoriteToggle}
          disabled={favoriteItem.isPending || unfavoriteItem.isPending}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          aria-pressed={isFavorite}
          className={cn(
            'absolute right-2 top-2 flex size-9 items-center justify-center rounded-full bg-paper/90 text-xl shadow-sm transition-transform hover:scale-110',
            isFavorite ? 'text-primary' : 'text-muted-foreground',
          )}
        >
          <span aria-hidden="true">{isFavorite ? '♥' : '♡'}</span>
        </button>
      </div>

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="dw-micro">Category</dt>
          <dd className="text-foreground">{item.category.name}</dd>
        </div>
        <div>
          <dt className="dw-micro">Material</dt>
          <dd className="text-foreground">{item.material.name}</dd>
        </div>
        <div>
          <dt className="dw-micro">Pattern</dt>
          <dd className="text-foreground">{item.pattern.name}</dd>
        </div>
        <div>
          <dt className="dw-micro">Fit</dt>
          <dd className="text-foreground">{item.fit ? labelFor(FIT_OPTIONS, item.fit) : '—'}</dd>
        </div>
        <div>
          <dt className="dw-micro">Formality</dt>
          <dd className="text-foreground">{labelFor(FORMALITY_OPTIONS, item.formalityLevel)}</dd>
        </div>
        <div>
          <dt className="dw-micro">Status</dt>
          <dd className="text-foreground">{item.isArchived ? 'Archived' : 'Active'}</dd>
        </div>
      </dl>

      <div>
        <span className="dw-micro">Colors</span>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {item.colors.map((color) => (
            <Badge key={color.id} variant="outline">
              {color.name}
            </Badge>
          ))}
        </div>
      </div>
      <div>
        <span className="dw-micro">Styles</span>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {item.styles.map((style) => (
            <Badge key={style.id} variant="outline">
              {style.name}
            </Badge>
          ))}
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onClose}>
          Close
        </Button>
        <Button type="button" variant="destructive" onClick={() => setMode('confirmDelete')}>
          Delete
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleArchiveToggle}
          disabled={archiveItem.isPending || restoreItem.isPending}
        >
          {item.isArchived ? 'Restore' : 'Archive'}
        </Button>
        <Button type="button" onClick={() => setMode('edit')}>
          Edit
        </Button>
      </div>
    </div>
  );
}
