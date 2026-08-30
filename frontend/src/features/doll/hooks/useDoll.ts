import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  equipDollItem,
  fetchDollItems,
  fetchDollProfile,
  unequipDollItem,
  updateDollAppearance,
} from '@/features/doll/services/dollService';
import type { DollProfile } from '@/features/doll/types/doll.types';

const DOLL_PROFILE_QUERY_KEY = ['doll', 'profile'] as const;
const DOLL_ITEMS_QUERY_KEY = ['doll', 'items'] as const;

export function useDollProfileQuery() {
  return useQuery({ queryKey: DOLL_PROFILE_QUERY_KEY, queryFn: fetchDollProfile });
}

export function useDollItemsQuery() {
  return useQuery({ queryKey: DOLL_ITEMS_QUERY_KEY, queryFn: fetchDollItems });
}

export function useUpdateDollAppearanceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDollAppearance,
    onSuccess: (doll) => {
      queryClient.setQueryData<DollProfile>(DOLL_PROFILE_QUERY_KEY, (current) =>
        current ? { ...current, doll } : current,
      );
    },
  });
}

export function useEquipDollItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: equipDollItem,
    onSuccess: (profile) => {
      queryClient.setQueryData(DOLL_PROFILE_QUERY_KEY, profile);
    },
  });
}

export function useUnequipDollItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unequipDollItem,
    onSuccess: (profile) => {
      queryClient.setQueryData(DOLL_PROFILE_QUERY_KEY, profile);
    },
  });
}
