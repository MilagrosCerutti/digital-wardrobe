import * as closetService from '@/services/closet.service';
import * as clothingItemRepository from '@/repositories/clothingItem.repository';
import * as catalogRepository from '@/repositories/catalog.repository';
import * as outfitRepository from '@/repositories/outfit.repository';
import * as clothingImageStorage from '@/utils/clothingImageStorage';
import { Catalog } from '@/types/catalog.types';
import { ClothingItem } from '@/types/clothingItem.types';

jest.mock('@/repositories/clothingItem.repository');
jest.mock('@/repositories/catalog.repository');
jest.mock('@/repositories/outfit.repository');
jest.mock('@/utils/clothingImageStorage');

const mockedRepository = clothingItemRepository as jest.Mocked<typeof clothingItemRepository>;
const mockedCatalogRepository = catalogRepository as jest.Mocked<typeof catalogRepository>;
const mockedOutfitRepository = outfitRepository as jest.Mocked<typeof outfitRepository>;
const mockedImageStorage = clothingImageStorage as jest.Mocked<typeof clothingImageStorage>;

function buildCatalogEntry(id: string, name: string) {
  return { id, name, isActive: true, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' };
}

function buildClothingItem(overrides: Partial<ClothingItem> = {}): ClothingItem {
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
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function buildCatalog(): Catalog {
  return {
    categories: [buildCatalogEntry('cat-1', 'Tops')],
    subcategories: [{ ...buildCatalogEntry('sub-1', 'T-Shirt'), categoryId: 'cat-1' }],
    materials: [buildCatalogEntry('mat-1', 'Cotton')],
    patterns: [buildCatalogEntry('pat-1', 'Solid')],
    colors: [{ ...buildCatalogEntry('color-1', 'Pink'), hex: '#F2A7C3' }],
    styles: [buildCatalogEntry('style-1', 'Casual')],
    occasions: [],
  };
}

const VALID_CREATE_INPUT = {
  imageUrl: 'https://example.com/image.png',
  categoryId: 'cat-1',
  subcategoryId: 'sub-1',
  materialId: 'mat-1',
  patternId: 'pat-1',
  colorIds: ['color-1'],
  styleIds: ['style-1'],
  fit: 'REGULAR' as const,
  formalityLevel: 'CASUAL' as const,
};

afterEach(() => {
  jest.clearAllMocks();
});

describe('closet.service.listMyClothingItems', () => {
  it('delegates to the repository with the requesting user id and filters', async () => {
    mockedRepository.findClothingItemsForUser.mockResolvedValue([buildClothingItem()]);

    const items = await closetService.listMyClothingItems('user-1', { categoryId: 'cat-1' });

    expect(mockedRepository.findClothingItemsForUser).toHaveBeenCalledWith('user-1', {
      categoryId: 'cat-1',
    });
    expect(items).toHaveLength(1);
  });

  it('returns an empty list when the user has no clothing items', async () => {
    mockedRepository.findClothingItemsForUser.mockResolvedValue([]);

    const items = await closetService.listMyClothingItems('user-1', {});

    expect(items).toEqual([]);
  });
});

describe('closet.service.getMyClothingItemDetail', () => {
  it('returns the item when it belongs to the requesting user', async () => {
    mockedRepository.findClothingItemById.mockResolvedValue(buildClothingItem());

    const item = await closetService.getMyClothingItemDetail('user-1', 'item-1');

    expect(item.id).toBe('item-1');
  });

  it('throws NotFoundError when the item belongs to another user', async () => {
    mockedRepository.findClothingItemById.mockResolvedValue(buildClothingItem({ userId: 'other-user' }));

    await expect(closetService.getMyClothingItemDetail('user-1', 'item-1')).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('throws NotFoundError when the item does not exist', async () => {
    mockedRepository.findClothingItemById.mockResolvedValue(null);

    await expect(closetService.getMyClothingItemDetail('user-1', 'missing')).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

describe('closet.service.createClothingItem', () => {
  it('creates the item when every catalog selection is valid', async () => {
    mockedCatalogRepository.findFullCatalog.mockResolvedValue(buildCatalog());
    mockedRepository.createClothingItem.mockResolvedValue(buildClothingItem());

    const item = await closetService.createClothingItem('user-1', VALID_CREATE_INPUT);

    expect(item.id).toBe('item-1');
    expect(mockedRepository.createClothingItem).toHaveBeenCalledWith('user-1', VALID_CREATE_INPUT);
  });

  it('rejects a category id that is not in the active catalog', async () => {
    mockedCatalogRepository.findFullCatalog.mockResolvedValue(buildCatalog());

    await expect(
      closetService.createClothingItem('user-1', { ...VALID_CREATE_INPUT, categoryId: 'unknown-cat' }),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(mockedRepository.createClothingItem).not.toHaveBeenCalled();
  });

  it('rejects a color id that is not in the active catalog', async () => {
    mockedCatalogRepository.findFullCatalog.mockResolvedValue(buildCatalog());

    await expect(
      closetService.createClothingItem('user-1', { ...VALID_CREATE_INPUT, colorIds: ['unknown-color'] }),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(mockedRepository.createClothingItem).not.toHaveBeenCalled();
  });
});

describe('closet.service.updateMyClothingItem', () => {
  it('rejects updating an item that belongs to another user', async () => {
    mockedRepository.findClothingItemById.mockResolvedValue(buildClothingItem({ userId: 'other-user' }));

    await expect(
      closetService.updateMyClothingItem('user-1', 'item-1', { fit: 'SLIM' }),
    ).rejects.toMatchObject({ statusCode: 404 });
    expect(mockedRepository.updateClothingItem).not.toHaveBeenCalled();
  });

  it('validates a changed category against the active catalog', async () => {
    mockedRepository.findClothingItemById.mockResolvedValue(buildClothingItem());
    mockedCatalogRepository.findFullCatalog.mockResolvedValue(buildCatalog());

    await expect(
      closetService.updateMyClothingItem('user-1', 'item-1', { categoryId: 'unknown-cat' }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('deletes the old image from storage when the image is replaced', async () => {
    const existing = buildClothingItem({ imageUrl: 'https://example.com/old.png' });
    mockedRepository.findClothingItemById.mockResolvedValue(existing);
    mockedCatalogRepository.findFullCatalog.mockResolvedValue(buildCatalog());
    mockedRepository.updateClothingItem.mockResolvedValue(
      buildClothingItem({ imageUrl: 'https://example.com/new.png' }),
    );

    await closetService.updateMyClothingItem('user-1', 'item-1', {
      imageUrl: 'https://example.com/new.png',
    });

    expect(mockedImageStorage.deleteClothingImage).toHaveBeenCalledWith('https://example.com/old.png');
  });

  it('does not delete the image from storage when it is unchanged', async () => {
    mockedRepository.findClothingItemById.mockResolvedValue(buildClothingItem());
    mockedCatalogRepository.findFullCatalog.mockResolvedValue(buildCatalog());
    mockedRepository.updateClothingItem.mockResolvedValue(buildClothingItem({ fit: 'SLIM' }));

    await closetService.updateMyClothingItem('user-1', 'item-1', { fit: 'SLIM' });

    expect(mockedImageStorage.deleteClothingImage).not.toHaveBeenCalled();
  });
});

describe('closet.service.deleteMyClothingItem', () => {
  it('deletes an owned item and its stored image when it is not used in any outfit', async () => {
    const existing = buildClothingItem({ imageUrl: 'https://example.com/image.png' });
    mockedRepository.findClothingItemById.mockResolvedValue(existing);
    mockedOutfitRepository.isClothingItemUsedInAnyOutfit.mockResolvedValue(false);

    await closetService.deleteMyClothingItem('user-1', 'item-1');

    expect(mockedRepository.deleteClothingItem).toHaveBeenCalledWith('item-1');
    expect(mockedImageStorage.deleteClothingImage).toHaveBeenCalledWith('https://example.com/image.png');
  });

  it('rejects deleting an item that belongs to another user', async () => {
    mockedRepository.findClothingItemById.mockResolvedValue(buildClothingItem({ userId: 'other-user' }));

    await expect(closetService.deleteMyClothingItem('user-1', 'item-1')).rejects.toMatchObject({
      statusCode: 404,
    });
    expect(mockedRepository.deleteClothingItem).not.toHaveBeenCalled();
  });

  it('rejects deleting an item that is used in a saved look, without deleting anything', async () => {
    mockedRepository.findClothingItemById.mockResolvedValue(buildClothingItem());
    mockedOutfitRepository.isClothingItemUsedInAnyOutfit.mockResolvedValue(true);

    await expect(closetService.deleteMyClothingItem('user-1', 'item-1')).rejects.toMatchObject({
      statusCode: 400,
    });
    expect(mockedRepository.deleteClothingItem).not.toHaveBeenCalled();
    expect(mockedImageStorage.deleteClothingImage).not.toHaveBeenCalled();
  });
});

describe('closet.service.archiveMyClothingItem / restoreMyClothingItem', () => {
  it('archives an owned item', async () => {
    mockedRepository.findClothingItemById.mockResolvedValue(buildClothingItem());
    mockedRepository.setArchived.mockResolvedValue(buildClothingItem({ isArchived: true }));

    const item = await closetService.archiveMyClothingItem('user-1', 'item-1');

    expect(item.isArchived).toBe(true);
    expect(mockedRepository.setArchived).toHaveBeenCalledWith('item-1', true);
  });

  it('rejects archiving an item that belongs to another user', async () => {
    mockedRepository.findClothingItemById.mockResolvedValue(buildClothingItem({ userId: 'other-user' }));

    await expect(closetService.archiveMyClothingItem('user-1', 'item-1')).rejects.toMatchObject({
      statusCode: 404,
    });
    expect(mockedRepository.setArchived).not.toHaveBeenCalled();
  });

  it('restores an owned archived item', async () => {
    mockedRepository.findClothingItemById.mockResolvedValue(buildClothingItem({ isArchived: true }));
    mockedRepository.setArchived.mockResolvedValue(buildClothingItem({ isArchived: false }));

    const item = await closetService.restoreMyClothingItem('user-1', 'item-1');

    expect(item.isArchived).toBe(false);
    expect(mockedRepository.setArchived).toHaveBeenCalledWith('item-1', false);
  });
});

describe('closet.service.favoriteMyClothingItem / unfavoriteMyClothingItem', () => {
  it('favorites an owned item', async () => {
    mockedRepository.findClothingItemById.mockResolvedValue(buildClothingItem());
    mockedRepository.setFavorite.mockResolvedValue(buildClothingItem({ isFavorite: true }));

    const item = await closetService.favoriteMyClothingItem('user-1', 'item-1');

    expect(item.isFavorite).toBe(true);
    expect(mockedRepository.setFavorite).toHaveBeenCalledWith('item-1', true);
  });

  it('rejects favoriting an item that belongs to another user', async () => {
    mockedRepository.findClothingItemById.mockResolvedValue(buildClothingItem({ userId: 'other-user' }));

    await expect(closetService.favoriteMyClothingItem('user-1', 'item-1')).rejects.toMatchObject({
      statusCode: 404,
    });
    expect(mockedRepository.setFavorite).not.toHaveBeenCalled();
  });

  it('unfavorites an owned item', async () => {
    mockedRepository.findClothingItemById.mockResolvedValue(buildClothingItem({ isFavorite: true }));
    mockedRepository.setFavorite.mockResolvedValue(buildClothingItem({ isFavorite: false }));

    const item = await closetService.unfavoriteMyClothingItem('user-1', 'item-1');

    expect(item.isFavorite).toBe(false);
    expect(mockedRepository.setFavorite).toHaveBeenCalledWith('item-1', false);
  });
});
