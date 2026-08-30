import { apiClient } from '@/services/api/apiClient';
import type {
  GenerateRecommendationsPayload,
  GenerateRecommendationsResult,
} from '@/features/inspireMe/types/inspireMe.types';

export async function generateRecommendations(
  payload: GenerateRecommendationsPayload,
): Promise<GenerateRecommendationsResult> {
  const { data } = await apiClient.post<GenerateRecommendationsResult>('/inspire-me/generate', payload);
  return data;
}
