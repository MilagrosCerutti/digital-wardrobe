import { useMutation } from '@tanstack/react-query';
import { generateRecommendations } from '@/features/inspireMe/services/inspireMeService';

export function useGenerateRecommendationsMutation() {
  return useMutation({ mutationFn: generateRecommendations });
}

// Saving a recommendation is just creating an outfit (source: 'GENERATED'),
// so it reuses Style It's mutation - including its ['outfits'] cache
// invalidation - rather than duplicating that logic here.
export { useCreateOutfitMutation as useSaveRecommendationMutation } from '@/features/styleIt';
