import * as outfitService from '@/services/outfit.service';
import * as catalogRepository from '@/repositories/catalog.repository';
import * as clothingItemRepository from '@/repositories/clothingItem.repository';
import * as outfitRepository from '@/repositories/outfit.repository';
import { ClothingItem } from '@/types/clothingItem.types';
import { Occasion } from '@/types/catalog.types';

jest.mock('@/repositories/catalog.repository');
jest.mock('@/repositories/clothingItem.repository');
jest.mock('@/repositories/outfit.repository');

const mockedCatalogRepository = catalogRepository as jest.Mocked<typeof catalogRepository>;
const mockedClothingItemRepository = clothingItemRepository as jest.Mocked<typeof clothingItemRepository>;
const mockedOutfitRepository = outfitRepository as jest.Mocked<typeof outfitRepository>;

function buildOccasion(overrides: Partial<Occasion> = {}): Occasion {
  return {
    id: 'occasion-1',
    name: 'Work',
    isActive: true,
    createdAt: '',
    updatedAt: '',
    formalityHint: 'SMART_CASUAL',
    ...overrides,
  };
}

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
    styles: [buildCatalogEntry('style-1', 'Casual')],
    fit: 'REGULAR',
    formalityLevel: 'CASUAL',
    isArchived: false,
    isFavorite: false,
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

afterEach(() => {
  jest.clearAllMocks();
});

describe('outfit.service.previewOutfit', () => {
  it('rejects when a selected item is not found (not owned, or does not exist)', async () => {
    mockedClothingItemRepository.findClothingItemsByIdsForUser.mockResolvedValue([buildItem()]);

    await expect(
      outfitService.previewOutfit('user-1', ['item-1', 'item-2']),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('rejects when any selected item is archived', async () => {
    mockedClothingItemRepository.findClothingItemsByIdsForUser.mockResolvedValue([
      buildItem({ id: 'item-1' }),
      buildItem({ id: 'item-2', isArchived: true }),
    ]);

    await expect(
      outfitService.previewOutfit('user-1', ['item-1', 'item-2']),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('returns the compatibility score and breakdown for valid items', async () => {
    mockedClothingItemRepository.findClothingItemsByIdsForUser.mockResolvedValue([
      buildItem({ id: 'item-1' }),
      buildItem({ id: 'item-2' }),
    ]);

    const result = await outfitService.previewOutfit('user-1', ['item-1', 'item-2']);

    expect(result.score).toBe(100);
    expect(result.breakdown).toEqual({ formalityScore: 100, colorScore: 100, styleScore: 100 });
  });
});

describe('outfit.service.createOutfit', () => {
  it('persists the outfit with the computed score and the given item ids', async () => {
    const items = [buildItem({ id: 'item-1' }), buildItem({ id: 'item-2' })];
    mockedClothingItemRepository.findClothingItemsByIdsForUser.mockResolvedValue(items);
    mockedOutfitRepository.createOutfit.mockResolvedValue({
      id: 'outfit-1',
      userId: 'user-1',
      name: 'Date Night',
      source: 'MANUAL',
      compatibilityScore: 100,
      occasionId: null,
      mood: null,
      createdAt: '',
      updatedAt: '',
    });

    const outfit = await outfitService.createOutfit('user-1', {
      name: 'Date Night',
      clothingItemIds: ['item-1', 'item-2'],
    });

    expect(mockedOutfitRepository.createOutfit).toHaveBeenCalledWith('user-1', {
      name: 'Date Night',
      source: 'MANUAL',
      compatibilityScore: 100,
      clothingItemIds: ['item-1', 'item-2'],
      occasionId: null,
      mood: null,
    });
    expect(outfit.items).toEqual(items);
    expect(outfit.compatibilityScore).toBe(100);
    expect(outfit.compatibilityBreakdown).toEqual({
      formalityScore: 100,
      colorScore: 100,
      styleScore: 100,
    });
  });

  it('stores a null name when none is provided', async () => {
    const items = [buildItem({ id: 'item-1' }), buildItem({ id: 'item-2' })];
    mockedClothingItemRepository.findClothingItemsByIdsForUser.mockResolvedValue(items);
    mockedOutfitRepository.createOutfit.mockResolvedValue({
      id: 'outfit-1',
      userId: 'user-1',
      name: null,
      source: 'MANUAL',
      compatibilityScore: 100,
      occasionId: null,
      mood: null,
      createdAt: '',
      updatedAt: '',
    });

    await outfitService.createOutfit('user-1', { clothingItemIds: ['item-1', 'item-2'] });

    expect(mockedOutfitRepository.createOutfit).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ name: null }),
    );
  });

  it('persists a GENERATED outfit with its occasion and mood, and resolves the occasion in the response', async () => {
    const items = [buildItem({ id: 'item-1' }), buildItem({ id: 'item-2' })];
    mockedClothingItemRepository.findClothingItemsByIdsForUser.mockResolvedValue(items);
    mockedCatalogRepository.findOccasionById.mockResolvedValue(buildOccasion());
    mockedOutfitRepository.createOutfit.mockResolvedValue({
      id: 'outfit-1',
      userId: 'user-1',
      name: null,
      source: 'GENERATED',
      compatibilityScore: 100,
      occasionId: 'occasion-1',
      mood: 'COZY',
      createdAt: '',
      updatedAt: '',
    });

    const outfit = await outfitService.createOutfit('user-1', {
      clothingItemIds: ['item-1', 'item-2'],
      source: 'GENERATED',
      occasionId: 'occasion-1',
      mood: 'COZY',
    });

    expect(mockedOutfitRepository.createOutfit).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ source: 'GENERATED', occasionId: 'occasion-1', mood: 'COZY' }),
    );
    expect(outfit.occasion).toEqual(buildOccasion());
    expect(outfit.source).toBe('GENERATED');
  });

  it('rejects saving an outfit with an occasion that does not exist', async () => {
    mockedClothingItemRepository.findClothingItemsByIdsForUser.mockResolvedValue([
      buildItem({ id: 'item-1' }),
      buildItem({ id: 'item-2' }),
    ]);
    mockedCatalogRepository.findOccasionById.mockResolvedValue(null);

    await expect(
      outfitService.createOutfit('user-1', {
        clothingItemIds: ['item-1', 'item-2'],
        occasionId: 'missing-occasion',
      }),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(mockedOutfitRepository.createOutfit).not.toHaveBeenCalled();
  });

  it('does not persist anything when validation fails', async () => {
    mockedClothingItemRepository.findClothingItemsByIdsForUser.mockResolvedValue([
      buildItem({ id: 'item-1', isArchived: true }),
    ]);

    await expect(
      outfitService.createOutfit('user-1', { clothingItemIds: ['item-1', 'item-2'] }),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(mockedOutfitRepository.createOutfit).not.toHaveBeenCalled();
  });
});
