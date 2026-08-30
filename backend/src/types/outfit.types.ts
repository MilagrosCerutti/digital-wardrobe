import { ClothingItem } from '@/types/clothingItem.types';
import { Occasion } from '@/types/catalog.types';

export type OutfitSource = 'MANUAL' | 'GENERATED';

export type Mood = 'CONFIDENT' | 'RELAXED' | 'PLAYFUL' | 'ROMANTIC' | 'COZY' | 'BOLD';

export interface CompatibilityBreakdown {
  formalityScore: number;
  colorScore: number;
  styleScore: number;
}

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

export interface CompatibilityResult {
  score: number;
  breakdown: CompatibilityBreakdown;
}

export interface CreateOutfitInput {
  name?: string | undefined;
  clothingItemIds: string[];
  source?: OutfitSource | undefined;
  occasionId?: string | undefined;
  mood?: Mood | undefined;
}
