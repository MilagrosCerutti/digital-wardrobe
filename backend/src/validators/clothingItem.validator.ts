import { z } from 'zod';
import { FIT_VALUES, FORMALITY_LEVELS } from '@/validators/closet.validator';

const uuid = z.string().uuid('A valid id is required');
const uuidList = z.array(uuid).min(1, 'At least one selection is required');

export const createClothingItemSchema = z.object({
  imageUrl: z.string().trim().min(1, 'An image is required'),
  categoryId: uuid,
  subcategoryId: uuid,
  materialId: uuid,
  patternId: uuid,
  colorIds: uuidList,
  styleIds: uuidList,
  fit: z.enum(FIT_VALUES).optional(),
  formalityLevel: z.enum(FORMALITY_LEVELS),
});

export const updateClothingItemSchema = z
  .object({
    imageUrl: z.string().trim().min(1).optional(),
    categoryId: uuid.optional(),
    subcategoryId: uuid.optional(),
    materialId: uuid.optional(),
    patternId: uuid.optional(),
    colorIds: uuidList.optional(),
    styleIds: uuidList.optional(),
    fit: z.enum(FIT_VALUES).optional(),
    formalityLevel: z.enum(FORMALITY_LEVELS).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided.',
  });

export type CreateClothingItemInput = z.infer<typeof createClothingItemSchema>;
export type UpdateClothingItemInput = z.infer<typeof updateClothingItemSchema>;
