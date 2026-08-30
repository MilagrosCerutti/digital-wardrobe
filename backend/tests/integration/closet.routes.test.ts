import request from 'supertest';
import { createApp } from '@/app';
import * as clothingItemRepository from '@/repositories/clothingItem.repository';
import * as catalogRepository from '@/repositories/catalog.repository';
import * as outfitRepository from '@/repositories/outfit.repository';
import * as clothingImageStorage from '@/utils/clothingImageStorage';
import { Catalog } from '@/types/catalog.types';
import { ClothingItem } from '@/types/clothingItem.types';
import { signAccessToken } from '@/utils/jwt';

jest.mock('@/repositories/clothingItem.repository');
jest.mock('@/repositories/catalog.repository');
jest.mock('@/repositories/outfit.repository');
jest.mock('@/utils/clothingImageStorage');

const mockedRepository = clothingItemRepository as jest.Mocked<typeof clothingItemRepository>;
const mockedCatalogRepository = catalogRepository as jest.Mocked<typeof catalogRepository>;
const mockedOutfitRepository = outfitRepository as jest.Mocked<typeof outfitRepository>;
const mockedImageStorage = clothingImageStorage as jest.Mocked<typeof clothingImageStorage>;
const AUTH_TOKEN = signAccessToken({ sub: 'user-1', role: 'USER' });
const ITEM_ID = '11111111-1111-4111-8111-111111111111';

function buildCatalogEntry(id: string, name: string) {
  return { id, name, isActive: true, createdAt: '', updatedAt: '' };
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
    colors: [],
    styles: [],
    fit: 'REGULAR',
    formalityLevel: 'CASUAL',
    isArchived: false,
    isFavorite: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

const CATEGORY_ID = 'aaaaaaaa-1111-4111-8111-111111111111';
const SUBCATEGORY_ID = 'bbbbbbbb-1111-4111-8111-111111111111';
const MATERIAL_ID = 'cccccccc-1111-4111-8111-111111111111';
const PATTERN_ID = 'dddddddd-1111-4111-8111-111111111111';
const COLOR_ID = 'eeeeeeee-1111-4111-8111-111111111111';
const STYLE_ID = 'ffffffff-1111-4111-8111-111111111111';

function buildCatalog(): Catalog {
  return {
    categories: [buildCatalogEntry(CATEGORY_ID, 'Tops')],
    subcategories: [{ ...buildCatalogEntry(SUBCATEGORY_ID, 'T-Shirt'), categoryId: CATEGORY_ID }],
    materials: [buildCatalogEntry(MATERIAL_ID, 'Cotton')],
    patterns: [buildCatalogEntry(PATTERN_ID, 'Solid')],
    colors: [{ ...buildCatalogEntry(COLOR_ID, 'Pink'), hex: '#F2A7C3' }],
    styles: [buildCatalogEntry(STYLE_ID, 'Casual')],
    occasions: [],
  };
}

const VALID_CREATE_BODY = {
  imageUrl: 'https://example.com/image.png',
  categoryId: CATEGORY_ID,
  subcategoryId: SUBCATEGORY_ID,
  materialId: MATERIAL_ID,
  patternId: PATTERN_ID,
  colorIds: [COLOR_ID],
  styleIds: [STYLE_ID],
  fit: 'REGULAR',
  formalityLevel: 'CASUAL',
};

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/v1/closet', () => {
  it('should require authentication', async () => {
    const response = await request(createApp()).get('/api/v1/closet');
    expect(response.status).toBe(401);
  });

  it('should reject an invalid filter value', async () => {
    const response = await request(createApp())
      .get('/api/v1/closet?fit=GIGANTIC')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`);

    expect(response.status).toBe(400);
    expect(mockedRepository.findClothingItemsForUser).not.toHaveBeenCalled();
  });

  it('should reject a non-uuid categoryId filter', async () => {
    const response = await request(createApp())
      .get('/api/v1/closet?categoryId=not-a-uuid')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`);

    expect(response.status).toBe(400);
  });

  it('should return an empty list for a user with no clothing items', async () => {
    mockedRepository.findClothingItemsForUser.mockResolvedValue([]);

    const response = await request(createApp())
      .get('/api/v1/closet')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`);

    expect(response.status).toBe(200);
    expect(response.body.items).toEqual([]);
  });

  it('should default to excluding archived items', async () => {
    mockedRepository.findClothingItemsForUser.mockResolvedValue([buildClothingItem()]);

    const response = await request(createApp())
      .get('/api/v1/closet')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`);

    expect(response.status).toBe(200);
    expect(mockedRepository.findClothingItemsForUser).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ includeArchived: false }),
    );
  });

  it('should pass includeArchived through when requested', async () => {
    mockedRepository.findClothingItemsForUser.mockResolvedValue([]);

    const response = await request(createApp())
      .get('/api/v1/closet?includeArchived=true')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`);

    expect(response.status).toBe(200);
    expect(mockedRepository.findClothingItemsForUser).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ includeArchived: true }),
    );
  });

  it('should not return another user clothing items', async () => {
    mockedRepository.findClothingItemsForUser.mockResolvedValue([]);

    await request(createApp()).get('/api/v1/closet').set('Authorization', `Bearer ${AUTH_TOKEN}`);

    expect(mockedRepository.findClothingItemsForUser).toHaveBeenCalledWith(
      'user-1',
      expect.anything(),
    );
  });

  it('should pass favoritesOnly through when requested', async () => {
    mockedRepository.findClothingItemsForUser.mockResolvedValue([]);

    const response = await request(createApp())
      .get('/api/v1/closet?favoritesOnly=true')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`);

    expect(response.status).toBe(200);
    expect(mockedRepository.findClothingItemsForUser).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ favoritesOnly: true }),
    );
  });
});

describe('POST /api/v1/closet/images', () => {
  it('should require authentication', async () => {
    const response = await request(createApp())
      .post('/api/v1/closet/images')
      .attach('image', Buffer.from('fake-image-bytes'), { filename: 'shirt.png', contentType: 'image/png' });

    expect(response.status).toBe(401);
  });

  it('should reject a request with no file', async () => {
    const response = await request(createApp())
      .post('/api/v1/closet/images')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`);

    expect(response.status).toBe(400);
  });

  it('should reject an unsupported file type', async () => {
    const response = await request(createApp())
      .post('/api/v1/closet/images')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .attach('image', Buffer.from('not-an-image'), { filename: 'notes.txt', contentType: 'text/plain' });

    expect(response.status).toBe(400);
  });

  it('should upload a valid image and return its url', async () => {
    mockedImageStorage.uploadClothingImage.mockResolvedValue('https://example.com/uploaded.png');

    const response = await request(createApp())
      .post('/api/v1/closet/images')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .attach('image', Buffer.from('fake-image-bytes'), { filename: 'shirt.png', contentType: 'image/png' });

    expect(response.status).toBe(201);
    expect(response.body.imageUrl).toBe('https://example.com/uploaded.png');
    expect(mockedImageStorage.uploadClothingImage).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ mimetype: 'image/png' }),
    );
  });
});

describe('POST /api/v1/closet', () => {
  it('should require authentication', async () => {
    const response = await request(createApp()).post('/api/v1/closet').send(VALID_CREATE_BODY);
    expect(response.status).toBe(401);
  });

  it('should reject a body missing required fields', async () => {
    const response = await request(createApp())
      .post('/api/v1/closet')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .send({ imageUrl: 'https://example.com/image.png' });

    expect(response.status).toBe(400);
    expect(mockedRepository.createClothingItem).not.toHaveBeenCalled();
  });

  it('should reject an empty colorIds array', async () => {
    const response = await request(createApp())
      .post('/api/v1/closet')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .send({ ...VALID_CREATE_BODY, colorIds: [] });

    expect(response.status).toBe(400);
  });

  it('should reject a category id that does not exist in the catalog', async () => {
    mockedCatalogRepository.findFullCatalog.mockResolvedValue(buildCatalog());

    const response = await request(createApp())
      .post('/api/v1/closet')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .send({ ...VALID_CREATE_BODY, categoryId: '22222222-2222-4222-8222-222222222222' });

    expect(response.status).toBe(400);
    expect(mockedRepository.createClothingItem).not.toHaveBeenCalled();
  });

  it('should create the item for valid input', async () => {
    mockedCatalogRepository.findFullCatalog.mockResolvedValue(buildCatalog());
    mockedRepository.createClothingItem.mockResolvedValue(buildClothingItem());

    const response = await request(createApp())
      .post('/api/v1/closet')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .send(VALID_CREATE_BODY);

    expect(response.status).toBe(201);
    expect(response.body.item.id).toBe('item-1');
  });
});

describe('GET /api/v1/closet/:id', () => {
  it('should reject a non-uuid id', async () => {
    const response = await request(createApp())
      .get('/api/v1/closet/not-a-uuid')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`);

    expect(response.status).toBe(400);
  });

  it('should return 404 for another user item', async () => {
    mockedRepository.findClothingItemById.mockResolvedValue(
      buildClothingItem({ id: ITEM_ID, userId: 'other-user' }),
    );

    const response = await request(createApp())
      .get(`/api/v1/closet/${ITEM_ID}`)
      .set('Authorization', `Bearer ${AUTH_TOKEN}`);

    expect(response.status).toBe(404);
  });

  it('should return the item detail for its owner', async () => {
    mockedRepository.findClothingItemById.mockResolvedValue(buildClothingItem({ id: ITEM_ID }));

    const response = await request(createApp())
      .get(`/api/v1/closet/${ITEM_ID}`)
      .set('Authorization', `Bearer ${AUTH_TOKEN}`);

    expect(response.status).toBe(200);
    expect(response.body.item.id).toBe(ITEM_ID);
  });
});

describe('PATCH /api/v1/closet/:id', () => {
  it('should reject an empty patch', async () => {
    const response = await request(createApp())
      .patch(`/api/v1/closet/${ITEM_ID}`)
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .send({});

    expect(response.status).toBe(400);
  });

  it('should return 404 when updating another user item', async () => {
    mockedRepository.findClothingItemById.mockResolvedValue(
      buildClothingItem({ id: ITEM_ID, userId: 'other-user' }),
    );

    const response = await request(createApp())
      .patch(`/api/v1/closet/${ITEM_ID}`)
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .send({ fit: 'SLIM' });

    expect(response.status).toBe(404);
    expect(mockedRepository.updateClothingItem).not.toHaveBeenCalled();
  });

  it('should update the item for its owner', async () => {
    const existing = buildClothingItem({
      id: ITEM_ID,
      category: buildCatalogEntry(CATEGORY_ID, 'Tops'),
      subcategory: buildCatalogEntry(SUBCATEGORY_ID, 'T-Shirt'),
      material: buildCatalogEntry(MATERIAL_ID, 'Cotton'),
      pattern: buildCatalogEntry(PATTERN_ID, 'Solid'),
      colors: [{ ...buildCatalogEntry(COLOR_ID, 'Pink'), hex: '#F2A7C3' }],
      styles: [buildCatalogEntry(STYLE_ID, 'Casual')],
    });
    mockedRepository.findClothingItemById.mockResolvedValue(existing);
    mockedCatalogRepository.findFullCatalog.mockResolvedValue(buildCatalog());
    mockedRepository.updateClothingItem.mockResolvedValue({ ...existing, fit: 'SLIM' });

    const response = await request(createApp())
      .patch(`/api/v1/closet/${ITEM_ID}`)
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .send({ fit: 'SLIM' });

    expect(response.status).toBe(200);
    expect(response.body.item.fit).toBe('SLIM');
  });
});

describe('DELETE /api/v1/closet/:id', () => {
  it('should delete an owned item not used in any saved look', async () => {
    mockedRepository.findClothingItemById.mockResolvedValue(buildClothingItem({ id: ITEM_ID }));
    mockedOutfitRepository.isClothingItemUsedInAnyOutfit.mockResolvedValue(false);

    const response = await request(createApp())
      .delete(`/api/v1/closet/${ITEM_ID}`)
      .set('Authorization', `Bearer ${AUTH_TOKEN}`);

    expect(response.status).toBe(204);
    expect(mockedRepository.deleteClothingItem).toHaveBeenCalledWith(ITEM_ID);
  });

  it('should return 404 deleting another user item', async () => {
    mockedRepository.findClothingItemById.mockResolvedValue(
      buildClothingItem({ id: ITEM_ID, userId: 'other-user' }),
    );

    const response = await request(createApp())
      .delete(`/api/v1/closet/${ITEM_ID}`)
      .set('Authorization', `Bearer ${AUTH_TOKEN}`);

    expect(response.status).toBe(404);
    expect(mockedRepository.deleteClothingItem).not.toHaveBeenCalled();
  });

  it('should return 400 and not delete an item used in a saved look', async () => {
    mockedRepository.findClothingItemById.mockResolvedValue(buildClothingItem({ id: ITEM_ID }));
    mockedOutfitRepository.isClothingItemUsedInAnyOutfit.mockResolvedValue(true);

    const response = await request(createApp())
      .delete(`/api/v1/closet/${ITEM_ID}`)
      .set('Authorization', `Bearer ${AUTH_TOKEN}`);

    expect(response.status).toBe(400);
    expect(mockedRepository.deleteClothingItem).not.toHaveBeenCalled();
  });
});

describe('PATCH /api/v1/closet/:id/archive and /restore', () => {
  it('should archive an owned item', async () => {
    mockedRepository.findClothingItemById.mockResolvedValue(buildClothingItem({ id: ITEM_ID }));
    mockedRepository.setArchived.mockResolvedValue(
      buildClothingItem({ id: ITEM_ID, isArchived: true }),
    );

    const response = await request(createApp())
      .patch(`/api/v1/closet/${ITEM_ID}/archive`)
      .set('Authorization', `Bearer ${AUTH_TOKEN}`);

    expect(response.status).toBe(200);
    expect(response.body.item.isArchived).toBe(true);
  });

  it('should return 404 archiving another user item', async () => {
    mockedRepository.findClothingItemById.mockResolvedValue(
      buildClothingItem({ id: ITEM_ID, userId: 'other-user' }),
    );

    const response = await request(createApp())
      .patch(`/api/v1/closet/${ITEM_ID}/archive`)
      .set('Authorization', `Bearer ${AUTH_TOKEN}`);

    expect(response.status).toBe(404);
    expect(mockedRepository.setArchived).not.toHaveBeenCalled();
  });

  it('should restore an owned archived item', async () => {
    mockedRepository.findClothingItemById.mockResolvedValue(
      buildClothingItem({ id: ITEM_ID, isArchived: true }),
    );
    mockedRepository.setArchived.mockResolvedValue(
      buildClothingItem({ id: ITEM_ID, isArchived: false }),
    );

    const response = await request(createApp())
      .patch(`/api/v1/closet/${ITEM_ID}/restore`)
      .set('Authorization', `Bearer ${AUTH_TOKEN}`);

    expect(response.status).toBe(200);
    expect(response.body.item.isArchived).toBe(false);
  });
});

describe('PATCH /api/v1/closet/:id/favorite and /unfavorite', () => {
  it('should favorite an owned item', async () => {
    mockedRepository.findClothingItemById.mockResolvedValue(buildClothingItem({ id: ITEM_ID }));
    mockedRepository.setFavorite.mockResolvedValue(
      buildClothingItem({ id: ITEM_ID, isFavorite: true }),
    );

    const response = await request(createApp())
      .patch(`/api/v1/closet/${ITEM_ID}/favorite`)
      .set('Authorization', `Bearer ${AUTH_TOKEN}`);

    expect(response.status).toBe(200);
    expect(response.body.item.isFavorite).toBe(true);
  });

  it('should return 404 favoriting another user item', async () => {
    mockedRepository.findClothingItemById.mockResolvedValue(
      buildClothingItem({ id: ITEM_ID, userId: 'other-user' }),
    );

    const response = await request(createApp())
      .patch(`/api/v1/closet/${ITEM_ID}/favorite`)
      .set('Authorization', `Bearer ${AUTH_TOKEN}`);

    expect(response.status).toBe(404);
    expect(mockedRepository.setFavorite).not.toHaveBeenCalled();
  });

  it('should unfavorite an owned favorited item', async () => {
    mockedRepository.findClothingItemById.mockResolvedValue(
      buildClothingItem({ id: ITEM_ID, isFavorite: true }),
    );
    mockedRepository.setFavorite.mockResolvedValue(
      buildClothingItem({ id: ITEM_ID, isFavorite: false }),
    );

    const response = await request(createApp())
      .patch(`/api/v1/closet/${ITEM_ID}/unfavorite`)
      .set('Authorization', `Bearer ${AUTH_TOKEN}`);

    expect(response.status).toBe(200);
    expect(response.body.item.isFavorite).toBe(false);
  });
});
