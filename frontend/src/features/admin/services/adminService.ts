import { apiClient } from '@/services/api/apiClient';
import type {
  AdminCatalog,
  AdminUser,
  CatalogEntry,
  CatalogType,
  Color,
  CreateCatalogEntryPayload,
  CreateDollItemPayload,
  DollItem,
  FormalityLevel,
  Occasion,
  Subcategory,
  UpdateDollItemPayload,
} from '@/features/admin/types/admin.types';

export async function fetchUsers(): Promise<AdminUser[]> {
  const { data } = await apiClient.get<{ users: AdminUser[] }>('/admin/users');
  return data.users;
}

export async function activateUser(id: string): Promise<AdminUser> {
  const { data } = await apiClient.patch<{ user: AdminUser }>(`/admin/users/${id}/activate`);
  return data.user;
}

export async function deactivateUser(id: string): Promise<AdminUser> {
  const { data } = await apiClient.patch<{ user: AdminUser }>(`/admin/users/${id}/deactivate`);
  return data.user;
}

export async function fetchAdminCatalog(): Promise<AdminCatalog> {
  const { data } = await apiClient.get<AdminCatalog>('/admin/catalog');
  return data;
}

const SIMPLE_ENTRY_RESPONSE_KEY = {
  categories: 'category',
  materials: 'material',
  patterns: 'pattern',
  styles: 'style',
} as const;

async function createSimpleEntry(
  type: 'categories' | 'materials' | 'patterns' | 'styles',
  name: string,
): Promise<CatalogEntry> {
  const { data } = await apiClient.post<Record<string, CatalogEntry>>(`/admin/catalog/${type}`, { name });
  return data[SIMPLE_ENTRY_RESPONSE_KEY[type]];
}

async function createSubcategory(name: string, categoryId: string): Promise<Subcategory> {
  const { data } = await apiClient.post<{ subcategory: Subcategory }>('/admin/catalog/subcategories', {
    name,
    categoryId,
  });
  return data.subcategory;
}

async function createColor(name: string, hex: string): Promise<Color> {
  const { data } = await apiClient.post<{ color: Color }>('/admin/catalog/colors', { name, hex });
  return data.color;
}

async function createOccasion(name: string, formalityHint: FormalityLevel): Promise<Occasion> {
  const { data } = await apiClient.post<{ occasion: Occasion }>('/admin/catalog/occasions', {
    name,
    formalityHint,
  });
  return data.occasion;
}

export async function createCatalogEntry(
  payload: CreateCatalogEntryPayload,
): Promise<CatalogEntry | Subcategory | Color | Occasion> {
  switch (payload.type) {
    case 'categories':
    case 'materials':
    case 'patterns':
    case 'styles':
      return createSimpleEntry(payload.type, payload.name);
    case 'subcategories':
      return createSubcategory(payload.name, payload.categoryId);
    case 'colors':
      return createColor(payload.name, payload.hex);
    case 'occasions':
      return createOccasion(payload.name, payload.formalityHint);
  }
}

export async function activateCatalogEntry(type: CatalogType, id: string): Promise<void> {
  await apiClient.patch(`/admin/catalog/${type}/${id}/activate`);
}

export async function deactivateCatalogEntry(type: CatalogType, id: string): Promise<void> {
  await apiClient.patch(`/admin/catalog/${type}/${id}/deactivate`);
}

export async function fetchDollItems(): Promise<DollItem[]> {
  const { data } = await apiClient.get<{ dollItems: DollItem[] }>('/admin/doll-items');
  return data.dollItems;
}

export async function createDollItem(payload: CreateDollItemPayload): Promise<DollItem> {
  const { data } = await apiClient.post<{ dollItem: DollItem }>('/admin/doll-items', payload);
  return data.dollItem;
}

export async function updateDollItem(id: string, payload: UpdateDollItemPayload): Promise<DollItem> {
  const { data } = await apiClient.patch<{ dollItem: DollItem }>(`/admin/doll-items/${id}`, payload);
  return data.dollItem;
}

export async function activateDollItem(id: string): Promise<void> {
  await apiClient.patch(`/admin/doll-items/${id}/activate`);
}

export async function deactivateDollItem(id: string): Promise<void> {
  await apiClient.patch(`/admin/doll-items/${id}/deactivate`);
}
