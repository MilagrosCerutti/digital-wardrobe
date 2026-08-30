import {
  COLOR_WEIGHT,
  CompatibilityItemInput,
  FORMALITY_ORDER,
  FORMALITY_WEIGHT,
  MAX_FORMALITY_SPREAD,
  STYLE_WEIGHT,
  calculateOutfitCompatibility,
} from '@/services/outfitCompatibility';
import { FormalityLevel } from '@/types/clothingItem.types';
import { CompatibilityBreakdown } from '@/types/outfit.types';

export interface GeneratorItem {
  id: string;
  categoryName: string;
  formalityLevel: FormalityLevel;
  colorIds: string[];
  styleIds: string[];
  isFavorite: boolean;
}

type OutfitSlot = 'top' | 'bottom' | 'dress' | 'outerwear' | 'shoes' | 'accessories';

// Matches by category name against the seeded catalog (§18 has no "slot/role"
// field on Category, so this is the only available signal). A category that
// doesn't match one of these names simply can't participate in a generated
// candidate - a disclosed limitation, not a silent failure.
const SLOT_BY_CATEGORY_NAME: Record<string, OutfitSlot> = {
  tops: 'top',
  bottoms: 'bottom',
  dresses: 'dress',
  outerwear: 'outerwear',
  shoes: 'shoes',
  accessories: 'accessories',
};

function slotFor(categoryName: string): OutfitSlot | undefined {
  return SLOT_BY_CATEGORY_NAME[categoryName.trim().toLowerCase()];
}

// Deterministic, disclosed caps to bound worst-case combinatorial growth for
// large closets. Sorting by id before slicing keeps the result reproducible
// for the same closet state, rather than randomly sampling.
const MAIN_SLOT_CAP = 10;
const OPTIONAL_SLOT_CAP = 6;

function capBucket(items: GeneratorItem[], cap: number): GeneratorItem[] {
  return [...items].sort((a, b) => a.id.localeCompare(b.id)).slice(0, cap);
}

export interface Candidate {
  items: GeneratorItem[];
}

export interface GenerateCandidatesOptions {
  requiredItemId?: string | undefined;
}

/**
 * Structural rule (approved): Top + Bottom, OR Dress, each combined with one
 * Shoes item and one Accessories item (a generated outfit is always a
 * complete look), optionally adding one Outerwear. No duplicate slot items,
 * no extra aesthetic rules beyond this and the existing compatibility
 * engine. A pool with no active Shoes or no active Accessories items simply
 * yields zero candidates -- the same "not enough pieces" empty-result path
 * already used when there aren't enough tops/bottoms/dresses.
 */
export function generateCandidates(pool: GeneratorItem[], options: GenerateCandidatesOptions = {}): Candidate[] {
  const buckets: Record<OutfitSlot, GeneratorItem[]> = {
    top: [],
    bottom: [],
    dress: [],
    outerwear: [],
    shoes: [],
    accessories: [],
  };
  for (const item of pool) {
    const slot = slotFor(item.categoryName);
    if (slot) buckets[slot].push(item);
  }

  const requiredItem = options.requiredItemId
    ? pool.find((item) => item.id === options.requiredItemId)
    : undefined;
  const requiredSlot = requiredItem ? slotFor(requiredItem.categoryName) : undefined;

  function requiredOrCapped(slot: OutfitSlot, cap: number): GeneratorItem[] {
    if (requiredItem && requiredSlot === slot) return [requiredItem];
    return capBucket(buckets[slot], cap);
  }

  const tops = requiredOrCapped('top', MAIN_SLOT_CAP);
  const bottoms = requiredOrCapped('bottom', MAIN_SLOT_CAP);
  const dresses = requiredOrCapped('dress', MAIN_SLOT_CAP);
  // Shoes and Accessories are required in every generated candidate, same as
  // Top/Bottom/Dress -- a generated outfit is always a complete look.
  const shoes = requiredOrCapped('shoes', MAIN_SLOT_CAP);
  const accessories = requiredOrCapped('accessories', MAIN_SLOT_CAP);

  // Outerwear is the only slot that stays optional ("none" is a valid choice)
  // unless the required item pins it.
  function optionalChoices(slot: OutfitSlot): (GeneratorItem | undefined)[] {
    if (requiredItem && requiredSlot === slot) return [requiredItem];
    return [undefined, ...capBucket(buckets[slot], OPTIONAL_SLOT_CAP)];
  }

  const outerwearChoices = optionalChoices('outerwear');

  const bases: GeneratorItem[][] = [];
  for (const top of tops) {
    for (const bottom of bottoms) {
      bases.push([top, bottom]);
    }
  }
  for (const dress of dresses) {
    bases.push([dress]);
  }

  const seen = new Set<string>();
  const candidates: Candidate[] = [];

  for (const base of bases) {
    for (const outerwear of outerwearChoices) {
      for (const shoesItem of shoes) {
        for (const accessoriesItem of accessories) {
          const items = [
            ...base,
            shoesItem,
            accessoriesItem,
            ...(outerwear ? [outerwear] : []),
          ];

          const key = items
            .map((item) => item.id)
            .sort()
            .join(',');
          if (seen.has(key)) continue;
          seen.add(key);
          candidates.push({ items });
        }
      }
    }
  }

  return candidates;
}

export interface RankedCandidate extends Candidate {
  compatibilityScore: number;
  compatibilityBreakdown: CompatibilityBreakdown;
  rankingScore: number;
  favoritedItemCount: number;
}

export interface RankCandidatesOptions {
  formalityTarget: FormalityLevel;
  useFavorites: boolean;
}

// Soft, additive, non-exclusionary per the approved plan: never filters
// candidates out, only reorders them. Meaningful enough to reliably surface
// favorited pieces without ever making non-favorite candidates disappear.
const FAVORITE_BONUS_PER_ITEM = 8;
const FAVORITE_BONUS_CAP = 24;

function toCompatibilityInput(item: GeneratorItem): CompatibilityItemInput {
  return { formalityLevel: item.formalityLevel, colorIds: item.colorIds, styleIds: item.styleIds };
}

// How well the outfit's average formality matches the requested occasion/
// preference (0 = opposite ends of the scale, 100 = exact match). Unlike
// calculateOutfitCompatibility's own formalityScore (spread *within* the
// outfit's own pieces -- still the right metric for Style It, which has no
// external target), Inspire Me always has a target formality to aim for, so
// its displayed "Formality" score should measure alignment to that target
// instead. A "Very Formal" item pulls this up when the target is formal,
// even if paired with pieces of a different formality.
function calculateFormalityAlignment(items: GeneratorItem[], target: FormalityLevel): number {
  const targetOrder = FORMALITY_ORDER[target];
  const averageOrder =
    items.reduce((sum, item) => sum + FORMALITY_ORDER[item.formalityLevel], 0) / items.length;
  const distance = Math.abs(averageOrder - targetOrder);
  return Math.round(100 * (1 - distance / MAX_FORMALITY_SPREAD));
}

function itemsKey(items: GeneratorItem[]): string {
  return items
    .map((item) => item.id)
    .sort()
    .join(',');
}

/**
 * The displayed compatibilityScore/breakdown for Inspire Me swaps in
 * formality-to-target alignment for the formality component (see
 * calculateFormalityAlignment) instead of calculateOutfitCompatibility's
 * internal-spread formalityScore, using the same weights -- so an outfit
 * built around a piece that matches the requested formality actually shows
 * up as more compatible, and the displayed breakdown bars stay consistent
 * with the overall percentage. Color/style stay as internal cohesion; there's
 * no external "color preference" to target.
 */
export function rankCandidates(candidates: Candidate[], options: RankCandidatesOptions): RankedCandidate[] {
  const ranked = candidates.map((candidate) => {
    const { colorScore, styleScore } = calculateOutfitCompatibility(
      candidate.items.map(toCompatibilityInput),
    ).breakdown;
    const formalityScore = calculateFormalityAlignment(candidate.items, options.formalityTarget);
    const score = Math.round(
      formalityScore * FORMALITY_WEIGHT + colorScore * COLOR_WEIGHT + styleScore * STYLE_WEIGHT,
    );
    const favoritedItemCount = candidate.items.filter((item) => item.isFavorite).length;
    const favoritesBonus = options.useFavorites
      ? Math.min(favoritedItemCount * FAVORITE_BONUS_PER_ITEM, FAVORITE_BONUS_CAP)
      : 0;
    const rankingScore = score + favoritesBonus;

    return {
      items: candidate.items,
      compatibilityScore: score,
      compatibilityBreakdown: { formalityScore, colorScore, styleScore },
      rankingScore,
      favoritedItemCount,
    };
  });

  return ranked.sort((a, b) => {
    if (b.rankingScore !== a.rankingScore) return b.rankingScore - a.rankingScore;
    if (b.compatibilityScore !== a.compatibilityScore) return b.compatibilityScore - a.compatibilityScore;
    return itemsKey(a.items).localeCompare(itemsKey(b.items));
  });
}
