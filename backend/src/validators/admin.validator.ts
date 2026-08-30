import { z } from 'zod';
import { FORMALITY_LEVELS } from '@/validators/closet.validator';
import { DOLL_ITEM_CATEGORIES } from '@/validators/doll.validator';

export const CATALOG_TYPES = [
  'categories',
  'subcategories',
  'materials',
  'patterns',
  'colors',
  'styles',
  'occasions',
] as const;

const catalogEntryNameSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
});

export const createCategorySchema = catalogEntryNameSchema;
export const createMaterialSchema = catalogEntryNameSchema;
export const createPatternSchema = catalogEntryNameSchema;
export const createStyleSchema = catalogEntryNameSchema;

export const createSubcategorySchema = catalogEntryNameSchema.extend({
  categoryId: z.string().uuid('A valid category is required'),
});

export const createColorSchema = catalogEntryNameSchema.extend({
  hex: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Hex must look like #RRGGBB'),
});

export const createOccasionSchema = catalogEntryNameSchema.extend({
  formalityHint: z.enum(FORMALITY_LEVELS),
});

export const createDollItemSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  category: z.enum(DOLL_ITEM_CATEGORIES),
  layer: z.number().int().min(0),
  assetUrl: z.string().trim().min(1, 'An asset key is required'),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must look like #RRGGBB'),
});

export const updateDollItemSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    category: z.enum(DOLL_ITEM_CATEGORIES).optional(),
    layer: z.number().int().min(0).optional(),
    assetUrl: z.string().trim().min(1).optional(),
    color: z
      .string()
      .trim()
      .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must look like #RRGGBB')
      .optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided.',
  });

export type CatalogType = (typeof CATALOG_TYPES)[number];
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type CreateMaterialInput = z.infer<typeof createMaterialSchema>;
export type CreatePatternInput = z.infer<typeof createPatternSchema>;
export type CreateStyleInput = z.infer<typeof createStyleSchema>;
export type CreateSubcategoryInput = z.infer<typeof createSubcategorySchema>;
export type CreateColorInput = z.infer<typeof createColorSchema>;
export type CreateOccasionInput = z.infer<typeof createOccasionSchema>;
export type CreateDollItemInput = z.infer<typeof createDollItemSchema>;
export type UpdateDollItemInput = z.infer<typeof updateDollItemSchema>;
