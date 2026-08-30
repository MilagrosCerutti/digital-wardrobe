import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as adminService from '@/features/admin/services/adminService';
import type { CatalogType, UpdateDollItemPayload } from '@/features/admin/types/admin.types';

const USERS_QUERY_KEY = ['admin', 'users'] as const;
const CATALOG_QUERY_KEY = ['admin', 'catalog'] as const;
const DOLL_ITEMS_QUERY_KEY = ['admin', 'dollItems'] as const;

// The public catalog (`useCatalogQuery`, consumed by Closet/Style It/Inspire
// Me) is fetched with staleTime: Infinity, so it never revalidates on its
// own - an admin's changes here would otherwise never be reflected for an
// already-open tab without a hard reload. Same reasoning for the public
// doll items list. Admin mutations invalidate both the admin-only view and
// these public ones.
const PUBLIC_CATALOG_QUERY_KEY = ['catalog'] as const;
const PUBLIC_DOLL_ITEMS_QUERY_KEY = ['doll', 'items'] as const;

export function useAdminUsersQuery() {
  return useQuery({ queryKey: USERS_QUERY_KEY, queryFn: adminService.fetchUsers });
}

function useInvalidate(...queryKeys: (readonly unknown[])[]) {
  const queryClient = useQueryClient();
  return () => queryKeys.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
}

export function useActivateUserMutation() {
  const invalidate = useInvalidate(USERS_QUERY_KEY);
  return useMutation({ mutationFn: adminService.activateUser, onSuccess: invalidate });
}

export function useDeactivateUserMutation() {
  const invalidate = useInvalidate(USERS_QUERY_KEY);
  return useMutation({ mutationFn: adminService.deactivateUser, onSuccess: invalidate });
}

export function useAdminCatalogQuery() {
  return useQuery({ queryKey: CATALOG_QUERY_KEY, queryFn: adminService.fetchAdminCatalog });
}

export function useCreateCatalogEntryMutation() {
  const invalidate = useInvalidate(CATALOG_QUERY_KEY, PUBLIC_CATALOG_QUERY_KEY);
  return useMutation({ mutationFn: adminService.createCatalogEntry, onSuccess: invalidate });
}

export function useSetCatalogEntryActiveMutation() {
  const invalidate = useInvalidate(CATALOG_QUERY_KEY, PUBLIC_CATALOG_QUERY_KEY);
  return useMutation({
    mutationFn: ({ type, id, isActive }: { type: CatalogType; id: string; isActive: boolean }) =>
      isActive ? adminService.activateCatalogEntry(type, id) : adminService.deactivateCatalogEntry(type, id),
    onSuccess: invalidate,
  });
}

export function useAdminDollItemsQuery() {
  return useQuery({ queryKey: DOLL_ITEMS_QUERY_KEY, queryFn: adminService.fetchDollItems });
}

export function useCreateDollItemMutation() {
  const invalidate = useInvalidate(DOLL_ITEMS_QUERY_KEY, PUBLIC_DOLL_ITEMS_QUERY_KEY);
  return useMutation({ mutationFn: adminService.createDollItem, onSuccess: invalidate });
}

export function useUpdateDollItemMutation() {
  const invalidate = useInvalidate(DOLL_ITEMS_QUERY_KEY, PUBLIC_DOLL_ITEMS_QUERY_KEY);
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDollItemPayload }) =>
      adminService.updateDollItem(id, payload),
    onSuccess: invalidate,
  });
}

export function useSetDollItemActiveMutation() {
  const invalidate = useInvalidate(DOLL_ITEMS_QUERY_KEY, PUBLIC_DOLL_ITEMS_QUERY_KEY);
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      isActive ? adminService.activateDollItem(id) : adminService.deactivateDollItem(id),
    onSuccess: invalidate,
  });
}
