import { ClothingItem, FormalityLevel } from '@/types/clothingItem.types';
import { Color } from '@/types/catalog.types';
import { CompatibilityBreakdown, Mood } from '@/types/outfit.types';

export interface GenerateRecommendationsInput {
  mood: Mood;
  occasionId: string;
  formalityLevel?: FormalityLevel | undefined;
  requiredItemId?: string | undefined;
  excludedItemIds?: string[] | undefined;
  useFavorites?: boolean | undefined;
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

// Distinguishes *why* recommendations came back empty, so the UI doesn't tell
// someone whose closet has plenty of pieces to go "add a few more" when the
// real issue is that nothing scored well enough together.
export type EmptyRecommendationsReason = 'NOT_ENOUGH_PIECES' | 'BELOW_COMPATIBILITY_FLOOR';

export interface GenerateRecommendationsResult {
  styleCard: StyleCard | null;
  recommendations: Recommendation[];
  emptyReason?: EmptyRecommendationsReason | undefined;
}
