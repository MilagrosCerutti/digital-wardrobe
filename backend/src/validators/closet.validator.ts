import { z } from 'zod';

export const FIT_VALUES = ['SLIM', 'REGULAR', 'OVERSIZED', 'RELAXED'] as const;
export const FORMALITY_LEVELS = ['CASUAL', 'SMART_CASUAL', 'FORMAL', 'VERY_FORMAL'] as const;

const uuidOptional = z.string().uuid().optional();
const booleanQueryParam = z
  .union([z.literal('true'), z.literal('false')])
  .optional()
  .transform((value) => value === 'true');

export const closetFiltersSchema = z.object({
  categoryId: uuidOptional,
  subcategoryId: uuidOptional,
  materialId: uuidOptional,
  patternId: uuidOptional,
  colorId: uuidOptional,
  styleId: uuidOptional,
  fit: z.enum(FIT_VALUES).optional(),
  formalityLevel: z.enum(FORMALITY_LEVELS).optional(),
  includeArchived: booleanQueryParam,
  favoritesOnly: booleanQueryParam,
});

export type ClosetFiltersQuery = z.infer<typeof closetFiltersSchema>;
