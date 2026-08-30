import { apiClient } from '@/services/api/apiClient';
import type {
  DollItem,
  DollProfile,
  UpdateDollAppearancePayload,
} from '@/features/doll/types/doll.types';

export async function fetchDollProfile(): Promise<DollProfile> {
  const { data } = await apiClient.get<DollProfile>('/doll');
  return data;
}

export async function fetchDollItems(): Promise<DollItem[]> {
  const { data } = await apiClient.get<{ items: DollItem[] }>('/doll/items');
  return data.items;
}

export async function updateDollAppearance(
  payload: UpdateDollAppearancePayload,
): Promise<DollProfile['doll']> {
  const { data } = await apiClient.patch<{ doll: DollProfile['doll'] }>('/doll', payload);
  return data.doll;
}

export async function equipDollItem(dollItemId: string): Promise<DollProfile> {
  const { data } = await apiClient.post<DollProfile>('/doll/equipment', { dollItemId });
  return data;
}

export async function unequipDollItem(dollItemId: string): Promise<DollProfile> {
  const { data } = await apiClient.delete<DollProfile>(`/doll/equipment/${dollItemId}`);
  return data;
}
