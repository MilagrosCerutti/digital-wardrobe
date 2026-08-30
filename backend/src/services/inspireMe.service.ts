import * as catalogRepository from '@/repositories/catalog.repository';
import * as clothingItemRepository from '@/repositories/clothingItem.repository';
import { GeneratorItem, generateCandidates, rankCandidates } from '@/services/inspireMeGenerator';
import { FORMALITY_LABELS, MOOD_LABELS, buildExplanation, buildStyleCard } from '@/services/inspireMeStyleCard';
import { ClothingItem } from '@/types/clothingItem.types';
import { GenerateRecommendationsInput, GenerateRecommendationsResult, Recommendation } from '@/types/inspireMe.types';
import { ValidationError } from '@/utils/AppError';

const RECOMMENDATION_LIMIT = 6;
// Outfits scoring 20% or less are not shown, even if the closet can't
// produce anything better -- an empty result communicates "not enough
// compatible pieces" more honestly than a low-scoring recommendation would.
const MINIMUM_COMPATIBILITY_SCORE = 21;

export async function generateRecommendations(
  userId: string,
  input: GenerateRecommendationsInput,
): Promise<GenerateRecommendationsResult> {
  const occasion = await catalogRepository.findOccasionById(input.occasionId);
  if (!occasion || !occasion.isActive) {
    throw new ValidationError('Select a valid occasion.');
  }

  const activeItems = await clothingItemRepository.findClothingItemsForUser(userId, {});
  const excludedItemIds = new Set(input.excludedItemIds ?? []);
  const pool = activeItems.filter((item) => !excludedItemIds.has(item.id));

  if (input.requiredItemId && !pool.some((item) => item.id === input.requiredItemId)) {
    throw new ValidationError('The required item could not be found in your active closet.');
  }

  const itemsById = new Map(pool.map((item) => [item.id, item]));
  const generatorPool: GeneratorItem[] = pool.map((item) => ({
    id: item.id,
    categoryName: item.category.name,
    formalityLevel: item.formalityLevel,
    colorIds: item.colors.map((color) => color.id),
    styleIds: item.styles.map((style) => style.id),
    isFavorite: item.isFavorite,
  }));

  const candidates = generateCandidates(generatorPool, { requiredItemId: input.requiredItemId });
  if (candidates.length === 0) {
    return { styleCard: null, recommendations: [], emptyReason: 'NOT_ENOUGH_PIECES' };
  }

  const formalityTarget = input.formalityLevel ?? occasion.formalityHint;
  const useFavorites = Boolean(input.useFavorites);
  const ranked = rankCandidates(candidates, { formalityTarget, useFavorites })
    .filter((candidate) => candidate.compatibilityScore >= MINIMUM_COMPATIBILITY_SCORE)
    .slice(0, RECOMMENDATION_LIMIT);

  if (ranked.length === 0) {
    return { styleCard: null, recommendations: [], emptyReason: 'BELOW_COMPATIBILITY_FLOOR' };
  }

  const moodLabel = MOOD_LABELS[input.mood];
  const formalityTargetSource: 'explicit' | 'occasion' = input.formalityLevel ? 'explicit' : 'occasion';

  const recommendations: Recommendation[] = ranked.map((candidate) => {
    const items = candidate.items
      .map((generatorItem) => itemsById.get(generatorItem.id))
      .filter((item): item is ClothingItem => item !== undefined);

    return {
      items,
      compatibilityScore: candidate.compatibilityScore,
      compatibilityBreakdown: candidate.compatibilityBreakdown,
      explanation: buildExplanation({
        breakdown: candidate.compatibilityBreakdown,
        moodLabel,
        occasionName: occasion.name,
        formalityTargetLabel: FORMALITY_LABELS[formalityTarget],
        formalityTargetSource,
        useFavorites,
        favoritedItemCount: candidate.favoritedItemCount,
      }),
    };
  });

  const styleCard = buildStyleCard({ moodLabel, occasionName: occasion.name, recommendations });

  return { styleCard, recommendations };
}
