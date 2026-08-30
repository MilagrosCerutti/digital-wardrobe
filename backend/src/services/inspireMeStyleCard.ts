import { ClothingItem, FormalityLevel } from '@/types/clothingItem.types';
import { Color } from '@/types/catalog.types';
import { CompatibilityBreakdown, Mood } from '@/types/outfit.types';
import { StyleCard } from '@/types/inspireMe.types';

// Presentational labels only (Title Case of existing enum values) - these do
// not influence candidate selection or scoring in any way. Mood stays
// descriptive-only per the approved plan: no Mood -> Style/Color mapping.
export const MOOD_LABELS: Record<Mood, string> = {
  CONFIDENT: 'Confident',
  RELAXED: 'Relaxed',
  PLAYFUL: 'Playful',
  ROMANTIC: 'Romantic',
  COZY: 'Cozy',
  BOLD: 'Bold',
};

export const FORMALITY_LABELS: Record<FormalityLevel, string> = {
  CASUAL: 'Casual',
  SMART_CASUAL: 'Smart Casual',
  FORMAL: 'Formal',
  VERY_FORMAL: 'Very Formal',
};

export interface BuildExplanationParams {
  breakdown: CompatibilityBreakdown;
  moodLabel: string;
  occasionName: string;
  formalityTargetLabel: string;
  formalityTargetSource: 'explicit' | 'occasion';
  useFavorites: boolean;
  favoritedItemCount: number;
}

/** Cites only factors that actually participated, per §25. */
export function buildExplanation(params: BuildExplanationParams): string[] {
  const lines: string[] = [
    `You asked for a ${params.moodLabel} mood for ${params.occasionName}.`,
    `Formality compatibility: ${params.breakdown.formalityScore}%`,
    `Color compatibility: ${params.breakdown.colorScore}%`,
    `Style compatibility: ${params.breakdown.styleScore}%`,
    params.formalityTargetSource === 'explicit'
      ? `Ranked toward your requested ${params.formalityTargetLabel} formality.`
      : `Ranked toward ${params.occasionName}'s typical formality.`,
  ];

  if (params.useFavorites && params.favoritedItemCount > 0) {
    lines.push(
      params.favoritedItemCount === 1
        ? 'Includes one of your favorite pieces.'
        : `Includes ${params.favoritedItemCount} of your favorite pieces.`,
    );
  }

  return lines;
}

export interface BuildStyleCardParams {
  moodLabel: string;
  occasionName: string;
  recommendations: { items: ClothingItem[] }[];
}

const COLOR_PALETTE_LIMIT = 5;
const KEY_PIECES_LIMIT = 5;
const TOP_STYLES_LIMIT = 2;
const CHARACTERISTICS_LIMIT = 3;

/**
 * Derived entirely from the items actually returned - reports on what was
 * selected, never uses Mood/Occasion to steer color/style choices.
 */
export function buildStyleCard(params: BuildStyleCardParams): StyleCard | null {
  if (params.recommendations.length === 0) return null;

  const vibeName = `${params.moodLabel} ${params.occasionName}`;
  const description = `A ${params.moodLabel.toLowerCase()} take on ${params.occasionName.toLowerCase()}, pulled straight from your own closet.`;

  const colorFrequency = new Map<string, { color: Color; count: number }>();
  const subcategoryFrequency = new Map<string, number>();
  const formalityFrequency = new Map<FormalityLevel, number>();
  const styleFrequency = new Map<string, { name: string; count: number }>();

  for (const recommendation of params.recommendations) {
    for (const item of recommendation.items) {
      formalityFrequency.set(item.formalityLevel, (formalityFrequency.get(item.formalityLevel) ?? 0) + 1);
      subcategoryFrequency.set(item.subcategory.name, (subcategoryFrequency.get(item.subcategory.name) ?? 0) + 1);
      for (const color of item.colors) {
        const existing = colorFrequency.get(color.id);
        colorFrequency.set(color.id, { color, count: (existing?.count ?? 0) + 1 });
      }
      for (const style of item.styles) {
        const existing = styleFrequency.get(style.id);
        styleFrequency.set(style.id, { name: style.name, count: (existing?.count ?? 0) + 1 });
      }
    }
  }

  const colorPalette = [...colorFrequency.values()]
    .sort((a, b) => b.count - a.count || a.color.name.localeCompare(b.color.name))
    .slice(0, COLOR_PALETTE_LIMIT)
    .map((entry) => entry.color);

  const keyPieces = [...subcategoryFrequency.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, KEY_PIECES_LIMIT)
    .map(([name]) => name);

  const dominantFormality = [...formalityFrequency.entries()].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
  )[0]?.[0];

  const topStyles = [...styleFrequency.values()]
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, TOP_STYLES_LIMIT)
    .map((entry) => entry.name);

  const characteristics = [
    ...(dominantFormality ? [`Mostly ${FORMALITY_LABELS[dominantFormality]}`] : []),
    ...topStyles,
  ].slice(0, CHARACTERISTICS_LIMIT);

  return {
    vibeName,
    description,
    colorPalette,
    keyPieces,
    characteristics,
    outfitCount: params.recommendations.length,
  };
}
