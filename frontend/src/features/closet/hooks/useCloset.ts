import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  archiveClothingItem,
  createClothingItem,
  deleteClothingItem,
  favoriteClothingItem,
  fetchCatalog,
  fetchClothingItems,
  restoreClothingItem,
  unfavoriteClothingItem,
  updateClothingItem,
  uploadClothingItemImage,
} from '@/features/closet/services/closetService';
import type { ClosetFilters } from '@/features/closet/types/closet.types';

const CLOSET_ITEMS_QUERY_KEY = ['closet', 'items'] as const;

export function useCatalogQuery() {
  return useQuery({ queryKey: ['catalog'], queryFn: fetchCatalog, staleTime: Infinity });
}

export function useClosetItemsQuery(filters: ClosetFilters) {
  return useQuery({
    queryKey: [...CLOSET_ITEMS_QUERY_KEY, filters],
    queryFn: () => fetchClothingItems(filters),
  });
}

export function useUploadClothingImageMutation() {
  return useMutation({ mutationFn: uploadClothingItemImage });
}

function useInvalidateClosetOnSuccess() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: CLOSET_ITEMS_QUERY_KEY });
}

export function useCreateClothingItemMutation() {
  const invalidate = useInvalidateClosetOnSuccess();
  return useMutation({ mutationFn: createClothingItem, onSuccess: invalidate });
}

export function useUpdateClothingItemMutation() {
  const invalidate = useInvalidateClosetOnSuccess();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateClothingItem>[1] }) =>
      updateClothingItem(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteClothingItemMutation() {
  const invalidate = useInvalidateClosetOnSuccess();
  return useMutation({ mutationFn: deleteClothingItem, onSuccess: invalidate });
}

export function useArchiveClothingItemMutation() {
  const invalidate = useInvalidateClosetOnSuccess();
  return useMutation({ mutationFn: archiveClothingItem, onSuccess: invalidate });
}

export function useRestoreClothingItemMutation() {
  const invalidate = useInvalidateClosetOnSuccess();
  return useMutation({ mutationFn: restoreClothingItem, onSuccess: invalidate });
}

export function useFavoriteClothingItemMutation() {
  const invalidate = useInvalidateClosetOnSuccess();
  return useMutation({ mutationFn: favoriteClothingItem, onSuccess: invalidate });
}

export function useUnfavoriteClothingItemMutation() {
  const invalidate = useInvalidateClosetOnSuccess();
  return useMutation({ mutationFn: unfavoriteClothingItem, onSuccess: invalidate });
}
