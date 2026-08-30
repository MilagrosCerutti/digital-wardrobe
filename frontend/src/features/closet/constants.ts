import type { Fit, FormalityLevel } from '@/features/closet/types/closet.types';

export const FIT_OPTIONS: { value: Fit; label: string }[] = [
  { value: 'SLIM', label: 'Slim' },
  { value: 'REGULAR', label: 'Regular' },
  { value: 'OVERSIZED', label: 'Oversized' },
  { value: 'RELAXED', label: 'Relaxed' },
];

export const FORMALITY_OPTIONS: { value: FormalityLevel; label: string }[] = [
  { value: 'CASUAL', label: 'Casual' },
  { value: 'SMART_CASUAL', label: 'Smart Casual' },
  { value: 'FORMAL', label: 'Formal' },
  { value: 'VERY_FORMAL', label: 'Very Formal' },
];
