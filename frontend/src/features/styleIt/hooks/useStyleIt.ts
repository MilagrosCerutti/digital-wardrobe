import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createOutfit, previewOutfit } from '@/features/styleIt/services/styleItService';

export function useOutfitPreviewQuery(clothingItemIds: string[]) {
  const sortedIds = [...clothingItemIds].sort();

  return useQuery({
    queryKey: ['outfits', 'preview', sortedIds],
    queryFn: () => previewOutfit(sortedIds),
    enabled: sortedIds.length >= 2,
  });
}

export function useCreateOutfitMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createOutfit,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['outfits'] }),
  });
}
