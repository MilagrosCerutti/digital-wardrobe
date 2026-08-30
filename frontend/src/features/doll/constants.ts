import type { BodyType, EyeColor, HairColor, HairStyle, SkinTone } from '@/features/doll/types/doll.types';

export const BODY_TYPE_OPTIONS: { value: BodyType; label: string }[] = [
  { value: 'SLIM', label: 'Slim' },
  { value: 'AVERAGE', label: 'Average' },
  { value: 'CURVY', label: 'Curvy' },
];

export const SKIN_TONE_OPTIONS: { value: SkinTone; label: string; hex: string }[] = [
  { value: 'PORCELAIN', label: 'Porcelain', hex: '#FBE7DA' },
  { value: 'LIGHT', label: 'Light', hex: '#F3D2B3' },
  { value: 'MEDIUM', label: 'Medium', hex: '#D9A066' },
  { value: 'TAN', label: 'Tan', hex: '#B87D4B' },
  { value: 'DEEP', label: 'Deep', hex: '#7A4A2B' },
];

export const HAIR_STYLE_OPTIONS: { value: HairStyle; label: string }[] = [
  { value: 'LONG', label: 'Long' },
  { value: 'SHORT', label: 'Short' },
  { value: 'PONYTAIL', label: 'Ponytail' },
  { value: 'BUN', label: 'Bun' },
];

export const HAIR_COLOR_OPTIONS: { value: HairColor; label: string; hex: string }[] = [
  { value: 'BLONDE', label: 'Blonde', hex: '#E8C27E' },
  { value: 'BROWN', label: 'Brown', hex: '#6B4A32' },
  { value: 'BLACK', label: 'Black', hex: '#2B2118' },
  { value: 'RED', label: 'Red', hex: '#B5523A' },
  { value: 'PASTEL_PINK', label: 'Pastel Pink', hex: '#F3B6D2' },
  { value: 'PASTEL_LILAC', label: 'Pastel Lilac', hex: '#C9B6E8' },
];

export const EYE_COLOR_OPTIONS: { value: EyeColor; label: string; hex: string }[] = [
  { value: 'BROWN', label: 'Brown', hex: '#6B4A32' },
  { value: 'BLUE', label: 'Blue', hex: '#6FA8D8' },
  { value: 'GREEN', label: 'Green', hex: '#6FA87E' },
  { value: 'HAZEL', label: 'Hazel', hex: '#A98B5D' },
];

export function skinToneHex(value: SkinTone): string {
  return SKIN_TONE_OPTIONS.find((option) => option.value === value)?.hex ?? '#D9A066';
}

export function hairColorHex(value: HairColor): string {
  return HAIR_COLOR_OPTIONS.find((option) => option.value === value)?.hex ?? '#6B4A32';
}

export function eyeColorHex(value: EyeColor): string {
  return EYE_COLOR_OPTIONS.find((option) => option.value === value)?.hex ?? '#6B4A32';
}

/**
 * Curated garment color palette. Kept intentionally small and consistent with
 * Digital Wardrobe's Y2K/pastel visual identity rather than allowing arbitrary
 * user-chosen colors.
 */
export const CLOTHING_COLOR_OPTIONS: { label: string; hex: string }[] = [
  { label: 'Pastel Pink', hex: '#F2A7C3' },
  { label: 'Lilac', hex: '#C9B6E8' },
  { label: 'Butter Yellow', hex: '#F5E3B3' },
  { label: 'Baby Blue', hex: '#A9C6E0' },
  { label: 'Cream', hex: '#FCEEE3' },
  { label: 'White', hex: '#F5F3EE' },
  { label: 'Soft Gray', hex: '#D8D2C4' },
  { label: 'Denim', hex: '#8FB4D9' },
  { label: 'Tan', hex: '#D9B7A3' },
  { label: 'Black', hex: '#2B2118' },
];
