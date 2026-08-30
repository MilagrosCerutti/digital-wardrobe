import type { ClothingItem, Occasion } from '@/features/closet/types/closet.types';

export type { ClothingItem };

export type Mood = 'CONFIDENT' | 'RELAXED' | 'PLAYFUL' | 'ROMANTIC' | 'COZY' | 'BOLD';

export interface CompatibilityBreakdown {
  formalityScore: number;
  colorScore: number;
  styleScore: number;
}

export interface CompatibilityResult {
  score: number;
  breakdown: CompatibilityBreakdown;
}

export type OutfitSource = 'MANUAL' | 'GENERATED';

export interface Outfit {
  id: string;
  userId: string;
  name: string | null;
  source: OutfitSource;
  compatibilityScore: number;
  compatibilityBreakdown: CompatibilityBreakdown;
  items: ClothingItem[];
  occasion: Occasion | null;
  mood: Mood | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOutfitPayload {
  name?: string;
  clothingItemIds: string[];
  source?: OutfitSource;
  occasionId?: string;
  mood?: Mood;
}
