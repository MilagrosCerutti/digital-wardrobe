import * as dollService from '@/services/doll.service';
import * as dollRepository from '@/repositories/doll.repository';
import * as dollItemRepository from '@/repositories/dollItem.repository';
import * as dollEquipmentRepository from '@/repositories/dollEquipment.repository';
import { Doll, DollItem } from '@/types/doll.types';

jest.mock('@/repositories/doll.repository');
jest.mock('@/repositories/dollItem.repository');
jest.mock('@/repositories/dollEquipment.repository');

const mockedDollRepository = dollRepository as jest.Mocked<typeof dollRepository>;
const mockedDollItemRepository = dollItemRepository as jest.Mocked<typeof dollItemRepository>;
const mockedDollEquipmentRepository = dollEquipmentRepository as jest.Mocked<
  typeof dollEquipmentRepository
>;

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

describe('doll.service.getDollProfile', () => {
  it('should throw a NotFoundError when the user has no doll', async () => {
    mockedDollRepository.findDollByUserId.mockResolvedValue(null);

    await expect(dollService.getDollProfile('user-1')).rejects.toMatchObject({ statusCode: 404 });
  });

  it('should return the doll with its currently equipped items', async () => {
    mockedDollRepository.findDollByUserId.mockResolvedValue(buildDoll());
    mockedDollEquipmentRepository.findEquippedItemIds.mockResolvedValue(['item-1']);
    mockedDollItemRepository.findDollItemsByIds.mockResolvedValue([buildDollItem()]);

    const profile = await dollService.getDollProfile('user-1');

    expect(profile.doll.id).toBe('doll-1');
    expect(profile.equippedItems).toHaveLength(1);
    expect(profile.equippedItems[0]?.id).toBe('item-1');
  });
});

describe('doll.service.updateAppearance', () => {
  it('should update the appearance of the requesting user doll', async () => {
    mockedDollRepository.findDollByUserId.mockResolvedValue(buildDoll());
    mockedDollRepository.updateDollAppearance.mockResolvedValue(buildDoll({ hairColor: 'BLACK' }));

    const doll = await dollService.updateAppearance('user-1', { hairColor: 'BLACK' });

    expect(doll.hairColor).toBe('BLACK');
    expect(mockedDollRepository.updateDollAppearance).toHaveBeenCalledWith('doll-1', {
      hairColor: 'BLACK',
    });
  });
});

describe('doll.service.equipItem', () => {
  it('should reject equipping an inactive doll item', async () => {
    mockedDollRepository.findDollByUserId.mockResolvedValue(buildDoll());
    mockedDollItemRepository.findDollItemById.mockResolvedValue(buildDollItem({ isActive: false }));

    await expect(dollService.equipItem('user-1', 'item-1')).rejects.toMatchObject({
      statusCode: 400,
    });
    expect(mockedDollEquipmentRepository.insertEquipment).not.toHaveBeenCalled();
  });

  it('should reject equipping a doll item that does not exist', async () => {
    mockedDollRepository.findDollByUserId.mockResolvedValue(buildDoll());
    mockedDollItemRepository.findDollItemById.mockResolvedValue(null);

    await expect(dollService.equipItem('user-1', 'missing-item')).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it('should replace an already-equipped item in the same category', async () => {
    const previousTop = buildDollItem({ id: 'item-old-top', category: 'TOP' });
    const newTop = buildDollItem({ id: 'item-new-top', category: 'TOP' });

    mockedDollRepository.findDollByUserId.mockResolvedValue(buildDoll());
    mockedDollItemRepository.findDollItemById.mockResolvedValue(newTop);
    mockedDollEquipmentRepository.findEquippedItemIds.mockResolvedValue([previousTop.id]);
    mockedDollItemRepository.findDollItemsByIds.mockResolvedValue([previousTop]);

    const profile = await dollService.equipItem('user-1', newTop.id);

    expect(mockedDollEquipmentRepository.deleteEquipmentByItemIds).toHaveBeenCalledWith('doll-1', [
      previousTop.id,
    ]);
    expect(mockedDollEquipmentRepository.insertEquipment).toHaveBeenCalledWith('doll-1', newTop.id);
    expect(profile.equippedItems.map((item) => item.id)).toEqual([newTop.id]);

    // The response is built from data already fetched during the swap, rather
    // than re-querying the whole profile afterwards.
    expect(mockedDollRepository.findDollByUserId).toHaveBeenCalledTimes(1);
    expect(mockedDollEquipmentRepository.findEquippedItemIds).toHaveBeenCalledTimes(1);
    expect(mockedDollItemRepository.findDollItemsByIds).toHaveBeenCalledTimes(1);
  });

  it('should not touch items in a different category', async () => {
    const equippedBottom = buildDollItem({ id: 'item-bottom', category: 'BOTTOM' });
    const newTop = buildDollItem({ id: 'item-top', category: 'TOP' });

    mockedDollRepository.findDollByUserId.mockResolvedValue(buildDoll());
    mockedDollItemRepository.findDollItemById.mockResolvedValue(newTop);
    mockedDollEquipmentRepository.findEquippedItemIds.mockResolvedValue([equippedBottom.id]);
    mockedDollItemRepository.findDollItemsByIds.mockResolvedValue([equippedBottom]);

    await dollService.equipItem('user-1', newTop.id);

    expect(mockedDollEquipmentRepository.deleteEquipmentByItemIds).not.toHaveBeenCalled();
    expect(mockedDollEquipmentRepository.insertEquipment).toHaveBeenCalledWith('doll-1', newTop.id);
  });

  it('should replace both an equipped top and bottom when equipping a dress', async () => {
    const equippedTop = buildDollItem({ id: 'item-top', category: 'TOP' });
    const equippedBottom = buildDollItem({ id: 'item-bottom', category: 'BOTTOM' });
    const dress = buildDollItem({ id: 'item-dress', category: 'DRESS' });

    mockedDollRepository.findDollByUserId.mockResolvedValue(buildDoll());
    mockedDollItemRepository.findDollItemById.mockResolvedValue(dress);
    mockedDollEquipmentRepository.findEquippedItemIds.mockResolvedValue([equippedTop.id, equippedBottom.id]);
    mockedDollItemRepository.findDollItemsByIds.mockResolvedValue([equippedTop, equippedBottom]);

    const profile = await dollService.equipItem('user-1', dress.id);

    expect(mockedDollEquipmentRepository.deleteEquipmentByItemIds).toHaveBeenCalledWith(
      'doll-1',
      expect.arrayContaining([equippedTop.id, equippedBottom.id]),
    );
    expect(profile.equippedItems.map((item) => item.id)).toEqual([dress.id]);
  });

  it('should replace an equipped dress when equipping a top', async () => {
    const equippedDress = buildDollItem({ id: 'item-dress', category: 'DRESS' });
    const newTop = buildDollItem({ id: 'item-top', category: 'TOP' });

    mockedDollRepository.findDollByUserId.mockResolvedValue(buildDoll());
    mockedDollItemRepository.findDollItemById.mockResolvedValue(newTop);
    mockedDollEquipmentRepository.findEquippedItemIds.mockResolvedValue([equippedDress.id]);
    mockedDollItemRepository.findDollItemsByIds.mockResolvedValue([equippedDress]);

    const profile = await dollService.equipItem('user-1', newTop.id);

    expect(mockedDollEquipmentRepository.deleteEquipmentByItemIds).toHaveBeenCalledWith('doll-1', [
      equippedDress.id,
    ]);
    expect(profile.equippedItems.map((item) => item.id)).toEqual([newTop.id]);
  });

  it('should not touch equipped shoes or accessories when equipping a dress', async () => {
    const equippedShoes = buildDollItem({ id: 'item-shoes', category: 'SHOES' });
    const dress = buildDollItem({ id: 'item-dress', category: 'DRESS' });

    mockedDollRepository.findDollByUserId.mockResolvedValue(buildDoll());
    mockedDollItemRepository.findDollItemById.mockResolvedValue(dress);
    mockedDollEquipmentRepository.findEquippedItemIds.mockResolvedValue([equippedShoes.id]);
    mockedDollItemRepository.findDollItemsByIds.mockResolvedValue([equippedShoes]);

    const profile = await dollService.equipItem('user-1', dress.id);

    expect(mockedDollEquipmentRepository.deleteEquipmentByItemIds).not.toHaveBeenCalled();
    expect(profile.equippedItems.map((item) => item.id).sort()).toEqual(
      [equippedShoes.id, dress.id].sort(),
    );
  });
});

describe('doll.service.unequipItem', () => {
  it('should remove the equipment row for the requesting user doll', async () => {
    mockedDollRepository.findDollByUserId.mockResolvedValue(buildDoll());
    mockedDollEquipmentRepository.findEquippedItemIds.mockResolvedValue([]);
    mockedDollItemRepository.findDollItemsByIds.mockResolvedValue([]);

    await dollService.unequipItem('user-1', 'item-1');

    expect(mockedDollEquipmentRepository.deleteEquipment).toHaveBeenCalledWith('doll-1', 'item-1');
    expect(mockedDollRepository.findDollByUserId).toHaveBeenCalledTimes(1);
  });

  it('should exclude the removed item from the returned equipped items', async () => {
    const removed = buildDollItem({ id: 'item-removed' });
    const kept = buildDollItem({ id: 'item-kept', category: 'BOTTOM' });
    mockedDollRepository.findDollByUserId.mockResolvedValue(buildDoll());
    mockedDollEquipmentRepository.findEquippedItemIds.mockResolvedValue([removed.id, kept.id]);
    mockedDollItemRepository.findDollItemsByIds.mockResolvedValue([removed, kept]);

    const profile = await dollService.unequipItem('user-1', removed.id);

    expect(profile.equippedItems.map((item) => item.id)).toEqual([kept.id]);
  });
});
