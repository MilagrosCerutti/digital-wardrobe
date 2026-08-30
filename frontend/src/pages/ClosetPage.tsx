import { useState } from 'react';
import {
  AddClothingItemModal,
  ClosetFilters,
  ClothingItemDetailModal,
  ClothingItemGrid,
  useCatalogQuery,
  useClosetItemsQuery,
  useFavoriteClothingItemMutation,
  useUnfavoriteClothingItemMutation,
} from '@/features/closet';
import type { ClosetFiltersValue, ClothingItem } from '@/features/closet';
import { Spinner } from '@/components/Spinner';
import { ErrorState } from '@/components/ErrorState';
import { Button } from '@/components/Button';
import { useToast } from '@/components/Toast';
import { getApiErrorMessage } from '@/utils/apiError';

export function ClosetPage() {
  const [filters, setFilters] = useState<ClosetFiltersValue>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  const catalogQuery = useCatalogQuery();
  const itemsQuery = useClosetItemsQuery(filters);
  const favoriteItem = useFavoriteClothingItemMutation();
  const unfavoriteItem = useUnfavoriteClothingItemMutation();
  const { toast } = useToast();

  async function handleToggleFavorite(item: ClothingItem) {
    try {
      if (item.isFavorite) {
        await unfavoriteItem.mutateAsync(item.id);
      } else {
        await favoriteItem.mutateAsync(item.id);
      }
    } catch (error) {
      toast({ title: 'Could not update favorites', description: getApiErrorMessage(error), variant: 'error' });
    }
  }

  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) => key !== 'includeArchived' && Boolean(value),
  );

  return (
    <div className="dw-grain px-5 py-12 sm:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="dw-micro text-primary">My Closet</span>
            <h1 className="mt-1 text-3xl font-bold text-foreground">
              Your closet, arranged like a fashion story.
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Every piece you own, organized and ready to style.
            </p>
          </div>
          {catalogQuery.data && (
            <Button type="button" onClick={() => setIsAddModalOpen(true)}>
              Add Item
            </Button>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-6">
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
          {itemsQuery.data && catalogQuery.data && (
            <ClothingItemGrid
              items={itemsQuery.data}
              hasActiveFilters={hasActiveFilters}
              onItemClick={setSelectedItem}
              onToggleFavorite={handleToggleFavorite}
              emptyAction={
                <Button type="button" onClick={() => setIsAddModalOpen(true)}>
                  Add your first item
                </Button>
              }
            />
          )}
        </div>
      </div>

      {catalogQuery.data && (
        <>
          <AddClothingItemModal
            catalog={catalogQuery.data}
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
          />
          <ClothingItemDetailModal
            catalog={catalogQuery.data}
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
          />
        </>
      )}
    </div>
  );
}
