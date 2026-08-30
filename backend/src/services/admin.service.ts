import * as catalogRepository from '@/repositories/catalog.repository';
import * as dollItemRepository from '@/repositories/dollItem.repository';
import * as userRepository from '@/repositories/user.repository';
import { Catalog, CatalogEntry, Color, Occasion, Subcategory } from '@/types/catalog.types';
import { DollItem } from '@/types/doll.types';
import { PublicUser, toPublicUser } from '@/types/user.types';
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from '@/utils/AppError';
import {
  CATALOG_TYPES,
  CatalogType,
  CreateColorInput,
  CreateDollItemInput,
  CreateOccasionInput,
  CreateSubcategoryInput,
  UpdateDollItemInput,
} from '@/validators/admin.validator';

export async function listUsers(): Promise<PublicUser[]> {
  const users = await userRepository.findAllUsers();
  return users.map(toPublicUser);
}

async function getUserOrThrow(id: string): Promise<PublicUser> {
  const user = await userRepository.findUserById(id);
  if (!user) {
    throw new NotFoundError('User not found.');
  }
  return toPublicUser(user);
}

export async function activateUser(id: string): Promise<PublicUser> {
  await getUserOrThrow(id);
  const updated = await userRepository.updateStatus(id, 'ACTIVE');
  return toPublicUser(updated);
}

export async function deactivateUser(requestingAdminId: string, id: string): Promise<PublicUser> {
  if (requestingAdminId === id) {
    throw new ForbiddenError('You cannot deactivate your own account.');
  }
  await getUserOrThrow(id);
  const updated = await userRepository.updateStatus(id, 'INACTIVE');
  return toPublicUser(updated);
}

export async function listFullCatalog(): Promise<Catalog> {
  const [categories, subcategories, materials, patterns, colors, styles, occasions] = await Promise.all([
    catalogRepository.findAllSimpleEntries('categories'),
    catalogRepository.findAllSubcategories(),
    catalogRepository.findAllSimpleEntries('materials'),
    catalogRepository.findAllSimpleEntries('patterns'),
    catalogRepository.findAllColors(),
    catalogRepository.findAllSimpleEntries('styles'),
    catalogRepository.findAllOccasions(),
  ]);

  return { categories, subcategories, materials, patterns, colors, styles, occasions };
}

async function createSimpleCatalogEntry(
  table: catalogRepository.SimpleCatalogTable,
  name: string,
): Promise<CatalogEntry> {
  const existing = await catalogRepository.findSimpleEntryByName(table, name);
  if (existing) {
    throw new ConflictError('An entry with this name already exists.');
  }
  return catalogRepository.createSimpleEntry(table, name);
}

export async function createCategory(name: string): Promise<CatalogEntry> {
  return createSimpleCatalogEntry('categories', name);
}

export async function createMaterial(name: string): Promise<CatalogEntry> {
  return createSimpleCatalogEntry('materials', name);
}

export async function createPattern(name: string): Promise<CatalogEntry> {
  return createSimpleCatalogEntry('patterns', name);
}

export async function createStyle(name: string): Promise<CatalogEntry> {
  return createSimpleCatalogEntry('styles', name);
}

export async function createSubcategory(input: CreateSubcategoryInput): Promise<Subcategory> {
  const categories = await catalogRepository.findAllSimpleEntries('categories');
  if (!categories.some((category) => category.id === input.categoryId)) {
    throw new ValidationError('Select a valid category.');
  }

  const existing = await catalogRepository.findSubcategoryByCategoryAndName(input.categoryId, input.name);
  if (existing) {
    throw new ConflictError('A subcategory with this name already exists under that category.');
  }
  return catalogRepository.createSubcategory(input);
}

export async function createColor(input: CreateColorInput): Promise<Color> {
  const existing = await catalogRepository.findColorByName(input.name);
  if (existing) {
    throw new ConflictError('An entry with this name already exists.');
  }
  return catalogRepository.createColor(input);
}

export async function createOccasion(input: CreateOccasionInput): Promise<Occasion> {
  const existing = await catalogRepository.findOccasionByName(input.name);
  if (existing) {
    throw new ConflictError('An entry with this name already exists.');
  }
  return catalogRepository.createOccasion(input);
}

async function findEntriesForType(type: CatalogType): Promise<{ id: string }[]> {
  switch (type) {
    case 'subcategories':
      return catalogRepository.findAllSubcategories();
    case 'colors':
      return catalogRepository.findAllColors();
    case 'occasions':
      return catalogRepository.findAllOccasions();
    default:
      return catalogRepository.findAllSimpleEntries(type);
  }
}

export async function setCatalogEntryActive(
  type: CatalogType,
  id: string,
  isActive: boolean,
): Promise<void> {
  const entries = await findEntriesForType(type);
  if (!entries.some((entry) => entry.id === id)) {
    throw new NotFoundError('Catalog entry not found.');
  }
  return catalogRepository.setCatalogEntryActive(type, id, isActive);
}

export async function listDollItems(): Promise<DollItem[]> {
  return dollItemRepository.findAllDollItems();
}

export async function createDollItem(input: CreateDollItemInput): Promise<DollItem> {
  return dollItemRepository.createDollItem(input);
}

async function getDollItemOrThrow(id: string): Promise<DollItem> {
  const dollItem = await dollItemRepository.findDollItemById(id);
  if (!dollItem) {
    throw new NotFoundError('Doll item not found.');
  }
  return dollItem;
}

export async function updateDollItem(id: string, patch: UpdateDollItemInput): Promise<DollItem> {
  await getDollItemOrThrow(id);
  return dollItemRepository.updateDollItem(id, patch);
}

export async function setDollItemActive(id: string, isActive: boolean): Promise<void> {
  await getDollItemOrThrow(id);
  return dollItemRepository.setDollItemActive(id, isActive);
}

export function assertKnownCatalogType(type: string): asserts type is CatalogType {
  if (!(CATALOG_TYPES as readonly string[]).includes(type)) {
    throw new ValidationError('Unknown catalog type.');
  }
}
