import { FormalityLevel } from '@/types/clothingItem.types';
import { CompatibilityResult } from '@/types/outfit.types';

export const FORMALITY_ORDER: Record<FormalityLevel, number> = {
  CASUAL: 0,
  SMART_CASUAL: 1,
  FORMAL: 2,
  VERY_FORMAL: 3,
};
export const MAX_FORMALITY_SPREAD = 3;

export const FORMALITY_WEIGHT = 0.4;
export const COLOR_WEIGHT = 0.3;
export const STYLE_WEIGHT = 0.3;

export interface CompatibilityItemInput {
  formalityLevel: FormalityLevel;
  colorIds: string[];
  styleIds: string[];
}

function calculateFormalityScore(items: CompatibilityItemInput[]): number {
  const levels = items.map((item) => FORMALITY_ORDER[item.formalityLevel]);
  const spread = Math.max(...levels) - Math.min(...levels);
  return Math.round(100 * (1 - spread / MAX_FORMALITY_SPREAD));
}

/**
 * Share of item pairs that have at least one overlapping value (color or
 * style). A fully cohesive outfit, where every pair shares something, scores
 * 100; an outfit where no two items share anything scores 0.
 */
function calculatePairwiseOverlapScore(itemValueSets: string[][]): number {
  let sharedPairs = 0;
  let totalPairs = 0;

  for (let i = 0; i < itemValueSets.length; i++) {
    for (let j = i + 1; j < itemValueSets.length; j++) {
      totalPairs += 1;
      const a = itemValueSets[i]!;
      const b = new Set(itemValueSets[j]!);
      if (a.some((value) => b.has(value))) {
        sharedPairs += 1;
      }
    }
  }

  if (totalPairs === 0) return 100;
  return Math.round((sharedPairs / totalPairs) * 100);
}

export function calculateOutfitCompatibility(items: CompatibilityItemInput[]): CompatibilityResult {
  const formalityScore = calculateFormalityScore(items);
  const colorScore = calculatePairwiseOverlapScore(items.map((item) => item.colorIds));
  const styleScore = calculatePairwiseOverlapScore(items.map((item) => item.styleIds));

  const score = Math.round(
    formalityScore * FORMALITY_WEIGHT + colorScore * COLOR_WEIGHT + styleScore * STYLE_WEIGHT,
  );

  return { score, breakdown: { formalityScore, colorScore, styleScore } };
}
