import type { ClothingItem, Color, FormalityLevel } from '@/features/closet/types/closet.types';
import type { CompatibilityBreakdown, Mood } from '@/features/styleIt/types/styleIt.types';

export type { ClothingItem, Mood };

export interface GenerateRecommendationsPayload {
  mood: Mood;
  occasionId: string;
  formalityLevel?: FormalityLevel;
  requiredItemId?: string;
  excludedItemIds?: string[];
  useFavorites?: boolean;
}

export interface Recommendation {
  items: ClothingItem[];
  compatibilityScore: number;
  compatibilityBreakdown: CompatibilityBreakdown;
  explanation: string[];
}

export interface StyleCard {
  vibeName: string;
  description: string;
  colorPalette: Color[];
  keyPieces: string[];
  characteristics: string[];
  outfitCount: number;
}

export type EmptyRecommendationsReason = 'NOT_ENOUGH_PIECES' | 'BELOW_COMPATIBILITY_FLOOR';

export interface GenerateRecommendationsResult {
  styleCard: StyleCard | null;
  recommendations: Recommendation[];
  emptyReason?: EmptyRecommendationsReason;
}
