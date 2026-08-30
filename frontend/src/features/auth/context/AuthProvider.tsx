import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '@/features/auth/context/AuthContext';
import {
  changePassword,
  fetchCurrentUser,
  loginUser,
  registerUser,
  updateProfile,
} from '@/features/auth/services/authService';
import type {
  AuthUser,
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
} from '@/features/auth/types/auth.types';
import { ACCESS_TOKEN_STORAGE_KEY } from '@/utils/storageKeys';

const CURRENT_USER_QUERY_KEY = ['auth', 'me'] as const;

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY),
  );

  const currentUserQuery = useQuery<AuthUser>({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: fetchCurrentUser,
    enabled: Boolean(token),
    retry: false,
    // Not Infinity: an admin can deactivate this account mid-session (the
    // backend enforces this on login and on GET /auth/me), and with an
    // infinite staleTime this query would never revalidate on its own,
    // leaving the UI showing a stale "authenticated" state until a hard
    // reload. A finite staleTime lets refetch-on-focus pick up a
    // deactivation and log the user out. Not 0 either: login/register seed
    // this query directly via setQueryData, and an immediately-stale query
    // would trigger a redundant (and in this app's tests, unmocked) refetch
    // the instant `enabled` flips true right after that seed.
    staleTime: 60_000,
  });

  useEffect(() => {
    if (token && currentUserQuery.isError) {
      // apiClient reads the token fresh from localStorage on every request
      // (not from this `token` state), so clearing it here already stops
      // the invalid token from being sent again. `isAuthenticated` is
      // already false too, since currentUserQuery.data is unset on error.
      // Also clear the rest of the cache, for the same cross-session
      // isolation reason as login/logout.
      localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
      queryClient.clear();
    }
  }, [token, currentUserQuery.isError, queryClient]);

  // Every other feature's cached data (closet items, outfits, doll profile,
  // admin views, ...) is scoped server-side by the JWT's user id, but the
  // query keys themselves don't include that id. Without clearing the whole
  // cache on a session change, a second person logging in on the same tab
  // (no full page reload) would briefly see the previous account's cached
  // data. login/register clear before seeding the fresh user so that seed
  // survives the clear.
  const login = useCallback(
    async (payload: LoginPayload) => {
      const { user, token: newToken } = await loginUser(payload);
      queryClient.clear();
      localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, newToken);
      setToken(newToken);
      queryClient.setQueryData(CURRENT_USER_QUERY_KEY, user);
    },
    [queryClient],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const { user, token: newToken } = await registerUser(payload);
      queryClient.clear();
      localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, newToken);
      setToken(newToken);
      queryClient.setQueryData(CURRENT_USER_QUERY_KEY, user);
    },
    [queryClient],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    setToken(null);
    queryClient.clear();
  }, [queryClient]);

  const handleUpdateProfile = useCallback(
    async (payload: UpdateProfilePayload) => {
      const updatedUser = await updateProfile(payload);
      queryClient.setQueryData(CURRENT_USER_QUERY_KEY, updatedUser);
    },
    [queryClient],
  );

  const handleChangePassword = useCallback(async (payload: ChangePasswordPayload) => {
    await changePassword(payload);
  }, []);

  const user = currentUserQuery.data ?? null;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading: Boolean(token) && currentUserQuery.isPending,
        login,
        register,
        logout,
        updateProfile: handleUpdateProfile,
        changePassword: handleChangePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
