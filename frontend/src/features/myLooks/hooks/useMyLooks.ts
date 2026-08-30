import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteOutfit, fetchOutfits } from '@/features/myLooks/services/myLooksService';

const OUTFITS_QUERY_KEY = ['outfits'] as const;

export function useOutfitsQuery() {
  return useQuery({ queryKey: OUTFITS_QUERY_KEY, queryFn: fetchOutfits });
}

export function useDeleteOutfitMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteOutfit,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: OUTFITS_QUERY_KEY }),
  });
}
