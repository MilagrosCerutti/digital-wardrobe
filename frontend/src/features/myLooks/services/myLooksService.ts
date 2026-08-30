import { apiClient } from '@/services/api/apiClient';
import type { Outfit } from '@/features/myLooks/types/myLooks.types';

export async function fetchOutfits(): Promise<Outfit[]> {
  const { data } = await apiClient.get<{ outfits: Outfit[] }>('/outfits');
  return data.outfits;
}

export async function deleteOutfit(id: string): Promise<void> {
  await apiClient.delete(`/outfits/${id}`);
}
