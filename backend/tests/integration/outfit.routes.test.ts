import request from 'supertest';
import { createApp } from '@/app';
import * as clothingItemRepository from '@/repositories/clothingItem.repository';
import * as outfitRepository from '@/repositories/outfit.repository';
import { ClothingItem } from '@/types/clothingItem.types';
import { signAccessToken } from '@/utils/jwt';

function buildOutfitRow(overrides: Partial<outfitRepository.OutfitRow> = {}): outfitRepository.OutfitRow {
  return {
    id: 'outfit-1',
    userId: 'user-1',
    name: null,
    source: 'MANUAL',
    compatibilityScore: 90,
    occasionId: null,
    mood: null,
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

jest.mock('@/repositories/clothingItem.repository');
jest.mock('@/repositories/outfit.repository');

const mockedClothingItemRepository = clothingItemRepository as jest.Mocked<typeof clothingItemRepository>;
const mockedOutfitRepository = outfitRepository as jest.Mocked<typeof outfitRepository>;
const AUTH_TOKEN = signAccessToken({ sub: 'user-1', role: 'USER' });

const ITEM_1 = '11111111-1111-4111-8111-111111111111';
const ITEM_2 = '22222222-1111-4111-8111-111111111111';

function buildCatalogEntry(id: string, name: string) {
  return { id, name, isActive: true, createdAt: '', updatedAt: '' };
}

function buildItem(overrides: Partial<ClothingItem> = {}): ClothingItem {
  return {
    id: ITEM_1,
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

describe('POST /api/v1/outfits/preview', () => {
  it('should require authentication', async () => {
    const response = await request(createApp())
      .post('/api/v1/outfits/preview')
      .send({ clothingItemIds: [ITEM_1, ITEM_2] });

    expect(response.status).toBe(401);
  });

  it('should reject fewer than two items', async () => {
    const response = await request(createApp())
      .post('/api/v1/outfits/preview')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .send({ clothingItemIds: [ITEM_1] });

    expect(response.status).toBe(400);
  });

  it('should reject duplicate item ids', async () => {
    const response = await request(createApp())
      .post('/api/v1/outfits/preview')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .send({ clothingItemIds: [ITEM_1, ITEM_1] });

    expect(response.status).toBe(400);
  });

  it('should reject a non-uuid item id', async () => {
    const response = await request(createApp())
      .post('/api/v1/outfits/preview')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .send({ clothingItemIds: ['not-a-uuid', ITEM_2] });

    expect(response.status).toBe(400);
  });

  it('should return 400 when an item does not belong to the user', async () => {
    mockedClothingItemRepository.findClothingItemsByIdsForUser.mockResolvedValue([
      buildItem({ id: ITEM_1 }),
    ]);

    const response = await request(createApp())
      .post('/api/v1/outfits/preview')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .send({ clothingItemIds: [ITEM_1, ITEM_2] });

    expect(response.status).toBe(400);
  });

  it('should return the compatibility score for a valid combination', async () => {
    mockedClothingItemRepository.findClothingItemsByIdsForUser.mockResolvedValue([
      buildItem({ id: ITEM_1 }),
      buildItem({ id: ITEM_2 }),
    ]);

    const response = await request(createApp())
      .post('/api/v1/outfits/preview')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .send({ clothingItemIds: [ITEM_1, ITEM_2] });

    expect(response.status).toBe(200);
    expect(response.body.score).toBe(100);
    expect(response.body.breakdown).toEqual({ formalityScore: 100, colorScore: 100, styleScore: 100 });
  });
});

describe('POST /api/v1/outfits', () => {
  it('should create and return the outfit for a valid combination', async () => {
    const items = [buildItem({ id: ITEM_1 }), buildItem({ id: ITEM_2 })];
    mockedClothingItemRepository.findClothingItemsByIdsForUser.mockResolvedValue(items);
    mockedOutfitRepository.createOutfit.mockResolvedValue(
      buildOutfitRow({ name: 'Weekend Look', compatibilityScore: 100 }),
    );

    const response = await request(createApp())
      .post('/api/v1/outfits')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .send({ name: 'Weekend Look', clothingItemIds: [ITEM_1, ITEM_2] });

    expect(response.status).toBe(201);
    expect(response.body.outfit.id).toBe('outfit-1');
    expect(response.body.outfit.source).toBe('MANUAL');
    expect(response.body.outfit.items).toHaveLength(2);
  });

  it('should reject archived items', async () => {
    mockedClothingItemRepository.findClothingItemsByIdsForUser.mockResolvedValue([
      buildItem({ id: ITEM_1, isArchived: true }),
      buildItem({ id: ITEM_2 }),
    ]);

    const response = await request(createApp())
      .post('/api/v1/outfits')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .send({ clothingItemIds: [ITEM_1, ITEM_2] });

    expect(response.status).toBe(400);
    expect(mockedOutfitRepository.createOutfit).not.toHaveBeenCalled();
  });
});

describe('GET /api/v1/outfits', () => {
  it('should require authentication', async () => {
    const response = await request(createApp()).get('/api/v1/outfits');
    expect(response.status).toBe(401);
  });

  it('should return an empty list when the user has no outfits', async () => {
    mockedOutfitRepository.findOutfitRowsForUser.mockResolvedValue([]);

    const response = await request(createApp())
      .get('/api/v1/outfits')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`);

    expect(response.status).toBe(200);
    expect(response.body.outfits).toEqual([]);
  });

  it('should return the outfits with their items attached', async () => {
    mockedOutfitRepository.findOutfitRowsForUser.mockResolvedValue([
      buildOutfitRow({ name: 'Weekend Look' }),
    ]);
    mockedOutfitRepository.findClothingItemIdsByOutfitIds.mockResolvedValue({
      'outfit-1': [ITEM_1, ITEM_2],
    });
    mockedClothingItemRepository.findClothingItemsByIdsForUser.mockResolvedValue([
      buildItem({ id: ITEM_1 }),
      buildItem({ id: ITEM_2 }),
    ]);

    const response = await request(createApp())
      .get('/api/v1/outfits')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`);

    expect(response.status).toBe(200);
    expect(response.body.outfits).toHaveLength(1);
    expect(response.body.outfits[0].items).toHaveLength(2);
  });
});

describe('GET /api/v1/outfits/:id', () => {
  it('should reject a non-uuid id', async () => {
    const response = await request(createApp())
      .get('/api/v1/outfits/not-a-uuid')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`);

    expect(response.status).toBe(400);
  });

  it('should return 404 for an outfit belonging to another user', async () => {
    mockedOutfitRepository.findOutfitRowById.mockResolvedValue(buildOutfitRow({ userId: 'other-user' }));

    const response = await request(createApp())
      .get('/api/v1/outfits/11111111-1111-4111-8111-111111111111')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`);

    expect(response.status).toBe(404);
  });

  it('should return the outfit detail for its owner', async () => {
    mockedOutfitRepository.findOutfitRowById.mockResolvedValue(buildOutfitRow({ name: 'Weekend Look' }));
    mockedOutfitRepository.findClothingItemIdsByOutfitIds.mockResolvedValue({ 'outfit-1': [ITEM_1] });
    mockedClothingItemRepository.findClothingItemsByIdsForUser.mockResolvedValue([buildItem()]);

    const response = await request(createApp())
      .get('/api/v1/outfits/11111111-1111-4111-8111-111111111111')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`);

    expect(response.status).toBe(200);
    expect(response.body.outfit.name).toBe('Weekend Look');
    expect(response.body.outfit.items).toHaveLength(1);
  });
});

describe('DELETE /api/v1/outfits/:id', () => {
  it('should delete an owned outfit', async () => {
    mockedOutfitRepository.findOutfitRowById.mockResolvedValue(buildOutfitRow());

    const response = await request(createApp())
      .delete('/api/v1/outfits/11111111-1111-4111-8111-111111111111')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`);

    expect(response.status).toBe(204);
    expect(mockedOutfitRepository.deleteOutfit).toHaveBeenCalledWith(
      '11111111-1111-4111-8111-111111111111',
    );
  });

  it('should return 404 deleting another user outfit', async () => {
    mockedOutfitRepository.findOutfitRowById.mockResolvedValue(buildOutfitRow({ userId: 'other-user' }));

    const response = await request(createApp())
      .delete('/api/v1/outfits/11111111-1111-4111-8111-111111111111')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`);

    expect(response.status).toBe(404);
    expect(mockedOutfitRepository.deleteOutfit).not.toHaveBeenCalled();
  });
});
