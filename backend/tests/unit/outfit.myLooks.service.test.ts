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

function buildOutfitRow(overrides: Partial<outfitRepository.OutfitRow> = {}): outfitRepository.OutfitRow {
  return {
    id: 'outfit-1',
    userId: 'user-1',
    name: 'Weekend Look',
    source: 'MANUAL',
    compatibilityScore: 90,
    occasionId: null,
    mood: null,
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

beforeEach(() => {
  mockedCatalogRepository.findOccasionsByIds.mockResolvedValue([]);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('outfit.service.listMyOutfits', () => {
  it('returns an empty list without querying items when the user has no outfits', async () => {
    mockedOutfitRepository.findOutfitRowsForUser.mockResolvedValue([]);

    const outfits = await outfitService.listMyOutfits('user-1');

    expect(outfits).toEqual([]);
    expect(mockedOutfitRepository.findClothingItemIdsByOutfitIds).not.toHaveBeenCalled();
  });

  it('attaches the correct items to each outfit', async () => {
    mockedOutfitRepository.findOutfitRowsForUser.mockResolvedValue([
      buildOutfitRow({ id: 'outfit-1' }),
      buildOutfitRow({ id: 'outfit-2', name: 'Date Night' }),
    ]);
    mockedOutfitRepository.findClothingItemIdsByOutfitIds.mockResolvedValue({
      'outfit-1': ['item-1', 'item-2'],
      'outfit-2': ['item-2', 'item-3'],
    });
    mockedClothingItemRepository.findClothingItemsByIdsForUser.mockResolvedValue([
      buildItem({ id: 'item-1' }),
      buildItem({ id: 'item-2' }),
      buildItem({ id: 'item-3' }),
    ]);

    const outfits = await outfitService.listMyOutfits('user-1');

    expect(outfits[0]!.items.map((item) => item.id)).toEqual(['item-1', 'item-2']);
    expect(outfits[1]!.items.map((item) => item.id)).toEqual(['item-2', 'item-3']);
    expect(mockedClothingItemRepository.findClothingItemsByIdsForUser).toHaveBeenCalledWith(
      'user-1',
      expect.arrayContaining(['item-1', 'item-2', 'item-3']),
    );
  });

  it('resolves the occasion for a generated outfit and skips the lookup when none is set', async () => {
    const occasion = buildOccasion();
    mockedOutfitRepository.findOutfitRowsForUser.mockResolvedValue([
      buildOutfitRow({ id: 'outfit-1', occasionId: 'occasion-1', mood: 'COZY', source: 'GENERATED' }),
      buildOutfitRow({ id: 'outfit-2' }),
    ]);
    mockedOutfitRepository.findClothingItemIdsByOutfitIds.mockResolvedValue({
      'outfit-1': ['item-1'],
      'outfit-2': ['item-1'],
    });
    mockedClothingItemRepository.findClothingItemsByIdsForUser.mockResolvedValue([buildItem({ id: 'item-1' })]);
    mockedCatalogRepository.findOccasionsByIds.mockResolvedValue([occasion]);

    const outfits = await outfitService.listMyOutfits('user-1');

    expect(mockedCatalogRepository.findOccasionsByIds).toHaveBeenCalledWith(['occasion-1']);
    expect(outfits[0]!.occasion).toEqual(occasion);
    expect(outfits[0]!.mood).toBe('COZY');
    expect(outfits[1]!.occasion).toBeNull();
  });

  it('recomputes the compatibility breakdown from each outfit own items', async () => {
    mockedOutfitRepository.findOutfitRowsForUser.mockResolvedValue([buildOutfitRow()]);
    mockedOutfitRepository.findClothingItemIdsByOutfitIds.mockResolvedValue({
      'outfit-1': ['item-1', 'item-2'],
    });
    mockedClothingItemRepository.findClothingItemsByIdsForUser.mockResolvedValue([
      buildItem({ id: 'item-1' }),
      buildItem({ id: 'item-2' }),
    ]);

    const [outfit] = await outfitService.listMyOutfits('user-1');

    // Both items are CASUAL with no shared colors/styles in this fixture.
    expect(outfit!.compatibilityBreakdown).toEqual({
      formalityScore: 100,
      colorScore: 0,
      styleScore: 0,
    });
  });
});

describe('outfit.service.getMyOutfitDetail', () => {
  it('returns the outfit with its items for the owner', async () => {
    mockedOutfitRepository.findOutfitRowById.mockResolvedValue(buildOutfitRow());
    mockedOutfitRepository.findClothingItemIdsByOutfitIds.mockResolvedValue({ 'outfit-1': ['item-1'] });
    mockedClothingItemRepository.findClothingItemsByIdsForUser.mockResolvedValue([buildItem()]);

    const outfit = await outfitService.getMyOutfitDetail('user-1', 'outfit-1');

    expect(outfit.id).toBe('outfit-1');
    expect(outfit.items).toHaveLength(1);
    expect(outfit.compatibilityBreakdown).toBeDefined();
  });

  it('throws NotFoundError for an outfit belonging to another user', async () => {
    mockedOutfitRepository.findOutfitRowById.mockResolvedValue(buildOutfitRow({ userId: 'other-user' }));

    await expect(outfitService.getMyOutfitDetail('user-1', 'outfit-1')).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('throws NotFoundError when the outfit does not exist', async () => {
    mockedOutfitRepository.findOutfitRowById.mockResolvedValue(null);

    await expect(outfitService.getMyOutfitDetail('user-1', 'missing')).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

describe('outfit.service.deleteMyOutfit', () => {
  it('deletes an owned outfit', async () => {
    mockedOutfitRepository.findOutfitRowById.mockResolvedValue(buildOutfitRow());

    await outfitService.deleteMyOutfit('user-1', 'outfit-1');

    expect(mockedOutfitRepository.deleteOutfit).toHaveBeenCalledWith('outfit-1');
  });

  it('rejects deleting an outfit belonging to another user', async () => {
    mockedOutfitRepository.findOutfitRowById.mockResolvedValue(buildOutfitRow({ userId: 'other-user' }));

    await expect(outfitService.deleteMyOutfit('user-1', 'outfit-1')).rejects.toMatchObject({
      statusCode: 404,
    });
    expect(mockedOutfitRepository.deleteOutfit).not.toHaveBeenCalled();
  });
});
