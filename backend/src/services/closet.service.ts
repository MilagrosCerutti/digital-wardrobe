import * as clothingItemRepository from '@/repositories/clothingItem.repository';
import * as catalogRepository from '@/repositories/catalog.repository';
import * as outfitRepository from '@/repositories/outfit.repository';
import { uploadClothingImage, deleteClothingImage } from '@/utils/clothingImageStorage';
import {
  ClosetFilters,
  ClothingItem,
  CreateClothingItemInput,
  UpdateClothingItemInput,
} from '@/types/clothingItem.types';
import { NotFoundError, ValidationError } from '@/utils/AppError';

export async function listMyClothingItems(
  userId: string,
  filters: ClosetFilters,
): Promise<ClothingItem[]> {
  return clothingItemRepository.findClothingItemsForUser(userId, filters);
}

async function getOwnedClothingItemOrThrow(userId: string, id: string): Promise<ClothingItem> {
  const item = await clothingItemRepository.findClothingItemById(id);
  if (!item || item.userId !== userId) {
    throw new NotFoundError('Clothing item not found.');
  }
  return item;
}

export async function getMyClothingItemDetail(userId: string, id: string): Promise<ClothingItem> {
  return getOwnedClothingItemOrThrow(userId, id);
}

async function assertCatalogSelectionsAreValid(input: {
  categoryId: string;
  subcategoryId: string;
  materialId: string;
  patternId: string;
  colorIds: string[];
  styleIds: string[];
}): Promise<void> {
  const catalog = await catalogRepository.findFullCatalog();
  const activeIds = (entries: { id: string }[]) => new Set(entries.map((entry) => entry.id));

  const categoryIds = activeIds(catalog.categories);
  const subcategoryIds = activeIds(catalog.subcategories);
  const materialIds = activeIds(catalog.materials);
  const patternIds = activeIds(catalog.patterns);
  const colorIds = activeIds(catalog.colors);
  const styleIds = activeIds(catalog.styles);

  if (!categoryIds.has(input.categoryId)) {
    throw new ValidationError('Select a valid category.');
  }
  if (!subcategoryIds.has(input.subcategoryId)) {
    throw new ValidationError('Select a valid subcategory.');
  }
  if (!materialIds.has(input.materialId)) {
    throw new ValidationError('Select a valid material.');
  }
  if (!patternIds.has(input.patternId)) {
    throw new ValidationError('Select a valid pattern.');
  }
  if (!input.colorIds.every((id) => colorIds.has(id))) {
    throw new ValidationError('Select valid colors.');
  }
  if (!input.styleIds.every((id) => styleIds.has(id))) {
    throw new ValidationError('Select valid styles.');
  }
}

export async function uploadClothingItemImage(
  userId: string,
  file: { buffer: Buffer; mimetype: string },
): Promise<string> {
  return uploadClothingImage(userId, file);
}

export async function createClothingItem(
  userId: string,
  input: CreateClothingItemInput,
): Promise<ClothingItem> {
  await assertCatalogSelectionsAreValid(input);
  return clothingItemRepository.createClothingItem(userId, input);
}

export async function updateMyClothingItem(
  userId: string,
  id: string,
  patch: UpdateClothingItemInput,
): Promise<ClothingItem> {
  const existing = await getOwnedClothingItemOrThrow(userId, id);

  await assertCatalogSelectionsAreValid({
    categoryId: patch.categoryId ?? existing.category.id,
    subcategoryId: patch.subcategoryId ?? existing.subcategory.id,
    materialId: patch.materialId ?? existing.material.id,
    patternId: patch.patternId ?? existing.pattern.id,
    colorIds: patch.colorIds ?? existing.colors.map((color) => color.id),
    styleIds: patch.styleIds ?? existing.styles.map((style) => style.id),
  });

  const updated = await clothingItemRepository.updateClothingItem(id, patch);

  if (patch.imageUrl && patch.imageUrl !== existing.imageUrl) {
    await deleteClothingImage(existing.imageUrl);
  }

  return updated;
}

export async function deleteMyClothingItem(userId: string, id: string): Promise<void> {
  const existing = await getOwnedClothingItemOrThrow(userId, id);

  // A hard delete that also silently dropped this item out of every saved
  // look it's part of would corrupt those looks with no way to undo it.
  // Archiving already exists for "get it out of my active closet" -- this
  // is for when the piece is truly gone, and looks that used it need to be
  // dealt with (or the piece un-used from them) first.
  if (await outfitRepository.isClothingItemUsedInAnyOutfit(id)) {
    throw new ValidationError(
      'This item is used in one or more saved looks. Remove it from those looks first, or archive it instead.',
    );
  }

  await clothingItemRepository.deleteClothingItem(id);
  await deleteClothingImage(existing.imageUrl);
}

export async function archiveMyClothingItem(userId: string, id: string): Promise<ClothingItem> {
  await getOwnedClothingItemOrThrow(userId, id);
  return clothingItemRepository.setArchived(id, true);
}

export async function restoreMyClothingItem(userId: string, id: string): Promise<ClothingItem> {
  await getOwnedClothingItemOrThrow(userId, id);
  return clothingItemRepository.setArchived(id, false);
}

export async function favoriteMyClothingItem(userId: string, id: string): Promise<ClothingItem> {
  await getOwnedClothingItemOrThrow(userId, id);
  return clothingItemRepository.setFavorite(id, true);
}

export async function unfavoriteMyClothingItem(userId: string, id: string): Promise<ClothingItem> {
  await getOwnedClothingItemOrThrow(userId, id);
  return clothingItemRepository.setFavorite(id, false);
}
