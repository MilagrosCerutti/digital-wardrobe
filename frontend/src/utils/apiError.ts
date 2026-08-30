import { isAxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/api';

const FALLBACK_MESSAGE = 'Something went wrong. Please try again.';

export function getApiErrorMessage(error: unknown): string {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.error ?? FALLBACK_MESSAGE;
  }
  return FALLBACK_MESSAGE;
}
