import { z } from 'zod';
import { FORMALITY_LEVELS } from '@/validators/closet.validator';
import { MOOD_VALUES } from '@/validators/outfit.validator';

export const generateRecommendationsSchema = z.object({
  mood: z.enum(MOOD_VALUES),
  occasionId: z.string().uuid('A valid occasion is required'),
  formalityLevel: z.enum(FORMALITY_LEVELS).optional(),
  requiredItemId: z.string().uuid().optional(),
  excludedItemIds: z.array(z.string().uuid()).optional(),
  useFavorites: z.boolean().optional(),
});

export type GenerateRecommendationsInput = z.infer<typeof generateRecommendationsSchema>;
