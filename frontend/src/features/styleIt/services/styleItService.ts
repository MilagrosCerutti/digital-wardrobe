import { apiClient } from '@/services/api/apiClient';
import type {
  CompatibilityResult,
  CreateOutfitPayload,
  Outfit,
} from '@/features/styleIt/types/styleIt.types';

export async function previewOutfit(clothingItemIds: string[]): Promise<CompatibilityResult> {
  const { data } = await apiClient.post<CompatibilityResult>('/outfits/preview', { clothingItemIds });
  return data;
}

export async function createOutfit(payload: CreateOutfitPayload): Promise<Outfit> {
  const { data } = await apiClient.post<{ outfit: Outfit }>('/outfits', payload);
  return data.outfit;
}
