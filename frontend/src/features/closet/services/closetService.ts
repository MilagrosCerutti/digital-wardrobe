import { apiClient } from '@/services/api/apiClient';
import type {
  Catalog,
  ClosetFilters,
  ClothingItem,
  CreateClothingItemPayload,
  UpdateClothingItemPayload,
} from '@/features/closet/types/closet.types';

export async function fetchCatalog(): Promise<Catalog> {
  const { data } = await apiClient.get<Catalog>('/catalog');
  return data;
}

export async function fetchClothingItems(filters: ClosetFilters): Promise<ClothingItem[]> {
  const params: Record<string, string> = {};
  if (filters.categoryId) params.categoryId = filters.categoryId;
  if (filters.subcategoryId) params.subcategoryId = filters.subcategoryId;
  if (filters.materialId) params.materialId = filters.materialId;
  if (filters.patternId) params.patternId = filters.patternId;
  if (filters.colorId) params.colorId = filters.colorId;
  if (filters.styleId) params.styleId = filters.styleId;
  if (filters.fit) params.fit = filters.fit;
  if (filters.formalityLevel) params.formalityLevel = filters.formalityLevel;
  if (filters.includeArchived) params.includeArchived = 'true';
  if (filters.favoritesOnly) params.favoritesOnly = 'true';

  const { data } = await apiClient.get<{ items: ClothingItem[] }>('/closet', { params });
  return data.items;
}

export async function uploadClothingItemImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);

  // Let the browser set the multipart Content-Type (with the correct boundary)
  // instead of the client's default 'application/json' header.
  const { data } = await apiClient.post<{ imageUrl: string }>('/closet/images', formData, {
    headers: { 'Content-Type': undefined },
  });
  return data.imageUrl;
}

export async function createClothingItem(payload: CreateClothingItemPayload): Promise<ClothingItem> {
  const { data } = await apiClient.post<{ item: ClothingItem }>('/closet', payload);
  return data.item;
}

export async function updateClothingItem(
  id: string,
  payload: UpdateClothingItemPayload,
): Promise<ClothingItem> {
  const { data } = await apiClient.patch<{ item: ClothingItem }>(`/closet/${id}`, payload);
  return data.item;
}

export async function deleteClothingItem(id: string): Promise<void> {
  await apiClient.delete(`/closet/${id}`);
}

export async function archiveClothingItem(id: string): Promise<ClothingItem> {
  const { data } = await apiClient.patch<{ item: ClothingItem }>(`/closet/${id}/archive`);
  return data.item;
}

export async function restoreClothingItem(id: string): Promise<ClothingItem> {
  const { data } = await apiClient.patch<{ item: ClothingItem }>(`/closet/${id}/restore`);
  return data.item;
}

export async function favoriteClothingItem(id: string): Promise<ClothingItem> {
  const { data } = await apiClient.patch<{ item: ClothingItem }>(`/closet/${id}/favorite`);
  return data.item;
}

export async function unfavoriteClothingItem(id: string): Promise<ClothingItem> {
  const { data } = await apiClient.patch<{ item: ClothingItem }>(`/closet/${id}/unfavorite`);
  return data.item;
}
