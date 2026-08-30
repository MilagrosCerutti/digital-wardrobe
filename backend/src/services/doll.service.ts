import * as dollRepository from '@/repositories/doll.repository';
import * as dollItemRepository from '@/repositories/dollItem.repository';
import * as dollEquipmentRepository from '@/repositories/dollEquipment.repository';
import { Doll, DollItem, DollProfile } from '@/types/doll.types';
import { UpdateDollAppearanceInput } from '@/validators/doll.validator';
import { NotFoundError, ValidationError } from '@/utils/AppError';

export async function createDefaultDollForUser(userId: string): Promise<Doll> {
  return dollRepository.createDollForUser(userId);
}

async function getDollOrThrow(userId: string): Promise<Doll> {
  const doll = await dollRepository.findDollByUserId(userId);
  if (!doll) {
    throw new NotFoundError('This user does not have a doll yet.');
  }
  return doll;
}

export async function getDollProfile(userId: string): Promise<DollProfile> {
  const doll = await getDollOrThrow(userId);
  const equippedItemIds = await dollEquipmentRepository.findEquippedItemIds(doll.id);
  const equippedItems = await dollItemRepository.findDollItemsByIds(equippedItemIds);

  return { doll, equippedItems };
}

export async function listActiveDollItems(): Promise<DollItem[]> {
  return dollItemRepository.findActiveDollItems();
}

export async function updateAppearance(
  userId: string,
  input: UpdateDollAppearanceInput,
): Promise<Doll> {
  const doll = await getDollOrThrow(userId);
  return dollRepository.updateDollAppearance(doll.id, input);
}

/**
 * A DollItem's category is one-per-slot, with one cross-category exception: a
 * DRESS is a one-piece outfit, so equipping one replaces any separate TOP and
 * BOTTOM (and vice versa), rather than layering a dress over other clothing.
 */
function categoriesReplacedBy(category: DollItem['category']): DollItem['category'][] {
  if (category === 'DRESS') return ['DRESS', 'TOP', 'BOTTOM'];
  if (category === 'TOP' || category === 'BOTTOM') return [category, 'DRESS'];
  return [category];
}

export async function equipItem(userId: string, dollItemId: string): Promise<DollProfile> {
  const doll = await getDollOrThrow(userId);
  const dollItem = await dollItemRepository.findDollItemById(dollItemId);

  if (!dollItem || !dollItem.isActive) {
    throw new ValidationError('This doll item is not available.');
  }

  const equippedItemIds = await dollEquipmentRepository.findEquippedItemIds(doll.id);
  const equippedItems = await dollItemRepository.findDollItemsByIds(equippedItemIds);
  const categoriesToReplace = categoriesReplacedBy(dollItem.category);
  const replacedItems = equippedItems.filter((item) => categoriesToReplace.includes(item.category));

  if (replacedItems.length > 0) {
    await dollEquipmentRepository.deleteEquipmentByItemIds(
      doll.id,
      replacedItems.map((item) => item.id),
    );
  }
  await dollEquipmentRepository.insertEquipment(doll.id, dollItemId);

  const remainingItems = equippedItems.filter((item) => !categoriesToReplace.includes(item.category));
  return { doll, equippedItems: [...remainingItems, dollItem] };
}

export async function unequipItem(userId: string, dollItemId: string): Promise<DollProfile> {
  const doll = await getDollOrThrow(userId);
  const equippedItemIds = await dollEquipmentRepository.findEquippedItemIds(doll.id);
  const equippedItems = await dollItemRepository.findDollItemsByIds(equippedItemIds);

  await dollEquipmentRepository.deleteEquipment(doll.id, dollItemId);

  return { doll, equippedItems: equippedItems.filter((item) => item.id !== dollItemId) };
}
