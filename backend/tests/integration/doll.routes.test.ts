import request from 'supertest';
import { createApp } from '@/app';
import * as dollRepository from '@/repositories/doll.repository';
import * as dollItemRepository from '@/repositories/dollItem.repository';
import * as dollEquipmentRepository from '@/repositories/dollEquipment.repository';
import { Doll, DollItem } from '@/types/doll.types';
import { signAccessToken } from '@/utils/jwt';

jest.mock('@/repositories/doll.repository');
jest.mock('@/repositories/dollItem.repository');
jest.mock('@/repositories/dollEquipment.repository');

const mockedDollRepository = dollRepository as jest.Mocked<typeof dollRepository>;
const mockedDollItemRepository = dollItemRepository as jest.Mocked<typeof dollItemRepository>;
const mockedDollEquipmentRepository = dollEquipmentRepository as jest.Mocked<
  typeof dollEquipmentRepository
>;

const AUTH_TOKEN = signAccessToken({ sub: 'user-1', role: 'USER' });

function buildDoll(overrides: Partial<Doll> = {}): Doll {
  return {
    id: 'doll-1',
    userId: 'user-1',
    bodyType: 'AVERAGE',
    skinTone: 'MEDIUM',
    hairStyle: 'LONG',
    hairColor: 'BROWN',
    eyeColor: 'BROWN',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function buildDollItem(overrides: Partial<DollItem> = {}): DollItem {
  return {
    id: 'item-1',
    name: 'Cropped Cardigan',
    category: 'TOP',
    layer: 20,
    assetUrl: 'top-cardigan',
    color: '#F2A7C3',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/v1/doll/items', () => {
  it('should require authentication', async () => {
    const response = await request(createApp()).get('/api/v1/doll/items');
    expect(response.status).toBe(401);
  });

  it('should return the active doll item catalog', async () => {
    mockedDollItemRepository.findActiveDollItems.mockResolvedValue([buildDollItem()]);

    const response = await request(createApp())
      .get('/api/v1/doll/items')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`);

    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(1);
  });
});

describe('GET /api/v1/doll', () => {
  it('should return the current user doll profile', async () => {
    mockedDollRepository.findDollByUserId.mockResolvedValue(buildDoll());
    mockedDollEquipmentRepository.findEquippedItemIds.mockResolvedValue([]);
    mockedDollItemRepository.findDollItemsByIds.mockResolvedValue([]);

    const response = await request(createApp())
      .get('/api/v1/doll')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`);

    expect(response.status).toBe(200);
    expect(response.body.doll.id).toBe('doll-1');
    expect(response.body.equippedItems).toEqual([]);
  });

  it('should return 404 when the user has no doll', async () => {
    mockedDollRepository.findDollByUserId.mockResolvedValue(null);

    const response = await request(createApp())
      .get('/api/v1/doll')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`);

    expect(response.status).toBe(404);
  });
});

describe('PATCH /api/v1/doll', () => {
  it('should reject an invalid appearance value', async () => {
    const response = await request(createApp())
      .patch('/api/v1/doll')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .send({ hairColor: 'INVISIBLE' });

    expect(response.status).toBe(400);
    expect(mockedDollRepository.updateDollAppearance).not.toHaveBeenCalled();
  });

  it('should reject an empty body', async () => {
    const response = await request(createApp())
      .patch('/api/v1/doll')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .send({});

    expect(response.status).toBe(400);
  });

  it('should update the appearance for a valid value', async () => {
    mockedDollRepository.findDollByUserId.mockResolvedValue(buildDoll());
    mockedDollRepository.updateDollAppearance.mockResolvedValue(buildDoll({ hairColor: 'BLACK' }));

    const response = await request(createApp())
      .patch('/api/v1/doll')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .send({ hairColor: 'BLACK' });

    expect(response.status).toBe(200);
    expect(response.body.doll.hairColor).toBe('BLACK');
  });
});

describe('POST /api/v1/doll/equipment', () => {
  it('should reject a non-uuid dollItemId', async () => {
    const response = await request(createApp())
      .post('/api/v1/doll/equipment')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .send({ dollItemId: 'not-a-uuid' });

    expect(response.status).toBe(400);
  });

  it('should reject equipping an inactive doll item', async () => {
    const itemId = '11111111-1111-4111-8111-111111111111';
    mockedDollRepository.findDollByUserId.mockResolvedValue(buildDoll());
    mockedDollItemRepository.findDollItemById.mockResolvedValue(
      buildDollItem({ id: itemId, isActive: false }),
    );

    const response = await request(createApp())
      .post('/api/v1/doll/equipment')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .send({ dollItemId: itemId });

    expect(response.status).toBe(400);
  });

  it('should equip an active doll item', async () => {
    const itemId = '11111111-1111-4111-8111-111111111111';
    const item = buildDollItem({ id: itemId });
    mockedDollRepository.findDollByUserId.mockResolvedValue(buildDoll());
    mockedDollItemRepository.findDollItemById.mockResolvedValue(item);
    mockedDollEquipmentRepository.findEquippedItemIds.mockResolvedValue([itemId]);
    mockedDollItemRepository.findDollItemsByIds.mockResolvedValue([item]);

    const response = await request(createApp())
      .post('/api/v1/doll/equipment')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .send({ dollItemId: itemId });

    expect(response.status).toBe(200);
    expect(response.body.equippedItems[0].id).toBe(itemId);
  });
});

describe('DELETE /api/v1/doll/equipment/:dollItemId', () => {
  it('should unequip a doll item', async () => {
    mockedDollRepository.findDollByUserId.mockResolvedValue(buildDoll());
    mockedDollEquipmentRepository.findEquippedItemIds.mockResolvedValue([]);
    mockedDollItemRepository.findDollItemsByIds.mockResolvedValue([]);

    const response = await request(createApp())
      .delete('/api/v1/doll/equipment/11111111-1111-4111-8111-111111111111')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`);

    expect(response.status).toBe(200);
    expect(mockedDollEquipmentRepository.deleteEquipment).toHaveBeenCalledWith(
      'doll-1',
      '11111111-1111-4111-8111-111111111111',
    );
  });
});
