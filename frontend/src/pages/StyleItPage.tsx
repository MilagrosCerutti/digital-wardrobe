import { useState } from 'react';
import { ClosetFilters, useCatalogQuery, useClosetItemsQuery } from '@/features/closet';
import type { ClosetFiltersValue, ClothingItem } from '@/features/closet';
import { CurrentLookPanel, StyleItemGrid, useCreateOutfitMutation, useOutfitPreviewQuery } from '@/features/styleIt';
import { Spinner } from '@/components/Spinner';
import { ErrorState } from '@/components/ErrorState';
import { useToast } from '@/components/Toast';
import { getApiErrorMessage } from '@/utils/apiError';

export function StyleItPage() {
  const [filters, setFilters] = useState<ClosetFiltersValue>({});
  const [selectedItems, setSelectedItems] = useState<ClothingItem[]>([]);
  const [name, setName] = useState('');
  const { toast } = useToast();

  const catalogQuery = useCatalogQuery();
  const itemsQuery = useClosetItemsQuery(filters);
  const selectedIds = new Set(selectedItems.map((item) => item.id));
  const previewQuery = useOutfitPreviewQuery(Array.from(selectedIds));
  const createOutfit = useCreateOutfitMutation();

  function handleToggle(item: ClothingItem) {
    setSelectedItems((current) =>
      current.some((selected) => selected.id === item.id)
        ? current.filter((selected) => selected.id !== item.id)
        : [...current, item],
    );
  }

  function handleRemove(id: string) {
    setSelectedItems((current) => current.filter((item) => item.id !== id));
  }

  function handleClear() {
    setSelectedItems([]);
    setName('');
  }

  async function handleSave() {
    try {
      await createOutfit.mutateAsync({
        name: name.trim() || undefined,
        clothingItemIds: selectedItems.map((item) => item.id),
      });
      toast({ title: 'Look saved', variant: 'success' });
      handleClear();
    } catch (error) {
      toast({ title: 'Could not save this look', description: getApiErrorMessage(error), variant: 'error' });
    }
  }

  return (
    <div className="dw-grain px-5 py-12 sm:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <span className="dw-micro text-primary">Style It</span>
        <h1 className="mt-1 text-3xl font-bold text-foreground">Style it your way.</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Mix pieces from your closet, preview the look, and save the outfit.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.7fr)]">
          <div className="flex flex-col gap-6">
            {catalogQuery.isLoading && (
              <div className="flex justify-center py-6">
                <Spinner label="Loading catalog" />
              </div>
            )}
            {catalogQuery.isError && (
              <ErrorState
                title="Couldn't load filters"
                description={getApiErrorMessage(catalogQuery.error)}
                onRetry={() => catalogQuery.refetch()}
              />
            )}
            {catalogQuery.data && (
              <ClosetFilters catalog={catalogQuery.data} filters={filters} onChange={setFilters} />
            )}

            {itemsQuery.isLoading && (
              <div className="flex justify-center py-12">
                <Spinner label="Loading your closet" />
              </div>
            )}
            {itemsQuery.isError && (
              <ErrorState
                title="Couldn't load your closet"
                description={getApiErrorMessage(itemsQuery.error)}
                onRetry={() => itemsQuery.refetch()}
              />
            )}
            {itemsQuery.data && (
              <StyleItemGrid items={itemsQuery.data} selectedIds={selectedIds} onToggle={handleToggle} />
            )}
          </div>

          <CurrentLookPanel
            selectedItems={selectedItems}
            onRemove={handleRemove}
            preview={previewQuery.data}
            isPreviewLoading={previewQuery.isLoading}
            name={name}
            onNameChange={setName}
            onSave={handleSave}
            isSaving={createOutfit.isPending}
            onClear={handleClear}
          />
        </div>
      </div>
    </div>
  );
}
