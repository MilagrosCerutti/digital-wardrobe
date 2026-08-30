import { z } from 'zod';

export const BODY_TYPES = ['SLIM', 'AVERAGE', 'CURVY'] as const;
export const SKIN_TONES = ['PORCELAIN', 'LIGHT', 'MEDIUM', 'TAN', 'DEEP'] as const;
export const HAIR_STYLES = ['LONG', 'SHORT', 'PONYTAIL', 'BUN'] as const;
export const HAIR_COLORS = [
  'BLONDE',
  'BROWN',
  'BLACK',
  'RED',
  'PASTEL_PINK',
  'PASTEL_LILAC',
] as const;
export const EYE_COLORS = ['BROWN', 'BLUE', 'GREEN', 'HAZEL'] as const;
export const DOLL_ITEM_CATEGORIES = ['TOP', 'BOTTOM', 'DRESS', 'SHOES', 'ACCESSORY'] as const;

export const updateDollAppearanceSchema = z
  .object({
    bodyType: z.enum(BODY_TYPES).optional(),
    skinTone: z.enum(SKIN_TONES).optional(),
    hairStyle: z.enum(HAIR_STYLES).optional(),
    hairColor: z.enum(HAIR_COLORS).optional(),
    eyeColor: z.enum(EYE_COLORS).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one appearance attribute must be provided.',
  });

export const equipDollItemSchema = z.object({
  dollItemId: z.string().uuid('A valid doll item id is required'),
});

export type UpdateDollAppearanceInput = z.infer<typeof updateDollAppearanceSchema>;
export type EquipDollItemInput = z.infer<typeof equipDollItemSchema>;
