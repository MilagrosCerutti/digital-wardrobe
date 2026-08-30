import * as catalogRepository from '@/repositories/catalog.repository';
import * as clothingItemRepository from '@/repositories/clothingItem.repository';
import * as outfitRepository from '@/repositories/outfit.repository';
import { CompatibilityItemInput, calculateOutfitCompatibility } from '@/services/outfitCompatibility';
import { ClothingItem } from '@/types/clothingItem.types';
import { CompatibilityResult, CreateOutfitInput, Outfit } from '@/types/outfit.types';
import { NotFoundError, ValidationError } from '@/utils/AppError';

async function resolveAndValidateItems(userId: string, clothingItemIds: string[]): Promise<ClothingItem[]> {
  const items = await clothingItemRepository.findClothingItemsByIdsForUser(userId, clothingItemIds);

  if (items.length !== clothingItemIds.length) {
    throw new ValidationError('One or more selected items could not be found in your closet.');
  }
  if (items.some((item) => item.isArchived)) {
    throw new ValidationError('Archived items cannot be used in an outfit.');
  }

  return items;
}

function toCompatibilityInput(item: ClothingItem): CompatibilityItemInput {
  return {
    formalityLevel: item.formalityLevel,
    colorIds: item.colors.map((color) => color.id),
    styleIds: item.styles.map((style) => style.id),
  };
}

export async function previewOutfit(
  userId: string,
  clothingItemIds: string[],
): Promise<CompatibilityResult> {
  const items = await resolveAndValidateItems(userId, clothingItemIds);
  return calculateOutfitCompatibility(items.map(toCompatibilityInput));
}

export async function createOutfit(userId: string, input: CreateOutfitInput): Promise<Outfit> {
  const items = await resolveAndValidateItems(userId, input.clothingItemIds);
  const { score, breakdown } = calculateOutfitCompatibility(items.map(toCompatibilityInput));

  const occasion = input.occasionId ? await catalogRepository.findOccasionById(input.occasionId) : null;
  if (input.occasionId && !occasion) {
    throw new ValidationError('Select a valid occasion.');
  }

  const outfit = await outfitRepository.createOutfit(userId, {
    name: input.name ?? null,
    source: input.source ?? 'MANUAL',
    compatibilityScore: score,
    clothingItemIds: input.clothingItemIds,
    occasionId: input.occasionId ?? null,
    mood: input.mood ?? null,
  });

  return { ...outfit, items, compatibilityBreakdown: breakdown, occasion };
}

// The breakdown is not persisted (only the final score is); it is cheap to
// recompute from the outfit's own items using the same single-source-of-truth
// algorithm, rather than storing a second, potentially-drifting copy.
async function attachItems(
  userId: string,
  outfits: outfitRepository.OutfitRow[],
): Promise<Outfit[]> {
  if (outfits.length === 0) return [];

  const itemIdsByOutfit = await outfitRepository.findClothingItemIdsByOutfitIds(
    outfits.map((outfit) => outfit.id),
  );
  const allItemIds = [...new Set(Object.values(itemIdsByOutfit).flat())];
  const items = await clothingItemRepository.findClothingItemsByIdsForUser(userId, allItemIds);
  const itemsById = new Map(items.map((item) => [item.id, item]));

  // Resolved regardless of the occasion's current is_active state, matching the
  // existing rule that archived ClothingItems remain visible on past outfits.
  const occasionIds = [...new Set(outfits.map((outfit) => outfit.occasionId).filter((id): id is string => id !== null))];
  const occasions = await catalogRepository.findOccasionsByIds(occasionIds);
  const occasionsById = new Map(occasions.map((occasion) => [occasion.id, occasion]));

  return outfits.map((outfit) => {
    const outfitItems = (itemIdsByOutfit[outfit.id] ?? [])
      .map((itemId) => itemsById.get(itemId))
      .filter((item): item is ClothingItem => item !== undefined);
    const { breakdown } = calculateOutfitCompatibility(outfitItems.map(toCompatibilityInput));
    const occasion = outfit.occasionId ? (occasionsById.get(outfit.occasionId) ?? null) : null;

    return { ...outfit, items: outfitItems, compatibilityBreakdown: breakdown, occasion };
  });
}

export async function listMyOutfits(userId: string): Promise<Outfit[]> {
  const outfits = await outfitRepository.findOutfitRowsForUser(userId);
  return attachItems(userId, outfits);
}

async function getOwnedOutfitRowOrThrow(
  userId: string,
  id: string,
): Promise<outfitRepository.OutfitRow> {
  const outfit = await outfitRepository.findOutfitRowById(id);
  if (!outfit || outfit.userId !== userId) {
    throw new NotFoundError('Look not found.');
  }
  return outfit;
}

export async function getMyOutfitDetail(userId: string, id: string): Promise<Outfit> {
  const outfit = await getOwnedOutfitRowOrThrow(userId, id);
  const [full] = await attachItems(userId, [outfit]);
  return full!;
}

export async function deleteMyOutfit(userId: string, id: string): Promise<void> {
  await getOwnedOutfitRowOrThrow(userId, id);
  await outfitRepository.deleteOutfit(id);
}
