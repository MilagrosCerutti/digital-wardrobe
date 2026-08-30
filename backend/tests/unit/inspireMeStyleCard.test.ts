import { buildExplanation, buildStyleCard } from '@/services/inspireMeStyleCard';
import { ClothingItem } from '@/types/clothingItem.types';

function buildCatalogEntry(id: string, name: string) {
  return { id, name, isActive: true, createdAt: '', updatedAt: '' };
}

function buildItem(overrides: Partial<ClothingItem> = {}): ClothingItem {
  return {
    id: 'item-1',
    userId: 'user-1',
    imageUrl: 'https://example.com/image.png',
    category: buildCatalogEntry('cat-1', 'Tops'),
    subcategory: buildCatalogEntry('sub-1', 'T-Shirt'),
    material: buildCatalogEntry('mat-1', 'Cotton'),
    pattern: buildCatalogEntry('pat-1', 'Solid'),
    colors: [{ ...buildCatalogEntry('color-1', 'Pink'), hex: '#F2A7C3' }],
    styles: [{ ...buildCatalogEntry('style-1', 'Boho') }],
    fit: 'REGULAR',
    formalityLevel: 'CASUAL',
    isArchived: false,
    isFavorite: false,
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

describe('inspireMeStyleCard.buildExplanation', () => {
  it('cites mood, occasion, and the three breakdown factors', () => {
    const lines = buildExplanation({
      breakdown: { formalityScore: 80, colorScore: 60, styleScore: 90 },
      moodLabel: 'Cozy',
      occasionName: 'Work',
      formalityTargetLabel: 'Casual',
      formalityTargetSource: 'occasion',
      useFavorites: false,
      favoritedItemCount: 0,
    });

    expect(lines).toContainEqual(expect.stringContaining('Cozy mood for Work'));
    expect(lines).toContainEqual('Formality compatibility: 80%');
    expect(lines).toContainEqual('Color compatibility: 60%');
    expect(lines).toContainEqual('Style compatibility: 90%');
    expect(lines).toContainEqual("Ranked toward Work's typical formality.");
  });

  it('cites the explicit formality preference instead of the occasion hint when one was given', () => {
    const lines = buildExplanation({
      breakdown: { formalityScore: 80, colorScore: 60, styleScore: 90 },
      moodLabel: 'Bold',
      occasionName: 'Party',
      formalityTargetLabel: 'Formal',
      formalityTargetSource: 'explicit',
      useFavorites: false,
      favoritedItemCount: 0,
    });

    expect(lines).toContainEqual('Ranked toward your requested Formal formality.');
  });

  it('mentions favorites only when useFavorites is on and the candidate actually has one', () => {
    const withFavorites = buildExplanation({
      breakdown: { formalityScore: 80, colorScore: 60, styleScore: 90 },
      moodLabel: 'Playful',
      occasionName: 'Date Night',
      formalityTargetLabel: 'Smart Casual',
      formalityTargetSource: 'occasion',
      useFavorites: true,
      favoritedItemCount: 2,
    });
    expect(withFavorites).toContainEqual('Includes 2 of your favorite pieces.');

    const withoutFavoritesEnabled = buildExplanation({
      breakdown: { formalityScore: 80, colorScore: 60, styleScore: 90 },
      moodLabel: 'Playful',
      occasionName: 'Date Night',
      formalityTargetLabel: 'Smart Casual',
      formalityTargetSource: 'occasion',
      useFavorites: false,
      favoritedItemCount: 2,
    });
    expect(withoutFavoritesEnabled.some((line) => line.includes('favorite'))).toBe(false);
  });
});

describe('inspireMeStyleCard.buildStyleCard', () => {
  it('returns null when there are no recommendations', () => {
    expect(buildStyleCard({ moodLabel: 'Cozy', occasionName: 'Work', recommendations: [] })).toBeNull();
  });

  it('builds a vibe name and description from mood and occasion only', () => {
    const card = buildStyleCard({
      moodLabel: 'Cozy',
      occasionName: 'Work',
      recommendations: [{ items: [buildItem()] }],
    });

    expect(card!.vibeName).toBe('Cozy Work');
    expect(card!.description).toContain('cozy');
    expect(card!.description).toContain('work');
  });

  it('derives the color palette and key pieces from the actual returned items', () => {
    const card = buildStyleCard({
      moodLabel: 'Bold',
      occasionName: 'Party',
      recommendations: [
        { items: [buildItem({ id: 'a', subcategory: buildCatalogEntry('sub-1', 'Blouse') })] },
        { items: [buildItem({ id: 'b', subcategory: buildCatalogEntry('sub-1', 'Blouse') })] },
      ],
    });

    expect(card!.colorPalette.map((c) => c.name)).toContain('Pink');
    expect(card!.keyPieces).toContain('Blouse');
    expect(card!.outfitCount).toBe(2);
  });

  it('summarizes dominant formality and styles as characteristics', () => {
    const card = buildStyleCard({
      moodLabel: 'Relaxed',
      occasionName: 'Casual Day',
      recommendations: [{ items: [buildItem({ formalityLevel: 'CASUAL' })] }],
    });

    expect(card!.characteristics).toContain('Mostly Casual');
    expect(card!.characteristics).toContain('Boho');
  });
});
