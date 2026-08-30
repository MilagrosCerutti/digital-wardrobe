import request from 'supertest';
import { createApp } from '@/app';
import * as catalogRepository from '@/repositories/catalog.repository';
import * as clothingItemRepository from '@/repositories/clothingItem.repository';
import { ClothingItem } from '@/types/clothingItem.types';
import { Occasion } from '@/types/catalog.types';
import { signAccessToken } from '@/utils/jwt';

jest.mock('@/repositories/catalog.repository');
jest.mock('@/repositories/clothingItem.repository');

const mockedCatalogRepository = catalogRepository as jest.Mocked<typeof catalogRepository>;
const mockedClothingItemRepository = clothingItemRepository as jest.Mocked<typeof clothingItemRepository>;
const AUTH_TOKEN = signAccessToken({ sub: 'user-1', role: 'USER' });
const OCCASION_ID = '11111111-1111-4111-8111-111111111111';

function buildCatalogEntry(id: string, name: string) {
  return { id, name, isActive: true, createdAt: '', updatedAt: '' };
}

function buildItem(overrides: Partial<ClothingItem> = {}): ClothingItem {
  return {
    id: 'top-1',
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
  return { ...buildCatalogEntry(OCCASION_ID, 'Work'), formalityHint: 'CASUAL', ...overrides };
}

// A shared color/style, added to every item in a pool that should score well
// above the compatibility floor (matching formality alone isn't enough).
const SHARED_COLOR = { ...buildCatalogEntry('color-1', 'Beige'), hex: '#D9B7A3' };
const SHARED_STYLE = buildCatalogEntry('style-1', 'Casual');
function compatible(overrides: Partial<ClothingItem> = {}): ClothingItem {
  return buildItem({ colors: [SHARED_COLOR], styles: [SHARED_STYLE], ...overrides });
}

afterEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/v1/inspire-me/generate', () => {
  it('should require authentication', async () => {
    const response = await request(createApp())
      .post('/api/v1/inspire-me/generate')
      .send({ mood: 'COZY', occasionId: OCCASION_ID });

    expect(response.status).toBe(401);
  });

  it('should reject an invalid mood', async () => {
    const response = await request(createApp())
      .post('/api/v1/inspire-me/generate')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .send({ mood: 'NOT_A_MOOD', occasionId: OCCASION_ID });

    expect(response.status).toBe(400);
  });

  it('should reject a non-uuid occasionId', async () => {
    const response = await request(createApp())
      .post('/api/v1/inspire-me/generate')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .send({ mood: 'COZY', occasionId: 'not-a-uuid' });

    expect(response.status).toBe(400);
  });

  it('should return 400 for an occasion that does not exist', async () => {
    mockedCatalogRepository.findOccasionById.mockResolvedValue(null);

    const response = await request(createApp())
      .post('/api/v1/inspire-me/generate')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .send({ mood: 'COZY', occasionId: OCCASION_ID });

    expect(response.status).toBe(400);
  });

  it('should return an empty result when no valid outfit can be built', async () => {
    mockedCatalogRepository.findOccasionById.mockResolvedValue(buildOccasion());
    mockedClothingItemRepository.findClothingItemsForUser.mockResolvedValue([buildItem()]);

    const response = await request(createApp())
      .post('/api/v1/inspire-me/generate')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .send({ mood: 'COZY', occasionId: OCCASION_ID });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ styleCard: null, recommendations: [], emptyReason: 'NOT_ENOUGH_PIECES' });
  });

  it('should return ranked recommendations and a style card for a valid closet', async () => {
    mockedCatalogRepository.findOccasionById.mockResolvedValue(buildOccasion());
    mockedClothingItemRepository.findClothingItemsForUser.mockResolvedValue([
      compatible({ id: 'top-1', category: buildCatalogEntry('cat-1', 'Tops') }),
      compatible({ id: 'bottom-1', category: buildCatalogEntry('cat-2', 'Bottoms') }),
      compatible({ id: 'shoes-1', category: buildCatalogEntry('cat-3', 'Shoes') }),
      compatible({ id: 'acc-1', category: buildCatalogEntry('cat-4', 'Accessories') }),
    ]);

    const response = await request(createApp())
      .post('/api/v1/inspire-me/generate')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .send({ mood: 'COZY', occasionId: OCCASION_ID });

    expect(response.status).toBe(200);
    expect(response.body.recommendations).toHaveLength(1);
    expect(response.body.recommendations[0].items).toHaveLength(4);
    expect(response.body.styleCard.outfitCount).toBe(1);
  });

  it('should accept Advanced Mode fields (formalityLevel, requiredItemId, excludedItemIds, useFavorites)', async () => {
    const topId = '33333333-1111-4111-8111-111111111111';
    mockedCatalogRepository.findOccasionById.mockResolvedValue(buildOccasion());
    mockedClothingItemRepository.findClothingItemsForUser.mockResolvedValue([
      compatible({ id: topId, category: buildCatalogEntry('cat-1', 'Tops') }),
      compatible({ id: 'bottom-1', category: buildCatalogEntry('cat-2', 'Bottoms') }),
      compatible({ id: 'shoes-1', category: buildCatalogEntry('cat-3', 'Shoes') }),
      compatible({ id: 'acc-1', category: buildCatalogEntry('cat-4', 'Accessories') }),
    ]);

    const response = await request(createApp())
      .post('/api/v1/inspire-me/generate')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .send({
        mood: 'BOLD',
        occasionId: OCCASION_ID,
        formalityLevel: 'CASUAL',
        requiredItemId: topId,
        excludedItemIds: [],
        useFavorites: true,
      });

    expect(response.status).toBe(200);
    expect(response.body.recommendations).toHaveLength(1);
  });
});
