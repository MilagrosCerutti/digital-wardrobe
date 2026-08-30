import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from './AuthProvider';
import { useAuth } from './AuthContext';
import * as authService from '@/features/auth/services/authService';
import { ACCESS_TOKEN_STORAGE_KEY } from '@/utils/storageKeys';

vi.mock('@/features/auth/services/authService');
const mockedAuthService = vi.mocked(authService);

const AUTH_USER = {
  id: 'user-1',
  firstName: 'Mila',
  lastName: 'Cerutti',
  email: 'mila@example.com',
  role: 'USER' as const,
  status: 'ACTIVE' as const,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function renderWithAuth(queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })) {
  function Consumer() {
    const { user, isAuthenticated, isLoading, login, logout, updateProfile, changePassword } = useAuth();
    return (
      <div>
        <span data-testid="loading">{String(isLoading)}</span>
        <span data-testid="authenticated">{String(isAuthenticated)}</span>
        <span data-testid="user-email">{user?.email ?? 'none'}</span>
        <span data-testid="user-firstName">{user?.firstName ?? 'none'}</span>
        <button onClick={() => login({ email: 'mila@example.com', password: 'correct-password1' })}>
          login
        </button>
        <button onClick={logout}>logout</button>
        <button onClick={() => updateProfile({ firstName: 'Milagros' })}>updateProfile</button>
        <button
          onClick={() => changePassword({ currentPassword: 'old-password1', newPassword: 'new-password1' })}
        >
          changePassword
        </button>
      </div>
    );
  }

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('starts unauthenticated with no stored token', () => {
    renderWithAuth();

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
  });

  it('logs in, stores the token, and exposes the authenticated user', async () => {
    const user = userEvent.setup();
    mockedAuthService.loginUser.mockResolvedValue({ user: AUTH_USER, token: 'a-token' });
    renderWithAuth();

    await user.click(screen.getByText('login'));

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });
    expect(screen.getByTestId('user-email')).toHaveTextContent('mila@example.com');
    expect(localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)).toBe('a-token');
  });

  it('logs out and clears the stored token', async () => {
    const user = userEvent.setup();
    mockedAuthService.loginUser.mockResolvedValue({ user: AUTH_USER, token: 'a-token' });
    renderWithAuth();
    await user.click(screen.getByText('login'));
    await waitFor(() => expect(screen.getByTestId('authenticated')).toHaveTextContent('true'));

    await user.click(screen.getByText('logout'));

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)).toBeNull();
  });

  it('clears other features cached data on logout, so a second user on the same tab starts fresh (regression: cross-user cache leak)', async () => {
    const user = userEvent.setup();
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    mockedAuthService.loginUser.mockResolvedValue({ user: AUTH_USER, token: 'a-token' });
    renderWithAuth(queryClient);
    await user.click(screen.getByText('login'));
    await waitFor(() => expect(screen.getByTestId('authenticated')).toHaveTextContent('true'));

    // Simulate another feature (e.g. closet items) having cached this user's data.
    queryClient.setQueryData(['closet', 'items', {}], [{ id: 'item-belonging-to-mila' }]);
    expect(queryClient.getQueryData(['closet', 'items', {}])).toBeDefined();

    await user.click(screen.getByText('logout'));

    expect(queryClient.getQueryData(['closet', 'items', {}])).toBeUndefined();
  });

  it('clears stale cached data from a previous session when a new user logs in on the same tab', async () => {
    const user = userEvent.setup();
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(['closet', 'items', {}], [{ id: 'item-belonging-to-someone-else' }]);
    mockedAuthService.loginUser.mockResolvedValue({ user: AUTH_USER, token: 'a-token' });

    renderWithAuth(queryClient);
    await user.click(screen.getByText('login'));

    await waitFor(() => expect(screen.getByTestId('authenticated')).toHaveTextContent('true'));
    expect(queryClient.getQueryData(['closet', 'items', {}])).toBeUndefined();
  });

  it('rehydrates the session from a stored token on mount', async () => {
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, 'existing-token');
    mockedAuthService.fetchCurrentUser.mockResolvedValue(AUTH_USER);

    renderWithAuth();

    expect(screen.getByTestId('loading')).toHaveTextContent('true');
    await waitFor(() => expect(screen.getByTestId('authenticated')).toHaveTextContent('true'));
  });

  it('treats an invalid stored token as logged out', async () => {
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, 'stale-token');
    mockedAuthService.fetchCurrentUser.mockRejectedValue(new Error('401'));

    await act(async () => {
      renderWithAuth();
    });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });
  });

  it('updates the cached user after a successful profile update', async () => {
    const user = userEvent.setup();
    mockedAuthService.loginUser.mockResolvedValue({ user: AUTH_USER, token: 'a-token' });
    mockedAuthService.updateProfile.mockResolvedValue({ ...AUTH_USER, firstName: 'Milagros' });
    renderWithAuth();
    await user.click(screen.getByText('login'));
    await waitFor(() => expect(screen.getByTestId('authenticated')).toHaveTextContent('true'));

    await user.click(screen.getByText('updateProfile'));

    await waitFor(() => expect(screen.getByTestId('user-firstName')).toHaveTextContent('Milagros'));
    expect(mockedAuthService.updateProfile).toHaveBeenCalledWith({ firstName: 'Milagros' });
  });

  it('calls the change password service without altering the cached user', async () => {
    const user = userEvent.setup();
    mockedAuthService.loginUser.mockResolvedValue({ user: AUTH_USER, token: 'a-token' });
    mockedAuthService.changePassword.mockResolvedValue(undefined);
    renderWithAuth();
    await user.click(screen.getByText('login'));
    await waitFor(() => expect(screen.getByTestId('authenticated')).toHaveTextContent('true'));

    await user.click(screen.getByText('changePassword'));

    await waitFor(() =>
      expect(mockedAuthService.changePassword).toHaveBeenCalledWith({
        currentPassword: 'old-password1',
        newPassword: 'new-password1',
      }),
    );
    expect(screen.getByTestId('user-email')).toHaveTextContent('mila@example.com');
  });
});
