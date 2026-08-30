import { z } from 'zod';

export const MOOD_VALUES = ['CONFIDENT', 'RELAXED', 'PLAYFUL', 'ROMANTIC', 'COZY', 'BOLD'] as const;
export const OUTFIT_SOURCE_VALUES = ['MANUAL', 'GENERATED'] as const;

const clothingItemIds = z
  .array(z.string().uuid('A valid clothing item id is required'))
  .min(2, 'An outfit must contain at least two clothing items')
  .refine((ids) => new Set(ids).size === ids.length, {
    message: 'The same clothing item cannot be used twice in one outfit.',
  });

export const previewOutfitSchema = z.object({
  clothingItemIds,
});

export const createOutfitSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  clothingItemIds,
  source: z.enum(OUTFIT_SOURCE_VALUES).optional(),
  occasionId: z.string().uuid('A valid occasion is required').optional(),
  mood: z.enum(MOOD_VALUES).optional(),
});

export type PreviewOutfitInput = z.infer<typeof previewOutfitSchema>;
export type CreateOutfitInput = z.infer<typeof createOutfitSchema>;
