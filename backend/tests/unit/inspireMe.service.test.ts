import * as inspireMeService from '@/services/inspireMe.service';
import * as catalogRepository from '@/repositories/catalog.repository';
import * as clothingItemRepository from '@/repositories/clothingItem.repository';
import { ClothingItem } from '@/types/clothingItem.types';
import { Occasion } from '@/types/catalog.types';

jest.mock('@/repositories/catalog.repository');
jest.mock('@/repositories/clothingItem.repository');

const mockedCatalogRepository = catalogRepository as jest.Mocked<typeof catalogRepository>;
const mockedClothingItemRepository = clothingItemRepository as jest.Mocked<typeof clothingItemRepository>;

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
    colors: [],
    styles: [],
    fit: 'REGULAR',
    formalityLevel: 'CASUAL',
    isArchived: false,
    isFavorite: false,
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

function buildOccasion(overrides: Partial<Occasion> = {}): Occasion {
  return { ...buildCatalogEntry('occasion-1', 'Work'), formalityHint: 'SMART_CASUAL', ...overrides };
}

// A shared color/style, added to every item in a pool that should score well
// above the compatibility floor (matching formality alone -- the default on
// every buildItem() -- isn't enough; color/style also need to overlap).
const SHARED_COLOR = { ...buildCatalogEntry('color-1', 'Beige'), hex: '#D9B7A3' };
const SHARED_STYLE = buildCatalogEntry('style-1', 'Casual');
function compatible(overrides: Partial<ClothingItem> = {}): ClothingItem {
  return buildItem({ colors: [SHARED_COLOR], styles: [SHARED_STYLE], ...overrides });
}

afterEach(() => {
  jest.clearAllMocks();
});

describe('inspireMe.service.generateRecommendations', () => {
  it('rejects an unknown occasion', async () => {
    mockedCatalogRepository.findOccasionById.mockResolvedValue(null);

    await expect(
      inspireMeService.generateRecommendations('user-1', { mood: 'COZY', occasionId: 'missing' }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('rejects an inactive occasion', async () => {
    mockedCatalogRepository.findOccasionById.mockResolvedValue(buildOccasion({ isActive: false }));

    await expect(
      inspireMeService.generateRecommendations('user-1', { mood: 'COZY', occasionId: 'occasion-1' }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('returns an empty result when the closet cannot produce a valid outfit', async () => {
    mockedCatalogRepository.findOccasionById.mockResolvedValue(buildOccasion());
    mockedClothingItemRepository.findClothingItemsForUser.mockResolvedValue([
      buildItem({ id: 'top-1', category: buildCatalogEntry('cat-1', 'Tops') }),
    ]);

    const result = await inspireMeService.generateRecommendations('user-1', {
      mood: 'COZY',
      occasionId: 'occasion-1',
    });

    expect(result).toEqual({ styleCard: null, recommendations: [], emptyReason: 'NOT_ENOUGH_PIECES' });
  });

  it('rejects a required item that is not in the active closet', async () => {
    mockedCatalogRepository.findOccasionById.mockResolvedValue(buildOccasion());
    mockedClothingItemRepository.findClothingItemsForUser.mockResolvedValue([
      buildItem({ id: 'top-1', category: buildCatalogEntry('cat-1', 'Tops') }),
      buildItem({ id: 'bottom-1', category: buildCatalogEntry('cat-2', 'Bottoms') }),
    ]);

    await expect(
      inspireMeService.generateRecommendations('user-1', {
        mood: 'COZY',
        occasionId: 'occasion-1',
        requiredItemId: 'not-in-closet',
      }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('generates ranked recommendations with a style card for a valid closet, always including Shoes and Accessories', async () => {
    mockedCatalogRepository.findOccasionById.mockResolvedValue(buildOccasion({ name: 'Work', formalityHint: 'CASUAL' }));
    mockedClothingItemRepository.findClothingItemsForUser.mockResolvedValue([
      compatible({ id: 'top-1', category: buildCatalogEntry('cat-1', 'Tops') }),
      compatible({ id: 'bottom-1', category: buildCatalogEntry('cat-2', 'Bottoms') }),
      compatible({ id: 'shoes-1', category: buildCatalogEntry('cat-3', 'Shoes') }),
      compatible({ id: 'acc-1', category: buildCatalogEntry('cat-4', 'Accessories') }),
    ]);

    const result = await inspireMeService.generateRecommendations('user-1', {
      mood: 'COZY',
      occasionId: 'occasion-1',
    });

    expect(result.recommendations).toHaveLength(1);
    expect(result.recommendations[0]!.items.map((i) => i.id).sort()).toEqual([
      'acc-1',
      'bottom-1',
      'shoes-1',
      'top-1',
    ]);
    expect(result.recommendations[0]!.explanation.length).toBeGreaterThan(0);
    expect(result.styleCard).not.toBeNull();
    expect(result.styleCard!.outfitCount).toBe(1);
  });

  it('returns an empty result when the closet has Tops/Bottoms but no Shoes or Accessories', async () => {
    mockedCatalogRepository.findOccasionById.mockResolvedValue(buildOccasion());
    mockedClothingItemRepository.findClothingItemsForUser.mockResolvedValue([
      buildItem({ id: 'top-1', category: buildCatalogEntry('cat-1', 'Tops') }),
      buildItem({ id: 'bottom-1', category: buildCatalogEntry('cat-2', 'Bottoms') }),
    ]);

    const result = await inspireMeService.generateRecommendations('user-1', {
      mood: 'COZY',
      occasionId: 'occasion-1',
    });

    expect(result).toEqual({ styleCard: null, recommendations: [], emptyReason: 'NOT_ENOUGH_PIECES' });
  });

  it('excludes candidates scoring below the compatibility floor', async () => {
    mockedCatalogRepository.findOccasionById.mockResolvedValue(buildOccasion({ formalityHint: 'VERY_FORMAL' }));
    mockedClothingItemRepository.findClothingItemsForUser.mockResolvedValue([
      buildItem({ id: 'top-1', category: buildCatalogEntry('cat-1', 'Tops'), formalityLevel: 'CASUAL' }),
      buildItem({ id: 'bottom-1', category: buildCatalogEntry('cat-2', 'Bottoms'), formalityLevel: 'CASUAL' }),
      buildItem({ id: 'shoes-1', category: buildCatalogEntry('cat-3', 'Shoes'), formalityLevel: 'CASUAL' }),
      buildItem({ id: 'acc-1', category: buildCatalogEntry('cat-4', 'Accessories'), formalityLevel: 'CASUAL' }),
    ]);

    const result = await inspireMeService.generateRecommendations('user-1', {
      mood: 'COZY',
      occasionId: 'occasion-1',
    });

    // All-CASUAL outfit against a VERY_FORMAL target, plus no shared colors/
    // styles -> compatibility 0, well below the floor.
    expect(result).toEqual({ styleCard: null, recommendations: [], emptyReason: 'BELOW_COMPATIBILITY_FLOOR' });
  });

  it('scores an outfit built around the requested formality higher than one that is not, even with identical internal cohesion', async () => {
    mockedCatalogRepository.findOccasionById.mockResolvedValue(buildOccasion({ formalityHint: 'VERY_FORMAL' }));
    mockedClothingItemRepository.findClothingItemsForUser.mockResolvedValue([
      compatible({ id: 'top-1', category: buildCatalogEntry('cat-1', 'Tops'), formalityLevel: 'VERY_FORMAL' }),
      compatible({ id: 'bottom-1', category: buildCatalogEntry('cat-2', 'Bottoms'), formalityLevel: 'VERY_FORMAL' }),
      compatible({ id: 'shoes-1', category: buildCatalogEntry('cat-3', 'Shoes'), formalityLevel: 'VERY_FORMAL' }),
      compatible({ id: 'acc-1', category: buildCatalogEntry('cat-4', 'Accessories'), formalityLevel: 'VERY_FORMAL' }),
    ]);

    const result = await inspireMeService.generateRecommendations('user-1', {
      mood: 'COZY',
      occasionId: 'occasion-1',
    });

    expect(result.recommendations).toHaveLength(1);
    expect(result.recommendations[0]!.compatibilityBreakdown.formalityScore).toBe(100);
    expect(result.recommendations[0]!.compatibilityScore).toBe(100);
  });

  it('excludes the given item ids from candidate generation', async () => {
    mockedCatalogRepository.findOccasionById.mockResolvedValue(buildOccasion());
    mockedClothingItemRepository.findClothingItemsForUser.mockResolvedValue([
      compatible({ id: 'top-1', category: buildCatalogEntry('cat-1', 'Tops') }),
      compatible({ id: 'top-2', category: buildCatalogEntry('cat-1', 'Tops') }),
      compatible({ id: 'bottom-1', category: buildCatalogEntry('cat-2', 'Bottoms') }),
      compatible({ id: 'shoes-1', category: buildCatalogEntry('cat-3', 'Shoes') }),
      compatible({ id: 'acc-1', category: buildCatalogEntry('cat-4', 'Accessories') }),
    ]);

    const result = await inspireMeService.generateRecommendations('user-1', {
      mood: 'COZY',
      occasionId: 'occasion-1',
      excludedItemIds: ['top-1'],
    });

    const usedItemIds = result.recommendations.flatMap((r) => r.items.map((i) => i.id));
    expect(usedItemIds.length).toBeGreaterThan(0);
    expect(usedItemIds).not.toContain('top-1');
  });
});
